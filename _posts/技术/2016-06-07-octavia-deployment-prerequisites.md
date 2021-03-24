---
layout: post
title: Octavia Deployment Prerequisites
description: Octavia部署依赖
category: 技术
---

## Nova flavor
The flavor will be used for creating octavia service vm. We can create a new flavor or reuse an existing one.

Commands:

    nova flavor-create --is-public False m1.amphora ${OCTAVIA_AMP_FLAVOR_ID} 1024 2 1

Option: 

    [controller_worker]
    amp_flavor_id = ${OCTAVIA_AMP_FLAVOR_ID}

## Nova keypair
If we want to log in to the service vm for debugging or maintainance, we need to create SSH public/private key and Nova keypair, which will be used for octavia service vm creation.

Commands:

    ssh-keygen -b 2048 -t rsa -N "" -f ${OCTAVIA_AMP_SSH_KEY_PATH}
    nova keypair-add --pub-key ${OCTAVIA_AMP_SSH_KEY_PATH}.pub ${OCTAVIA_AMP_SSH_KEY_NAME}

Option: 

    [controller_worker]
    amp_ssh_key_name = ${OCTAVIA_AMP_SSH_KEY_NAME}

## Certificate
Both amphora API and Octavia controller do bi-directional certificate-based authentication in order to authorize and encrypt communication. You must therefore create appropriate SSL certificates which will be used for key signing, authentication, encryption. There is a helper script to do this in this repository under: bin/create_certficiates.sh

Commands:

    source $OCTAVIA_DIR/bin/create_certificates.sh $OCTAVIA_CERTS_DIR $OCTAVIA_DIR/etc/certificates/openssl.cnf

Options:

    [certificates]
    ca_certificate = ${OCTAVIA_CERTS_DIR}/ca_01.pem
    ca_private_key = ${OCTAVIA_CERTS_DIR}/private/cakey.pem
    ca_private_key_passphrase = <enter_your_password_here>
    [haproxy_amphora]
    client_cert = ${OCTAVIA_CERTS_DIR}/client.pem
    server_ca = ${OCTAVIA_CERTS_DIR}/ca_01.pem

## Loadbalancer management network
Octavia makes use of an "LB Network" mostly as a management network that the controller uses to talk to amphorae and vice versa. All the amphorae that Octavia deploys will have interfaces and IP addresses on this network. 

Commands:

    OCTAVIA_AMP_NETWORK_ID=$(neutron net-create lb-mgmt-net | awk '/ id / {print $4}')
    neutron subnet-create --name lb-mgmt-subnet --allocation-pool start=$OCTAVIA_MGMT_SUBNET_START,end=$OCTAVIA_MGMT_SUBNET_END lb-mgmt-net $OCTAVIA_MGMT_SUBNET
    id_and_mac=$(neutron port-create --name octavia-health-manager-listen-port --binding:host_id=<network_node_host_name> lb-mgmt-net | awk '/ id | mac_address / {print $4}')
    MGMT_PORT_ID=${id_and_mac[0]}
    MGMT_PORT_MAC=${id_and_mac[1]}
    MGMT_PORT_IP=$(neutron port-show $MGMT_PORT_ID | awk '/ "ip_address": / {print $7; exit}' | sed -e 's/"//g' -e 's/,//g' -e 's/}//g')
    (On network node):
    sudo ovs-vsctl -- --may-exist add-port br-int o-hm0 -- set Interface o-hm0 type=internal -- set Interface o-hm0 external-ids:iface-status=active -- set Interface o-hm0 external-ids:attached-mac=$MGMT_PORT_MAC -- set Interface o-hm0 external-ids:iface-id=$MGMT_PORT_ID
    sudo ip link set dev o-hm0 address $MGMT_PORT_MAC
    sudo dhclient -v o-hm0

Options:

    [controller_worker]
    amp_network = ${OCTAVIA_AMP_NETWORK_ID}
    [health_manager]
    controller_ip_port_list = $MGMT_PORT_IP:5555
    bind_ip = $MGMT_PORT_IP
    bind_port = 5555

## Neutron security group
Neutron security group which will be applied to amphorae created on the LB network. It needs to allow all egress packets, and ingress on the amphora's API (usually TCP ports 9443 or 22).

Commands:

    neutron security-group-create lb-mgmt-sec-grp
    neutron security-group-rule-create --protocol icmp lb-mgmt-sec-grp
    neutron security-group-rule-create --protocol tcp --port-range-min 22 --port-range-max 22 lb-mgmt-sec-grp
    neutron security-group-rule-create --protocol tcp --port-range-min 9443 --port-range-max 9443 lb-mgmt-sec-grp
    OCTAVIA_MGMT_SEC_GRP_ID=$(nova secgroup-list | awk ' / lb-mgmt-sec-grp / {print $2}')

Options:

    [controller_worker]
    amp_secgroup_list = ${OCTAVIA_MGMT_SEC_GRP_ID}

## Glance image
Octavia deploys amphorae based on a virtual machine disk image. By default we can use the OpenStack diskimage-builder project for this. Scripts to accomplish this are within the diskimage-create directory of Octavia repository. A script can be found [here](https://github.com/LingxianKong/octavia-stuff/blob/master/utils/update_amphora_image.sh) for building and updating amphora image to Glance automatically.

Commands:

    $OCTAVIA_DIR/diskimage-create/diskimage-create.sh -s 2
    glance image-create amphora-x64-haproxy --is-public True --container-format bare --disk-format qcow2 --file $OCTAVIA_DIR/diskimage-create/amphora-x64-haproxy.qcow2
    glance image-tag-update <OCTAVIA_AMP_IMAGE_ID> amphora

Options:

    [controller_worker]
    amp_image_tag = amphora
    # amp_image_id = 