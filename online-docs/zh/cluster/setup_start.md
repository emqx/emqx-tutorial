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

### 加入集群
使用随 EMQ X 安装附带的命令行工具`emqx_ctl`可以方便的管理集群。使用

## 节点的自动发现与自动集群
