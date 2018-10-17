# 静态集群
EMQ X 静态集群的原理是在所有需要加入集群的 EMQ X 上配置一个相同的节点列表，这个列表包含所有节点的节点名，它是自动集群中最简单的一种，在各节点启动后，会根据列表自动建立一个集群。  
静态集群只需要各节点间可以通过 TCP 协议互相访问，不需要任何其他网络组件或服务，也不需要网络支持IP组播。

## 节点配置
静态集群的配置相对简单，只需要在每个节点的 `etc/emqx.conf` 文件中配置集群方式和节点列表即可：
```
cluster.discovery = static

##--------------------------------------------------------------------
## Cluster with static node list

cluster.static.seeds = emqx1@192.168.0.10,emqx2@192.168.0.20
```
`cluster.discovery` 为集群方式。  
`cluster.static.seeds` 配置项为集群列表。列表中的节点名遵从`name@host`的格式，各个节点名以逗号（`,`）分隔。  
配置完成后，启动所有节点，集群即可建立。

## 查询集群状态
在任意节点上执行以下命令可以查询集群状态：
```bash
$ ./bin/emqx_ctl cluster status

Cluster status: [{running_nodes,['emqx1@192.168.0.10','emqx2@192.168.0.20']}]
```
