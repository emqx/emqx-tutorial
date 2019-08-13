# Auto-cluster by Kubernetes

Kubernetes (k8s) is Google's open source container management system. EMQ X can use kubernetes API for node discovery and auto clustering.

k8s is very powerful, how to deploy and configure k8s is beyond the scope of this document. for more information about k8s, please refer t [k8s document](https://kubernetes.io/docs/home/).

## Configure EMQ X Nodes
On each EMQ X node, edit the 'etc/emqx.conf' file and modify the 'cluster' and 'node' sections in it.

### Configure Auto-Cluster
You will need to setup:
- a kubernetes API server for EMQ X nodes,
- the service name for EMQ X service.
- address type (IP or DNS).
- an `app_name` uses ad name part of node name.
- name space on kubernetes.

```
cluster.discovery = k8s
##--------------------------------------------------------------------
## Cluster using Kubernetes

## Kubernetes API server list, seperated by ','.
##
## Value: String
cluster.k8s.apiserver = http://192.168.1.162:8081

## The service name helps lookup EMQ nodes in the cluster.
##
## Value: String
cluster.k8s.service_name = emqx

## The address type is used to extract host from k8s service.
##
## Value: ip | dns
cluster.k8s.address_type = ip

## The app name helps build 'node.name'.
##
## Value: String
cluster.k8s.app_name = emqx

## Kubernetes Namespace
##
## Value: String
cluster.k8s.namespace = default

```

## Verify the Cluster
After the configuration, we can start the EMQ X nodes one by one and check the cluster status:
```bash
./emqx_ctl cluster status
```
The clustering is success if it returns following:
```bash
Cluster status: [{running_nodes,['emqx@192.168.1.162','emqx@192.168.1.165']}]
```
shutdown one of these two nodes, and querey the status of cluster on the remaining node, you will see:
```bash
Cluster status: [{running_nodes,['emqx2@192.168.1.165']},
                 {stopped_nodes,['emqx1@192.168.1.162']}]
```
