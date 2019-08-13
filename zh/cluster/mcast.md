# 使用 IP 组播的自动集群
## IP 组播（Multicast）自动集群的原理
IP 组播（又称多播）是IP协议下的一种一对多的或多对多的通讯方式，它可以用于网络中多个（而不是全部）主机间的通讯。在 EMQ X 的集群中，所有的 EMQ X 节点正好构成一个这样的组播群体，可以利用组播的特性来向所有集群成员发送加入和退出集群的消息。这种方式配置较方便，使用灵活，无需额外的网元支持。因为 EMQ X 集群的节点数有限，组播消息也不会对网络造成过大压力。

使用组播组建集群无需额外的网元或软件，只需要网络环境自身支持组播即可。目前定义的组播地址段为D类地址端，落在224.0.0.0到239.255.255.255之间，划分为三个子段，
- 224.0.0.0 ~ 224.0.0.255 ：局部组播段。目的地址为此地址范围内的报文不会被路由器转发，常用于路由协议等用途。
- 224.0.1.0 ~ 238.255.255.255 ： 为全球范围预留段。
- 239.0.0.0 ~ 239.255.255.255 ： 管理权限组播段。可供组织内部使用，类似于192.168.0.0/16这样的私有网络IP地址。

在EMQ X 集群中，我们一般使用第三个地址段。

**使用组播建立EMQ X 集群的限制**  
由于大多数的公有云提供商都禁止在云上使用组播，这种组网方式一般仅能在私有部署上应用。

## 配置 EMQ X 节点

您需要在各个 EMQ X 节点上编辑 'etc/emqx.conf'文件中的cluster段落和node段落。

### 配置组播集群方式

您需要指定 EMQ X 节点需要加入的组播群的地址、使用的端口和网络接口、TTL值、以及报文是否loop （是否接收自己发送的组播报文）。
```
cluster.discovery = mcast
##--------------------------------------------------------------------
## Cluster using IP Multicast.

## IP Multicast Address.
##
## Value: IP Address
cluster.mcast.addr = 239.192.0.1

## Multicast Ports.
##
## Value: Port List
cluster.mcast.ports = 4369,4370

## Multicast Iface.
##
## Value: Iface Address
##
## Default: 0.0.0.0
cluster.mcast.iface = 0.0.0.0

## Multicast Ttl.
##
## Value: 0-255
cluster.mcast.ttl = 255

## Multicast loop.
##
## Value: on | off
cluster.mcast.loop = on
```
### 配置节点名

按照 `name@host` 的格式为各个节点配置节点名，如：
```
node.name = emqx1@192.168.1.162
```

## 检验是否集群成功

在配置完成后，依次启动集群的各个节点。然后在任意节点上执行命令查询集群状态：
```bash
./emqx_ctl cluster status
```
看到以下结果则表示集群建立成功：
```bash
Cluster status: [{running_nodes,['emqx1@192.168.1.162','emqx2@192.168.1.165']}]
```
关闭集群内一个节点，再次查询集群状态，应该能看到以下结果：
```bash
Cluster status: [{running_nodes,['emqx2@192.168.1.165']},
                 {stopped_nodes,['emqx1@192.168.1.162']}]
```
