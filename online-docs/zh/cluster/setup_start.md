# 如何组建 EMQ X 集群

## 使用命令行管理集群
在这一节中我们将通过例子来介绍如何以手动加入集群的方式组建一个有两个节点的EMQ X集群。  
假设我们有两台服务器: s1.emqx.io(192.168.0.10) 和 s2.emqx.io(192.168.1.20)，分别安装了EMQ X，现在要让这两台服务器组成集群。

### 在配置中设置节点名
EMQ X 集群中的节点通过节点名互相访问，所以需要在`emqx/etc/emqx.conf`文件中设置正确的节点名。节点名的格式是`name@host`。host可以是 IP 地址或者 FQDN。在本例中需要加入集群的两个节点可以这样配置节点名：

在s1.emqx.io节点上：
```
node.name = emqx@s1.emqx.io

```
或
```
node.name = emq@192.168.0.10
```
在s2.emqx.io节点上：
```
node.name = emqx@s2.emqx.io

```
或
```
node.name = emq@192.168.0.20
```

或者以环境变量的方式设置节点名：
```bash
export EMQ_NODE_NAME=emq@s1.emqx.io && ./bin/emqx start
```

_注意：在节点加入集群后，节点名不能变更。_

### 设置集群 cookie
EMQ X 使用cookie来确认同一个集群中的节点。同一个集群中的节点必须使用相同的cookie。修改cookie请编辑配置文件 `emqx/etc/emqx.conf`，找到以下行并做相应修改。
```
node.cookie = emqxsecretcookie
```

### 手动集群管理
手动集群是 EMQ X 最基本的集群管理方式。  
使用随 EMQ X 安装附带的命令行工具 `emqx_ctl` 的 `cluster` 命令可以方便的管理集群，完成在集群中添加、移除节点和查询集群状态等任务。

**设置集群方式（manual）**
手动集群方式是 EMQ X 的默认集群方式。如果需要修改集群方式，请在配置文件`emqx/etc/emqx.conf`中找到以下行并做相应修改：
```
cluster.discovery = manual
```

**加入新节点**  
在任意独立节点上执行 `cluster join` 后，该节点会被加入到集群中。在本节的例子中，可以在s1节点上执行：
```bash
$ ./bin/emqx_ctl cluster join emq@s2.emqx.io
```
或在s2节点上执行：
```bash
$ ./bin/emqx_ctl cluster join emq@s1.emqx.io
```
以上两者的效果是一致的。在节点被成功的加入到集群后，系统会返回以下提示：
```bash
Join the cluster successfully.
Cluster status: [{running_nodes,['emq@s1.emqx.io','emq@s2.emqx.io']}]
```

**从集群中移除节点**
EMQ X 提供两种方式从集群中移除一个节点:
- leave: 需要移除的节点主动退出集群。在该节点上执行以下命令即可退出集群：
``` bash
$ ./bin/emqx_ctl cluster leave
```
- remove: 从集群的其他节点移除一个节点。在集群的其他节点上执行以下命令即可移除该节点。本例在 s1 节点上执行以下命令把 s2 节点移除出集群：
```bash
$ ./bin/emqx_ctl cluster remove emq@s2.emqx.io
```

**查询集群状态**
在集群中的任意节点上使用`emqx_ctl`工具的 `cluster status` 命令可以查询目前集群的状态：
```bash
$ ./bin/emqx_ctl cluster status

Cluster status: [{running_nodes,['emq@s1.emqx.io','emq@s2.emqx.io']}]
```
## EMQ X 的自动集群
EMQ X 实现了基于 Ekka 库的集群节点自动发现，除了手动集群，EMQ X 还支持配置不同的策略来自动集群。目前支持的自动集群方式有以下几种：
- static ：	静态节点列表自动集群
- mcast ：	UDP 组播方式自动集群
- dns ：	DNS A 记录自动集群
- etcd ：	通过 etcd 自动集群
- k8s ：	Kubernetes 服务自动集群

Ekka 除了提供了自动集群发现，还提供了自动脑裂愈合和自动移除宕机节点的功能。这些功能将在后续章节中详细介绍。
