---
layout: post
title: Introduce magnum-auto-healer - Autohealing solution for OpenStack Magnum cluster
category: 技术
---

# Introduce magnum-auto-healer - Auto-healing solution for OpenStack Magnum cluster

## What is magnum-auto-healer

Kubernetes is self-healing container orchestration platform that will detect failures from your pods and redeploy that workload, however, magnum-auto-healer is a self-healing cluster management service that will automatically recover a failed master or worker node within your [Magnum](https://docs.openstack.org/magnum/latest/) cluster. Basically, magnum-auto-healer ensures the running Kubernetes nodes are healthy by monitoring the nodes' status periodically, searching for unhealthy instances and triggering replacements when needed, maximizing your cluster's high availability and reliability, and protecting your application from downtime when the node it's running on fails.

The other side of concerns for Kubernetes cluster is scalability. Kubernetes [cluster-autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler) can scale the worker pools in your cluster automatically to increase or decrease the number of worker nodes based on the sizing needs of the scheduled workloads. cluster-autoscaler periodically scans the cluster to adjust the number of worker nodes in response to your workload resource requests and any custom settings that you configure, such as scanning intervals. The main purpose of cluster-autoscaler is autoscaling, not autohealing. There is also a [Magnum driver](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler/cloudprovider/magnum) for cluster-autoscaler, cluster-autoscaler can be deployed together with magnum-auto-healer.

Like cluster-autoscaler, magnum-auto-healer is supposed to run together with cloud providers as well, [OpenStack Magnum](https://docs.openstack.org/magnum/latest/user/) is supported as the reference implementation.

## Why magnum-auto-healer

In the current Kubernetes design, one major downside for developers is that Kubernetes is not able to auto-manage its own machines. As a consequence, operations must get involved every time a worker node is failed, such as the kubelet service hangs, some hardware failure, etc. So we(Catalyst Cloud) developed the magnum-auto-healer to enable node auto-repair process, the purpose of this service is much similar to [auto-repairing](https://cloud.google.com/kubernetes-engine/docs/how-to/node-auto-repair) feature in GKE(Google Kubernetes Engine) but the main difference is that magnum-auto-healer is fully [open source](https://github.com/kubernetes/cloud-provider-openstack) and has a pluggable mechanism aiming at supporting different cloud providers.

Besides the on-premise solutions like GKE node auto-repair, currently, there are some other open source projects are doing the similar thing, e.g. [OpenShift machine healthcheck controller](https://github.com/openshift/machine-api-operator/#machine-healthcheck-controller). However, most of these existing solutions integrate with Kubernetes so tightly by defining CRD resources and managing the node resources on their own. On the contrary, the magnum-auto-healer is assumed to be running in the cloud environment, which means the Kubernetes cluster(and all its nodes) is created and managed by the cloud service API, the source of truth of the cluster information comes from the cloud rather than the Kubernetes cluster. As a result, magnum-auto-healer is designed as a light-weight service that needs to coordinate with the cloud environment for the auto-healing purpose.

## magnum-auto-healer design

There are some considerations when we were designing the magnum-auto-healer service:

- We want to have a single component for the cluster auto-healing purpose. There are already some other components out there in the community to deal with some specific tasks separately, combining them together with some customization may work, but will lead to much complexity and maintenance overhead.
- Support both master nodes and worker nodes.
- Cluster administrator is able to disable the autohealing feature on the fly, which is very important for the cluster operations like upgrade or scheduled maintenance.
- The Kubernetes cluster is not necessary to be exposed to either the public or the OpenStack control plane. For example, In Magnum, the end user may create a private cluster which is not accessible even from Magnum control services.
- The health check should be pluggable. Deployers should be able to write their own health check plugin with customized health check parameters.
- Support different cloud providers.

## Deploying and testing magnum-auto-healer

### Prerequisites

1. A multi-node cluster(3 masters and 3 workers) is created in OpenStack Magnum.

    ```
    $ openstack coe cluster list
    +--------------------------------------+-----------------------------+-----------------+------------+--------------+-----------------+
    | uuid                                 | name                        | keypair         | node_count | master_count | status          |
    +--------------------------------------+-----------------------------+-----------------+------------+--------------+-----------------+
    | c418c335-0e52-42fc-bd68-baa8d264e072 | lingxian_por_test_1.12.7_ha | lingxian_laptop |          3 |            3 | CREATE_COMPLETE |
    +--------------------------------------+-----------------------------+-----------------+------------+--------------+-----------------+
    $ openstack server list --name lingxian-por-test-1-12-7-ha
    +--------------------------------------+---------------------------------------------------+--------+-----------------------------------------+-------------------------+---------+
    | ID                                   | Name                                              | Status | Networks                                | Image                   | Flavor  |
    +--------------------------------------+---------------------------------------------------+--------+-----------------------------------------+-------------------------+---------+
    | 908957c2-ac88-4b54-a1fc-91f9cc8f98f1 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-2 | ACTIVE | lingxian_net=10.0.10.33, 150.242.42.234 | fedora-atomic-27-x86_64 | c1.c4r8 |
    | 8f0c3ad9-caf5-45b6-bf3a-97b3bb6de623 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-0 | ACTIVE | lingxian_net=10.0.10.32, 150.242.42.233 | fedora-atomic-27-x86_64 | c1.c4r8 |
    | a6ae4cee-7cf2-4b25-89bc-a5c6cb2c364d | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-1 | ACTIVE | lingxian_net=10.0.10.34, 150.242.42.245 | fedora-atomic-27-x86_64 | c1.c4r8 |
    | 2af96203-cc6f-4b55-8fb2-062340207ebb | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-2 | ACTIVE | lingxian_net=10.0.10.31, 150.242.42.226 | fedora-atomic-27-x86_64 | c1.c2r4 |
    | 10bef366-b5a8-4400-b2c3-82188ec06b13 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-1 | ACTIVE | lingxian_net=10.0.10.30, 150.242.42.22  | fedora-atomic-27-x86_64 | c1.c2r4 |
    | 9c17f034-6825-4e49-b3cb-0ecddd1a8dd8 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-0 | ACTIVE | lingxian_net=10.0.10.29, 150.242.42.213 | fedora-atomic-27-x86_64 | c1.c2r4 |
    +--------------------------------------+---------------------------------------------------+--------+-----------------------------------------+-------------------------+---------+
    ```

2. The kubeconfig file of the cluster is in place.

### Deploy magnum-auto-healer

It's recommended to run magnum-auto-healer service as a DaemonSet on the master nodes, the service is running in active-passive mode using leader election mechanism. There is a sample manifest file [here](https://github.com/kubernetes/cloud-provider-openstack/blob/master/manifests/magnum-auto-healer/magnum-auto-healer.yaml), you need to change some variables as needed before actually running `kubectl apply` command. The following commands are just examples:

```shell
magnum_cluster_uuid=c418c335-0e52-42fc-bd68-baa8d264e072
keystone_auth_url=https://api.nz-por-1.catalystcloud.io:5000/v3
user_id=ceb61464a3d341ebabdf97d1d4b97099
user_project_id=b23a5e41d1af4c20974bf58b4dff8e5a
password=password
region=RegionOne
image=lingxiankong/magnum-auto-healer:0.1.0

cat <<EOF | kubectl apply -f -
---
kind: ServiceAccount
apiVersion: v1
metadata:
  name: magnum-auto-healer
  namespace: kube-system

---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: magnum-auto-healer
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: magnum-auto-healer
    namespace: kube-system

---
kind: ConfigMap
apiVersion: v1
metadata:
  name: magnum-auto-healer-config
  namespace: kube-system
data:
  config.yaml: |
    cluster-name: ${magnum_cluster_uuid}
    dry-run: false
    monitor-interval: 15s
    check-delay-after-add: 20m
    leader-elect: true
    healthcheck:
      master:
        - type: Endpoint
          params:
            unhealthyDuration: 30s
            protocol: HTTPS
            port: 6443
            endpoints: ["/healthz"]
            okCodes: [200]
        - type: NodeCondition
          params:
            unhealthyDuration: 1m
            types: ["Ready"]
            okValues: ["True"]
      worker:
        - type: NodeCondition
          params:
            unhealthyDuration: 1m
            types: ["Ready"]
            okValues: ["True"]
    openstack:
      auth-url: ${keystone_auth_url}
      user-id: ${user_id}
      project-id: ${user_project_id}
      password: ${password}
      region: ${region}

---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: magnum-auto-healer
  namespace: kube-system
  labels:
    k8s-app: magnum-auto-healer
spec:
  selector:
    matchLabels:
      k8s-app: magnum-auto-healer
  template:
    metadata:
      labels:
        k8s-app: magnum-auto-healer
    spec:
      serviceAccountName: magnum-auto-healer
      tolerations:
        - effect: NoSchedule
          operator: Exists
        - key: CriticalAddonsOnly
          operator: Exists
        - effect: NoExecute
          operator: Exists
      nodeSelector:
        node-role.kubernetes.io/master: ""
      containers:
        - name: magnum-auto-healer
          image: ${image}
          imagePullPolicy: Always
          args:
            - /bin/magnum-auto-healer
            - --config=/etc/magnum-auto-healer/config.yaml
            - --v
            - "2"
          volumeMounts:
            - name: config
              mountPath: /etc/magnum-auto-healer
      volumes:
        - name: config
          configMap:
            name: magnum-auto-healer-config
EOF
```

### Testing magnum-auto-healer

You could ssh into a worker node(`lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-1` in this example) and stop the kubelet service to simulate the worker node failure. The node status check is implemented in `NodeCondition` health check plugin(see configuration above).

```shell
$ ssh fedora@150.242.42.245
[fedora@lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-1 ~]$ sudo systemctl stop kubelet
```

Now waiting for the magnum-auto-healer to detect the node failure and trigger the repair process. First, you would see the unhealthy node is shutdown:

```shell
+--------------------------------------+---------------------------------------------------+---------+-----------------------------------------+-------------------------+---------+
| ID                                   | Name                                              | Status  | Networks                                | Image                   | Flavor  |
+--------------------------------------+---------------------------------------------------+---------+-----------------------------------------+-------------------------+---------+
| 908957c2-ac88-4b54-a1fc-91f9cc8f98f1 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-2 | ACTIVE  | lingxian_net=10.0.10.33, 150.242.42.234 | fedora-atomic-27-x86_64 | c1.c4r8 |
| a6ae4cee-7cf2-4b25-89bc-a5c6cb2c364d | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-1 | SHUTOFF | lingxian_net=10.0.10.34, 150.242.42.245 | fedora-atomic-27-x86_64 | c1.c4r8 |
| 8f0c3ad9-caf5-45b6-bf3a-97b3bb6de623 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-0 | ACTIVE  | lingxian_net=10.0.10.32, 150.242.42.233 | fedora-atomic-27-x86_64 | c1.c4r8 |
| 2af96203-cc6f-4b55-8fb2-062340207ebb | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-2 | ACTIVE  | lingxian_net=10.0.10.31, 150.242.42.226 | fedora-atomic-27-x86_64 | c1.c2r4 |
| 10bef366-b5a8-4400-b2c3-82188ec06b13 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-1 | ACTIVE  | lingxian_net=10.0.10.30, 150.242.42.22  | fedora-atomic-27-x86_64 | c1.c2r4 |
| 9c17f034-6825-4e49-b3cb-0ecddd1a8dd8 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-0 | ACTIVE  | lingxian_net=10.0.10.29, 150.242.42.213 | fedora-atomic-27-x86_64 | c1.c2r4 |
+--------------------------------------+---------------------------------------------------+---------+-----------------------------------------+-------------------------+---------+
```

Then a new node comes up:

```shell
+--------------------------------------+---------------------------------------------------+---------+-----------------------------------------+-------------------------+---------+
| ID                                   | Name                                              | Status  | Networks                                | Image                   | Flavor  |
+--------------------------------------+---------------------------------------------------+---------+-----------------------------------------+-------------------------+---------+
| 31d5e246-6f40-4e14-88a9-8cd86a19c75a | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-1 | BUILD   |                                         | fedora-atomic-27-x86_64 | c1.c4r8 |
| 908957c2-ac88-4b54-a1fc-91f9cc8f98f1 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-2 | ACTIVE  | lingxian_net=10.0.10.33, 150.242.42.234 | fedora-atomic-27-x86_64 | c1.c4r8 |
| a6ae4cee-7cf2-4b25-89bc-a5c6cb2c364d | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-1 | SHUTOFF |                                         | fedora-atomic-27-x86_64 | c1.c4r8 |
| 8f0c3ad9-caf5-45b6-bf3a-97b3bb6de623 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-0 | ACTIVE  | lingxian_net=10.0.10.32, 150.242.42.233 | fedora-atomic-27-x86_64 | c1.c4r8 |
| 2af96203-cc6f-4b55-8fb2-062340207ebb | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-2 | ACTIVE  | lingxian_net=10.0.10.31, 150.242.42.226 | fedora-atomic-27-x86_64 | c1.c2r4 |
| 10bef366-b5a8-4400-b2c3-82188ec06b13 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-1 | ACTIVE  | lingxian_net=10.0.10.30, 150.242.42.22  | fedora-atomic-27-x86_64 | c1.c2r4 |
| 9c17f034-6825-4e49-b3cb-0ecddd1a8dd8 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-0 | ACTIVE  | lingxian_net=10.0.10.29, 150.242.42.213 | fedora-atomic-27-x86_64 | c1.c2r4 |
+--------------------------------------+---------------------------------------------------+---------+-----------------------------------------+-------------------------+---------+
```

Finally, all the nodes are healthy again after the repair process finishes. In Magnum, the new node has the same IP address and hostname with the previous one:

```shell
+--------------------------------------+---------------------------------------------------+--------+-----------------------------------------+-------------------------+---------+
| ID                                   | Name                                              | Status | Networks                                | Image                   | Flavor  |
+--------------------------------------+---------------------------------------------------+--------+-----------------------------------------+-------------------------+---------+
| 31d5e246-6f40-4e14-88a9-8cd86a19c75a | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-1 | ACTIVE | lingxian_net=10.0.10.34, 150.242.42.245 | fedora-atomic-27-x86_64 | c1.c4r8 |
| 908957c2-ac88-4b54-a1fc-91f9cc8f98f1 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-2 | ACTIVE | lingxian_net=10.0.10.33, 150.242.42.234 | fedora-atomic-27-x86_64 | c1.c4r8 |
| 8f0c3ad9-caf5-45b6-bf3a-97b3bb6de623 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-minion-0 | ACTIVE | lingxian_net=10.0.10.32, 150.242.42.233 | fedora-atomic-27-x86_64 | c1.c4r8 |
| 2af96203-cc6f-4b55-8fb2-062340207ebb | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-2 | ACTIVE | lingxian_net=10.0.10.31, 150.242.42.226 | fedora-atomic-27-x86_64 | c1.c2r4 |
| 10bef366-b5a8-4400-b2c3-82188ec06b13 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-1 | ACTIVE | lingxian_net=10.0.10.30, 150.242.42.22  | fedora-atomic-27-x86_64 | c1.c2r4 |
| 9c17f034-6825-4e49-b3cb-0ecddd1a8dd8 | lingxian-por-test-1-12-7-ha-bbgjts5g4xhb-master-0 | ACTIVE | lingxian_net=10.0.10.29, 150.242.42.213 | fedora-atomic-27-x86_64 | c1.c2r4 |
+--------------------------------------+---------------------------------------------------+--------+-----------------------------------------+-------------------------+---------+
```

### magnum-auto-healer video demo
You can find a video demo [here](https://youtu.be/QCf-26P0lPg).

## Get involved

Currently, the magnum-auto-healer is still in the prototype phase, meaning many breaking changes can get accepted over time. Catalyst Cloud will deploy the service in production but as an alpha feature. Any feedback and contribution are welcomed.

* You can contact me(@lxkong) in [#sig-openstack channel on Kubernetes Slack](https://kubernetes.slack.com/messages/cloud-provider-openstack)
* [SIG OpenStack Mailing List](https://groups.google.com/forum/#!forum/kubernetes-sig-openstack)
* [Code base](https://github.com/kubernetes/cloud-provider-openstack/tree/master/pkg/autohealing)