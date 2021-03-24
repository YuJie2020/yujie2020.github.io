---
layout: post
title: Barbican - OpenStack Key Management service
category: 技术
---

For those who don't know, [Barbican](https://docs.openstack.org/barbican/latest/) is an OpenStack service which provides a REST API designed for the secure storage, provisioning and management of secrets such as passwords, encryption keys and X.509 certificates. Barbican can be used together with other OpenStack services to provide security features, e.g. Octavia uses Barbian to store and retrieve certificates for creating TLS termination enabled listener, Cinder uses Barbican for volume encryption, Magnum uses Barbican for storing Kubernetes CA certificate, etc.

The most important thing to deploy Barbican in production is to decide which secret store solution should be used for Barbican.

## Secret store backends in Barbican

1. Crypto Plugins

    Crypto plugins store secrets as encrypted blobs within the Barbican database. There are 2 plugins available that differ in how the key encryption keys(KEKs) are managed:

    - Simple crypto plugin(testing purpose), the master encryption key is stored as plain text in the config file and the users' secrets are stored as encrypted blobs in barbican database. It relies on the protection of the config file(or configuration management system) to protect the secrets.
    - PKCS#11 crypto plugin(not well maintained), users' secrets are encrypted by a project-specific Key Encryption Key (KEK) which resides in the Hardware Security Module(HSM). This option can provide extra security but it's expensive because an HSM device is needed. You can also choose Software Security Module such as [SoftHSM](https://wiki.opendnssec.org/display/SoftHSMDOCS) which is a software implementation of a cryptographic store accessible through a PKCS#11 interface. However, currently there is a [key wrapping machanism](https://github.com/opendnssec/SoftHSMv2/issues/405) missing in SoftHSM, it can not work with Barbican at the moment.

2. Secret store plugins

    Secret store plugins interface with secure storage systems to store the secrets within those systems. There are three types of secret store plugins:

    - KMIP Plugin

      This plugin is used to communicate with a KMIP-enabled device, such as a Hardware Security Module (HSM). The secret is securely stored in the KMIP device directly. A KMIP device is needed.

    - Dogtag Plugin

      Dogtag is the upstream project corresponding to the Red Hat Certificate System, a robust, full-featured PKI solution that contains a Certificate Manager (CA) and a Key Recovery Authority (KRA) which is used to securely store secrets. The KRA stores secrets as encrypted blobs in its internal database, with the master encryption keys being stored either in a software-based Network Security Services(NSS) security database, or in a Hardware Security Module (HSM). The software-based NSS database configuration provides a secure option for those deployments that do not wish to use or cannot afford an HSM. Fedora/Centos system is needed to install Dogtag.

    - Vault Plugin

      This plugin is used to communicate with [Harshicorp Vault](https://github.com/hashicorp/vault) which is an open source software for securely storing/accessing secrets but also provides lots of advanced features such as plugin mechanism(auth backend, storage backend), audit capability, fine-grained ACL rules, response wrapping, etc. Although Harshicorp provides enterprise Vault, the open source version is feature-rich enough and can be used in production.

## Relationship between PKCS#11 and KMIP

PKCS#11 is an API used to control a hardware security module. PKCS#11 provides cryptographic operations to encrypt and decrypt, as well as operations for simple key management. There is a considerable amount of overlap between the PKCS#11 API and the KMIP protocol.

The two standards were originally developed independently. PKCS#11 was created by RSA Security, but the standard is now also governed by an OASIS technical committee. It is the stated objective of both the PKCS#11 and KMIP committees to align the standards where practical. For example, the PKCS#11 Sensitive and Extractable attributes are being added to KMIP version 1.4. Many of the same people are on the technical committees of both KMIP and PKCS#11.

## Relationship between Barbican and Castellan

[Castellan](https://docs.openstack.org/castellan/latest/) is an Oslo library with different drivers for different key management systems(including Barbican) that can be used in various OpenStack services. In one word, Castellan is a library and Barbican is a cloud service.

## Relationship between Barbican and Vault

Actually, Vault can be definitely used in standalone mode, it provides CLI and HTTP API interface. However, as an OpenStack based cloud provider, Barbican is the first citizen in OpenStack world considering its integration with other OpenStack services and the consistent openstack CLI experience to interact with the service. Vault can be used as a secret store backend for Barbican.

## Integrate Barbican with Vault

### Install DevStack

```shell
user=ubuntu
group=ubuntu
git clone https://git.openstack.org/openstack-dev/devstack
sudo mkdir -p /opt/stack && sudo chown -R $group.$user /opt/stack && cd devstack
cat <<"EOF" > local.conf
[[local|localrc]]
RECLONE=False
MULTI_HOST=True
HOST_IP=

enable_plugin barbican https://git.openstack.org/openstack/barbican
LIBS_FROM_GIT+=python-barbicanclient
DATABASE_PASSWORD=password
ADMIN_PASSWORD=password
SERVICE_PASSWORD=password
SERVICE_TOKEN=password
RABBIT_PASSWORD=password
LOGFILE=$DEST/logs/stack.sh.log
VERBOSE=True
LOG_COLOR=False
LOGDAYS=1

ENABLED_SERVICES=rabbit,mysql,key

# Swift
ENABLED_SERVICES+=,swift
SWIFT_HASH=66a3d6b56c1f479c8b4e70ab5c2000f5
SWIFT_REPLICAS=1
EOF
nic=$(sudo ip -4 route list 0/0 | awk '{ print $5; exit }'); echo $nic
nic_ip=$(sudo ip addr | awk "/inet / && /$nic/{print \$2; exit }" | awk -F '/' '{ print $1; exit }'); echo $nic_ip
sed -i "/HOST_IP=/c HOST_IP=$nic_ip"  ~/devstack/local.conf && cat ~/devstack/local.conf
./stack.sh
```

Now you have a DevStack environment with Barbican and Swift enabled, the Barbican service is running with the default configuration, we will change that later on.

### Install vault

Vault is delivered as a go binary, in our test, we use Swift as the Vault storage backend.

```shell
sudo -s
cd ~; curl -SLO https://releases.hashicorp.com/vault/0.10.3/vault_0.10.3_linux_amd64.zip
unzip vault_0.10.3_linux_amd64.zip; mv vault /usr/local/bin/vault

nic=$(sudo ip -4 route list 0/0 | awk '{ print $5; exit }')
nic_ip=$(sudo ip addr | awk "/inet / && /$nic/{print \$2; exit }" | awk -F '/' '{ print $1; exit }')
mkdir -p /etc/vault && touch /etc/vault/config.hcl
cat<<EOF > /etc/vault/config.hcl
storage "swift" {
  auth_url          = "http://$node_ip/identity/v3"
  username          = "demo"
  password          = "password"
  project           = "demo"
  container         = "vault-storage"
  domain            = "default"
  project-domain    = "default"
  region            = "RegionOne"
}

listener "tcp" {
 address     = "$node_ip:8200"
 tls_disable = 1
}
EOF
```

We run the vault service in a linux screen so we don't need to open another shell session for the following steps.

```shell
screen -dmS vault && screen -S vault -p bash -X stuff "vault server -config=/etc/vault/config.hcl\n"
```

### Unseal vault

After vault service is running, it's in `sealed` state and cannot handle any request, initialization is required to prepare vault to receive data. During initialization, Vault generates an in-memory master key and applies Shamir's secret sharing algorithm to disassemble that master key into a configuration number of key shares such that a configurable subset of those key shares must come together to regenerate the master key. These keys are often called "unseal keys" in Vault's documentation.

For security reasons, we don't want to print the plaintext unseal keys. Vault supports to use GPG key files so that the generated unseal keys will be encrypted and base64-encoded in the order specified in the `-pgp-keys` param, only the user with private GPG key can access the unseal key. We don't encrypt the root token here because root token is supposed to be revoked immediately after they are no longer needed(e.g. after the initialization process). Root token can be re-generated using the unseal keys as needed.

```shell
export VAULT_ADDR="http://$node_ip:8200"
vault operator init -key-shares=3 -key-threshold=2 -pgp-keys=$HOME/user1_public.key,$HOME/user2_public.key,$HOME/user3_public.key > $HOME/unseal_info
root_token=$(cat $HOME/unseal_info | grep "Initial Root" | awk -F: '{print $2}')
```

Unsealing vault is supposed to be manual process for now, the user who has the correct GPG private key can perform unseal operation on any host that can connect to the vault server. The following step should be running by at least `-key-threshold` number of users.

```shell
echo $key_b64 | base64 -d | gpg --decrypt
vault operator unseal $key
```

After the last user running the unseal command, the vault server will be in unseal status and can receive requests.

### Generate token for Barbican

A token is needed for Barbican to interact with Vault, apparently, the token should not be the root token which has the permission to do everything in Vault. We need to limit the token permission to the scope of operations Barbican does, we also need to guarantee the token could be revoked and re-generated easily in case the Barbican config file is compromised. Additionally, the token should be only used on the host Barbican service is running.

In order to solve all the concerns here, we use [approle](https://www.vaultproject.io/api/auth/approle/index.html) to generate the temporary token.

```shell
vault login $root_token
vault auth enable approle
cat <<EOF > /etc/vault/policy_secret.hcl
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
EOF
vault policy write policy_secret /etc/vault/policy_secret.hcl
vault write auth/approle/role/barbican \
    local_secret_ids=true \
    period=10080m \
    policies=policy_secret \
    secret_id_bound_cidrs="$node_ip/32" \
    secret_id_num_uses=5 \
    secret_id_ttl=30m \
    token_bound_cidrs="$node_ip/32"
role_id=$(vault read -format=yaml auth/approle/role/barbican/role-id | grep role_id | awk '{print $2}')
secret_id=$(vault write -format=yaml auth/approle/role/barbican/secret-id -force=true | grep 'secret_id:' | awk '{print $2}')
token=$(vault write -format=yaml auth/approle/login role_id=$role_id secret_id=$secret_id | grep 'token:' | awk '{print $2}')
```

### Config Barbican

After vault server initialization and configuration is done, we need to change Barbican's secret store backend and config the vault server connection information.

```shell
cat <<EOF >> /etc/barbican/barbican.conf
[secretstore]
namespace=barbican.secretstore.plugin
enable_multiple_secret_stores=false
enabled_secretstore_plugins=vault_plugin

[vault_plugin]
root_token_id = $token
vault_url = http://$node_ip:8200
use_ssl = False
EOF
systemctl restart devstack@barbican-svc.service
```

### Verification

Create a secret in Barbican, check it's stored in Vault.

```shell
$ openstack secret store --name test --payload "my secret"
+---------------+------------------------------------------------------------------------------+
| Field         | Value                                                                        |
+---------------+------------------------------------------------------------------------------+
| Secret href   | http://10.0.0.12/key-manager/v1/secrets/a0941786-d3c6-4955-b8b7-ef755afd908f |
| Name          | test                                                                         |
| Created       | None                                                                         |
| Status        | None                                                                         |
| Content types | None                                                                         |
| Algorithm     | aes                                                                          |
| Bit length    | 256                                                                          |
| Secret type   | opaque                                                                       |
| Mode          | cbc                                                                          |
| Expiration    | None                                                                         |
+---------------+------------------------------------------------------------------------------+
```

The mapping information from Barbican secret to Vault secret is stored in Barbican database.

```shell
mysql> select * from secret_store_metadata where secret_id='a0941786-d3c6-4955-b8b7-ef755afd908f';
+--------------------------------------+---------------------+---------------------+------------+---------+---------+--------------------------------------+--------------+-----------------------------------------------------+
| id                                   | created_at          | updated_at          | deleted_at | deleted | status  | secret_id                            | key          | value                                               |
+--------------------------------------+---------------------+---------------------+------------+---------+---------+--------------------------------------+--------------+-----------------------------------------------------+
| 66e0bf82-101a-4019-857d-5e914e6db8bc | 2018-07-15 12:33:01 | 2018-07-15 12:33:01 | NULL       |       0 | PENDING | a0941786-d3c6-4955-b8b7-ef755afd908f | key_id       | 4df3293c0e57479fafd5c71204ff2abd                    |
+--------------------------------------+---------------------+---------------------+------------+---------+---------+--------------------------------------+--------------+-----------------------------------------------------+
```

The value of `key_id` is `4df3293c0e57479fafd5c71204ff2abd`. Check the key is stored in Vault:

```shell
$ vault login $token
$ vault read secret/4df3293c0e57479fafd5c71204ff2abd
Key                 Value
---                 -----
refresh_interval    768h
algorithm           <nil>
bit_length          <nil>
created             <nil>
name                <nil>
type                opaque
value               62586b676332566a636d5630
$ python
>>> import binascii
>>> binascii.unhexlify("62586b676332566a636d5630")
'bXkgc2VjcmV0'
$ echo "bXkgc2VjcmV0" | base64 -d
my secret
```

You can also take a look at how the objects stored in Swift.