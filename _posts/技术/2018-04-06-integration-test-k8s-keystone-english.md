---
layout: post
title: Integration Test of Kubernetes and Keystone - English Version
category: 技术
---

本博客于2018.04.21号被 OpenStack Superuser 收录，[这里](https://superuser.openstack.org/articles/kubernetes-keystone-integration-test/)是链接。

At [Catalyst Cloud](https://catalystcloud.nz/) we are going to deploy Magnum service in our OpenStack based public cloud in New Zealand. [Magnum](https://docs.openstack.org/magnum/latest/) is an OpenStack service offering Container Clusters as a service, with support for Docker Swarm, Kubernetes, Mesos or DC/OS(Catalyst Cloud will support Kubernetes at the first step). Users of the service can deploy clusters of thousands of nodes in minutes, and access them securely using their native APIs.

One of the feature requests coming from our existing customers is integration with OpenStack Keystone for both authentication and authorization so that the existing users within a tenant could have access to Kubernetes cluster created by the tenant administrator in Magnum without too much extra user management configuration inside the Kubernetes cluster. We(development team in Catalyst Cloud) tested the integration between Keystone and Kubernetes, after some bugfix and improvements, it works perfectly fine!

Before I actually walk you through, you might want to look at a [blog post](http://superuser.openstack.org/articles/keystone-authentication-kubernetes-cluster/) about Keystone authentication in Kubernetes clusters by [Saverio Proto](http://superuser.openstack.org/articles/author/saverioproto/) from [SWITCH](https://cloudblog.switch.ch/). Here in this tutorial, we’ll talk about authentication **and** authorization, making the authorization configuration is very easy and flexible, especially after [this pull request](https://github.com/kubernetes/cloud-provider-openstack/pull/79) merged.

One last note before starting: I’d also like to give huge thanks to [OpenLab](https://openlabtesting.org/), all of our tests are performed on infrastructure that they provided.

## Prerequisites

- An OpenStack deployment. I'm using devstack to set up the OpenStack cloud of Queens release for the test.
- We’re assuming that users for this tutorial already use OpenStack. In the real world, there are several types of users:
  - Cloud operators responsible for cloud operation and maintenance
  - Kubernetes cluster admin users who can create/delete Kubernetes cluster in OpenStack cloud and who are also administrators of the Kubernetes cluster
  - Kubernetes cluster normal users who can use the cluster resources, including, maybe different users with different authorities
- Kubernetes version >= v1.9.3. For testing purpose, I won't use Magnum in this post, the Kubernetes cluster admin can create the cluster in VMs by using kubeadm.
- kubectl version >=v1.8.0. As Saverio Proto said in his blog post, kubectl has been capable of reading the openstack env variables since v1.8.0

## Basic workflow

### From the perspective of OpenStack cloud operator

As cloud operator, there are some tasks to perform before exposing the Keystone authentication and authorization functionality to Kubernetes cluster admin:

- Necessary Keystone roles for Kubernetes cluster operations need to be created for different users, e.g. k8s-admin, k8s-editor, k8s-viewer
  - `k8s-admin` role can create/update/delete Kubernetes cluster, can also associate roles to other normal users within the tenant
  - `k8s-editor` can create/update/delete/watch Kubernetes cluster resources
  - `k8s-viewer` can only have read access to Kubernetes cluster resources

```bash
source ~/openstack_admin_credentials
for role in "k8s-admin" "k8s-viewer" "k8s-editor"; do openstack role create $role; done
openstack role add --user demo --project demo k8s-viewer
openstack user create demo_editor --project demo --password password
openstack role add --user demo_editor --project demo k8s-editor
openstack user create demo_admin --project demo --password password
openstack role add --user demo_admin --project demo k8s-admin
```

### From the perspective of Kubernetes cluster admin

In this example, `demo_admin` user is Kubernetes cluster admin in the `demo` tenant. `demo_admin` user is responsible for creating Kubernetes cluster inside the VMs, it could be done easily with Saverio Proto’s [repo](https://github.com/zioproto/k8s-on-openstack/), I also have an ugly ansible script repo [here](https://github.com/lingxiankong/kubernetes_study/tree/master/installation/ansible/version_3).

After Kubernetes cluster is up and running, cluster admin should make some configuration for Keystone authentication and authorization to work.

1. Define Keystone authorization policy file.

   ```bash
   cat << EOF > /etc/kubernetes/pki/webhookpolicy.json
   [
     {
       "resource": {
         "verbs": ["get", "list", "watch"],
         "resources": ["pods"],
         "version": "*",
         "namespace": "default"
       },
       "match": [
         {
           "type": "role",
           "values": ["k8s-admin", "k8s-viewer", "k8s-editor"]
         },
         {
           "type": "project",
           "values": ["demo"]
         }
       ]
     },
     {
       "resource": {
         "verbs": ["create", "update", "delete"],
         "resources": ["pods"],
         "version": "*",
         "namespace": "default"
       },
       "match": [
         {
           "type": "role",
           "values": ["k8s-admin", "k8s-editor"]
         },
         {
           "type": "project",
           "values": ["demo"]
         }
       ]
     }
   ]
   EOF
   ```

   As an example, the above policy file definition is pretty straightforward. The Kubernetes cluster can only be accessed by the users in demo tenant, users with k8s-admin or k8s-editor role have both write and read permission to the pod resource, but users with k8s-viewer role can only get/list/watch pods.

2. Deploy k8s-keystone-auth service

   The implementation of k8s-keystone-auth service locates in the [OpenStack cloud provider repo](https://github.com/kubernetes/cloud-provider-openstack) for Kubernetes. It's running as a static pod(managed by kubelet) in the Kubernetes cluster.

   ```bash
   cat << EOF > /etc/kubernetes/manifests/k8s-keystone-auth.yaml
   ---
   apiVersion: v1
   kind: Pod
   metadata:
     annotations:
       scheduler.alpha.kubernetes.io/critical-pod: ""
     labels:
       component: k8s-keystone-auth
       tier: control-plane
     name: k8s-keystone-auth
     namespace: kube-system
   spec:
     containers:
       - name: k8s-keystone-auth
         image: lingxiankong/k8s-keystone-auth:authorization-improved
         imagePullPolicy: Always
         args:
           - ./bin/k8s-keystone-auth
           - --tls-cert-file
           - /etc/kubernetes/pki/apiserver.crt
           - --tls-private-key-file
           - /etc/kubernetes/pki/apiserver.key
           - --keystone-policy-file
           - /etc/kubernetes/pki/webhookpolicy.json
           - --keystone-url
           - http://10.0.19.138/identity/v3
         volumeMounts:
           - mountPath: /etc/kubernetes/pki
             name: k8s-certs
             readOnly: true
           - mountPath: /etc/ssl/certs
             name: ca-certs
             readOnly: true
         resources:
           requests:
             cpu: 200m
         ports:
           - containerPort: 8443
             hostPort: 8443
             name: https
             protocol: TCP
     hostNetwork: true
     volumes:
     - hostPath:
         path: /etc/kubernetes/pki
         type: DirectoryOrCreate
       name: k8s-certs
     - hostPath:
         path: /etc/ssl/certs
         type: DirectoryOrCreate
       name: ca-certs
   status: {}
   EOF
   ```

   The image is built using the Dockerfile in the cloud-provider-openstack repo, you can build your own image if needed. Please replace the `keystone-url` param pointing to your own OpenStack cloud.

3. Config authentication and authorization [webhook](https://kubernetes.io/docs/admin/authentication/#webhook-token-authentication) for Kubernetes API server, wait for API server to be running.

   ```bash
   cat << EOF > /etc/kubernetes/pki/webhookconfig.yaml
   ---
   apiVersion: v1
   kind: Config
   preferences: {}
   clusters:
     - cluster:
         insecure-skip-tls-verify: true
         server: https://localhost:8443/webhook
       name: webhook
   users:
     - name: webhook
   contexts:
     - context:
         cluster: webhook
         user: webhook
       name: webhook
   current-context: webhook
   EOF
   sed -i "/authorization-mode/c \ \ \ \ - --authorization-mode=Node,Webhook,RBAC" /etc/kubernetes/manifests/kube-apiserver.yaml
   sed -i '/image:/ i \ \ \ \ - --authentication-token-webhook-config-file=/etc/kubernetes/pki/webhookconfig.yaml' /etc/kubernetes/manifests/kube-apiserver.yaml
   sed -i '/image:/ i \ \ \ \ - --authorization-webhook-config-file=/etc/kubernetes/pki/webhookconfig.yaml' /etc/kubernetes/manifests/kube-apiserver.yaml
   ```

Now, the Kubernetes cluster is ready to use for the users within the demo tenant in OpenStack.

### From the perspective of Kubernetes cluster user

The cluster users only need to config the kubectl to work with OpenStack environment variables.

```bash
kubectl config set-credentials openstackuser --auth-provider=openstack
kubectl config set-context --cluster=kubernetes --user=openstackuser openstackuser@kubernetes --namespace=default
kubectl config use-context openstackuser@kubernetes
```

1. `demo` user can list pods but can not create pod.

   ```bash
   $ source ~/openrc_demo
   $ kubectl get pods
   No resources found.
   $ cat << EOF > ~/test_pod.yaml
   ---
   apiVersion: v1
   kind: Pod
   metadata:
     name: busybox-test
     namespace: default
   spec:
     containers:
     - name: busybox
       image: busybox
       command:
         - sleep
         - "3600"
       imagePullPolicy: IfNotPresent
     restartPolicy: Never
   EOF
   $ kubectl create -f ~/test_pod.yaml
   Error from server (Forbidden): error when creating "test_pod.yaml": pods is forbidden: User "demo" cannot create pods in the namespace "default"
   ```

2. `demo_editor` user can create and list pods.

   ```bash
   $ source ~/openrc_demoeditor
   $ kubectl create -f ~/test_pod.yaml
   pod "busybox-test" created
   $ kubectl get pods
   NAME           READY     STATUS    RESTARTS   AGE
   busybox-test   1/1       Running   0          3s
   ```

3. users from other tenants don't have access to the Kubernetes cluster

   ```bash
   $ source ~/openrc_alt_demo
   $ kubectl get pods
   Error from server (Forbidden): pods is forbidden: User "alt_demo" cannot list pods in the namespace "default"
   ```

## All in one - live demo

[![asciicast](https://asciinema.org/a/2dgnfMUjTSZktjzDRt25wO9Yb.png)](https://asciinema.org/a/2dgnfMUjTSZktjzDRt25wO9Yb?speed=2&cols=150&rows=50)

## Future work

1. We ([Catalyst Cloud](https://catalystcloud.nz/)) are working on automating all the manual steps in Magnum, so in the near future, the Kubernetes cluster admin only need to run a single command to create the cluster and Magnum will perform the rest automatically
2. Continue to work with [sig-openstack](https://github.com/kubernetes/community/tree/master/sig-openstack) group to keep improving stability and performance of the integration
