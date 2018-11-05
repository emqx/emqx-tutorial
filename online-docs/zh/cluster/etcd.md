# 使用 ETCD 的自动集群

etcd 是 CoreOS 发起的开源项目。它以构建高可用的分布式键值（Key-Value）数据库为目标。etcd 的应用场景多间于服务发现，解决分布式系统中同一个集群的进程之间如何相互发现并建立连接。这以功能也正是 EMQ X 自动集群所需要的。  
当网络中存在etcd服务器（集群）的时候，EMQ X 集群可以使用ectp的方式自动建立集群。如何安装和配置etcd服务集群超出了本文档的范围，有兴趣深入了解的读者可以参考[官方文档](https://coreos.com/etcd/docs/latest/getting-started-with-etcd.html)。 在这里，我们假设在EMQ X集群所在的网络中已经安装和配置了etcd服务器。

## 配置 EMQ X 节点
您需要在各个 EMQ X 节点上编辑 'etc/emqx.conf'文件中的cluster段落和node段落。

### 配置 etcd 集群方式
您需要指定etcd服务器的地址（如果存在多个etcd服务器的时候，您可以使用服务器列表，在列表中以逗号","分隔各个服务器。）、用于指定 EMQ X 节点的路径的前缀、路径的生存时间。
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

### 配置节点名

按照 `name@host` 的格式为各个节点配置节点名，如：
```
node.name = emqx1@192.168.1.162
```
## 检验是否集群成功
在完成配置以后，我们可以逐一启动 EMQ X 节点，并用 `etcdctl` 工具观察etcd服务器上的变化和用 `emqx_ctl` 工具观察集群的状态。

启动第一个节点之后 etcd：
```bash
$ etcdctl ls /emqxcl/emqxcl --recursive

/emqxcl/emqxcl/nodes
/emqxcl/emqxcl/nodes/emqx2@192.168.1.176
```

启动第一个节点后 EMQ X集群状态：
```bash
$ ./emqx_ctl cluster status

Cluster status: [{running_nodes,['emqx2@192.168.1.176']}]
```

启动第二个节点之后 etcd：
```bash
$ etcdctl ls /emqxcl/emqxcl --recursive

/emqxcl/emqxcl/nodes
/emqxcl/emqxcl/nodes/emqx1@192.168.1.162
/emqxcl/emqxcl/nodes/emqx2@192.168.1.176
```

启动第二个节点后 EMQ X集群状态：
```bash
$ ./emqx_ctl cluster status

Cluster status: [{running_nodes,['emqx1@192.168.1.162',
                                 'emqx2@192.168.1.176']}]
```

可以见到所有节点都正常启动并自动加入集群。
