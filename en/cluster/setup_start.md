# How to setup EMQ X Cluster
To understand the EMQ X cluster, we will demonstrate how to create an EMQ X cluster manually.

## Manage EMQ X Cluster on CLI
Here we will demonstrate how to manage an EMQ X cluster with two node using CLI (manually).  
Assume that we have two servers s1.emqx.io (192.168.0.10) and s2.emqx.io (192.168.1.20), on each server an EMQ X broker is installed. Now we will cluster these two servers up.

### Set the Node Name
EMQ X nodes communicate to each other by node name, a node name is a string looks like `name@host`. To set a node name for an EMQ X node, we need to modify the config file on the node located at `emqx/etc/emqx.conf`. In this example we configure it like following:

On the `s1.emqx.io` node:
```
node.name = emqx@s1.emqx.io

```
or
```
node.name = emq@192.168.0.10
```
On the `s2.emqx.io` node:
```
node.name = emqx@s2.emqx.io

```
or
```
node.name = emq@192.168.0.20
```

Or, alternatively, you can set the node name as an OS environment variable:
```bash
export EMQ_NODE_NAME=emq@s1.emqx.io && ./bin/emqx start
```

_Note: After joining a cluster, the node name is not changeable._

### Set cookie for Cluster
EMQ X uses cookie to identify nodes in same cluster. The cookie on every node in a cluster must be the same. To set the cookie, please open  the file `emqx/etc/emqx.donf` and then find and modify the following value:

```
node.cookie = emqxsecretcookie
```

### Manage the EMQ X Cluster Manually
To manage the EMQ X cluster manually, you will need to use the command line tool `emqx_ctl`, which comes will the EMQ X software.  
By using of `emqx_ctl` you can join, leave a cluster, query the start of cluster, and remove another nodes from the cluster.


**Set the Cluster Mode to manual**  
Manual cluster is the default cluster mode of EQM X, if you want to change the cluster mode, please open `emqx/etc/emqx.conf` and modify the following line:
```
cluster.discovery = manual
```

**Join a cluster**  
On one of the two nodes run `cluster join` command of  `emqx_ctl`, this node will join the cluster. For example, we can do following on the s1 node:
```bash
$ ./bin/emqx_ctl cluster join emq@s2.emqx.io
```
or do following on the s2 node:
```bash
$ ./bin/emqx_ctl cluster join emq@s1.emqx.io
```
Both will result the same: a cluster is created. After a cluster is created, the system will return:
```bash
Join the cluster successfully.
Cluster status: [{running_nodes,['emq@s1.emqx.io','emq@s2.emqx.io']}]
```

**Remove a Node from a Cluster**  
There are two ways to remove a node from a cluster:
- leave: a node leaves a cluster on its own initiative.
``` bash
$ ./bin/emqx_ctl cluster leave
```
- remove: a node is remove from a cluster by another node. Run following on s1 will remove s2 node from the cluster:
```bash
$ ./bin/emqx_ctl cluster remove emq@s2.emqx.io
```

**Query the Cluster status**
Using the `cluster status` of `emqx_ctl` tool will return the status of a cluster:
```bash
$ ./bin/emqx_ctl cluster status

Cluster status: [{running_nodes,['emq@s1.emqx.io','emq@s2.emqx.io']}]
```
## Clustering EMQ X Automatically
EMQ X utilizes Ekka for node auto discovery, besides the manual cluster, it also support automatic clustering, currently support auto clustering methods are:
- static : clustering using a static node list
- mcast : clustering using UDP multi-cast
- dns : clustering using a DNA A record
- etcd : clustering by help of a etcd server
- k8s : clustering by Kubernetes service API

Besides node discovery, Ekka also provide the ability of net-split auto healing and auto removal of dead nodes. We will cover this topics later.
