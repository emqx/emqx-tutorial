# 在 kubernetes 上集群 EMQ X
kubernetes（k8s） 是 Google 的开源容器集群管理系统，是一个完备的分布式系统支撑平台。EMQ X 节点可以使用 kubernetes 的服务发现功能组建集群。

k8s的功能非常强大，关于它的部署和配置的详细说明超过了本文档的范围，有兴趣的读者请参阅[k8s文档在线](https://kubernetes.io/docs/home/)。
## 配置 EMQ X 节点
您需要在各个 EMQ X 节点上编辑 'etc/emqx.conf'文件中的cluster段落和node段落。

### 配置 k8s 集群方式
您需要为 k8s 自动集群指定 kubernetes API服务器，EMQ X 在 k8s 上的服务名，地址类型，用于建立`node.name`的 app_name 和 k8s上使用的命名空间。
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

## 检验是否集群成功
在配置完成后，依次启动集群的各个节点。然后在任意节点上执行命令查询集群状态：
```bash
./emqx_ctl cluster status
```
看到以下结果则表示集群建立成功：
```bash
Cluster status: [{running_nodes,['emqx@192.168.1.162','emqx@192.168.1.165']}]
```
关闭集群内一个节点，再次查询集群状态，应该能看到以下结果：
```bash
Cluster status: [{running_nodes,['emqx2@192.168.1.165']},
                 {stopped_nodes,['emqx1@192.168.1.162']}]
```
