# Auto-cluster by ETCD

'etcd' is an open source project initiated by CoreOS. It can be uses as high available distributed key-value database. etcd is common in service discovery, it solves the problem of processed in a cluster finding each other and establishing communication. This is what an EMQ X cluster needs for auto clustering.  

How to install and configure etcd server is beyond the scope of this document, we we assume that an etcd service exists in the network already. For more information about etcd please refer to the [CoreOS documents](https://coreos.com/etcd/docs/latest/getting-started-with-etcd.html).

## Configure EMQ X nodes
On each EMQ X node, edit the 'etc/emqx.conf' file and modify the 'cluster' and 'node' sections in it.

### Configure Auto-Cluster
You will need to name the address of the etcd server (If there are multiple etcd servers in use, you can list them by separating them with "," ).  
 You will also need to define the path prefix of nodes and the TTL of path.

```
cluster.discovery = etcd
##--------------------------------------------------------------------
## Cluster using etcd

## Etcd server list, seperated by ','.
##
## Value: String
cluster.etcd.server = http://192.168.1.162:2379

## The prefix helps build nodes path in etcd. Each node in the cluster
## will create a path in etcd: v2/keys/<prefix>/<cluster.name>/<node.name>
##
## Value: String
cluster.etcd.prefix = emqxcl

## The TTL for node's path in etcd.
##
## Value: Duration
##
## Default: 1m, 1 minute
cluster.etcd.node_ttl = 1m
```

### Configure the Node Name

按照configure the node name (format `name@host`), for example:
```
node.name = emqx1@192.168.1.162
```
## Verify the Cluster

After the configuration, we can start the EMQ X nodes one by one and check the values on etcd using  `etcdcle` and check the status of EMQ X cluster using `emqx_ctl`.

After start a fist EMQ X node, on etcd run following to check the etcd values:
```bash
$ etcdctl ls /emqxcl/emqxcl --recursive

/emqxcl/emqxcl/nodes
/emqxcl/emqxcl/nodes/emqx2@192.168.1.176
```

and check EMQ X cluster status:
```bash
$ ./emqx_ctl cluster status

Cluster status: [{running_nodes,['emqx2@192.168.1.176']}]
```

And then start the second EMQ X node, on etcd run following to check the etcd values:
```bash
$ etcdctl ls /emqxcl/emqxcl --recursive

/emqxcl/emqxcl/nodes
/emqxcl/emqxcl/nodes/emqx1@192.168.1.162
/emqxcl/emqxcl/nodes/emqx2@192.168.1.176
```

and check EMQ X cluster status:
```bash
$ ./emqx_ctl cluster status

Cluster status: [{running_nodes,['emqx1@192.168.1.162',
                                 'emqx2@192.168.1.176']}]
```

All the nodes are up and work in one cluster.
