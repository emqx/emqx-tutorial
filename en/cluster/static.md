# Static Clustering
The static clustering of EMQ X is to use a static node list pre-configured on each node of the cluster. This is the easiest way to create an EMQ X cluster automatically. After starting the nodes one by one, the nodes will create a cluster automatically according the node list.   
There is no additional function component on the network necessary.


## Configure the Nodes
Configure the nodes for static clustering is easy, just modify the `etc/emqx.conf` file and change the `cluster.discovery` to 'static' and put all the node names in the `cluster.static.seeds`:
```
cluster.discovery = static

##--------------------------------------------------------------------
## Cluster with static node list

cluster.static.seeds = emqx1@192.168.0.10,emqx2@192.168.0.20
```
`cluster.discovery` is the cluster mode.  
`cluster.static.seeds` is the node name list of cluster. Each node name has the format of `name@host` node names are separated by comma(",").
After configuring, starts the nodes, and the cluster is created.

## Query the Cluster status
On any node of the cluster run the following to query the status of this cluster:
```bash
$ ./bin/emqx_ctl cluster status

Cluster status: [{running_nodes,['emqx1@192.168.0.10','emqx2@192.168.0.20']}]
```
