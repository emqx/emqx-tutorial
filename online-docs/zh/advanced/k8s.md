# 在Kubernetes集群中构建 EMQ X 应用
## Docker
以Docker为代表的容器化来实现虚拟化是近年来的趋势，相较传统的虚拟化方式，容器内的应用进程可以直接运行在宿主系统的内核上，而容器自身并没有内核，也不需要进行硬件虚拟。因此，容器化的虚拟化方式比传统的虚拟化更加轻便灵活，对于宿主系统的资源利用率也更高。以虚拟机的方式，一台宿主设备可能可以虚拟十几个VM，而同样的设备使用Docker容器的话，上百个容器运行在同一个宿主上也是可能的。同时，由于Docker镜像提供除了内核以外的完整的运行时，也保证了容器的环境一致性，使得应用在开发和生产中的环境一致，避免出现环境不一致引起的运行结果不一致。

在实践上，Docker也可以被看成是应用程序的环境、执行文件和命令行等打包在一起。这样的包被称为镜像（image），然后在宿主（物理设备或虚拟机）上部署和运行这个镜像。一旦运行起来，这个运行中的镜像就是一个容器。这个容器运行在一个封闭隔离的环境中，在这个环境里，被运行的程序往往是系统中唯一的一个程序。一个宿主，可以运行多个容器，而容器和容器之间并不知道对方的存在。一个容器只完成一个任务。

从运维角度来说，引入容器可以大幅度的降低对服务器的手工操作。以容器方式存在的服务都可以以工具启动和配置，并以工具维护和伸缩。

更详细的Docker说明请参考[Docker官方文档](https://www.docker.com/resources)。


## Kubernetes
Kubernetes是Google在2014年启动的一个开源容器集群管理项目。它为基础设施容器化提供了强大的支持，可以完成应用的快速自动部署、扩容、升级等功能。Kubernetes同时又保持了良好的中立性和开放性，它和开发语言无关，易于扩展，并且可以移植到公有、私有云等各种环境。

Kubernetes的架构比较复杂，学习曲线也比较陡峭，如果您是第一次接触Kubernetes，一开始您就会看到许多可能是陌生的概念。但是一旦您熟悉之后，就会体会到它的强大。本文仅介绍运行EMQ X必须的部分。如果您需要更详细的Kubernetes知识细节，您可以访问[Kubernetes的官方文档](https://kubernetes.io/docs/home/)。

下图来自Kubernetes.io，展示了Kubernetes的架构。

![K8S architecture](../assets/k8s_architecture.png)

Kubernetes使用各种的资源组合成集群（Kubernetes cluster），这些资源可以用JSON或者YAML定义。资源的类型很多，需要用Kubernetes启动一个应用通常需要使用到以下资源：

* 节点（Node）

  节点是运行Kubernetes的物理或虚拟宿主机。节点提供运行Kubernetes集群的底层资源，比如CPU、内存和网络服务等。

  最常用的节点有主控节点（Master Node）和工作节点（Worker Node）

* Pod

  Pod是Kubernetes管理的最底层的抽象。一个Pod可以包含一个或者多个容器。这些容器运行在同一个节点上，并且共享这个节点的资源。在同一个Pod中的容器可以通过Localhost方式通讯。

  Pod是Kubernetes中的不可变层（immutable layer）。Pod不会被升级，只会被关闭、丢弃或者替代。Pod的配置和管理可以通过“部署”来完成。

* 部署（Deployment）

  “部署”是Kubernetes集群的管理引擎，负责管理集群中的Pod的配置和启停等工作。比如集群中有多少个Pod，Pod上运行的内容，出现问题如何处理Pod等。

* 服务（Service）

  一个Kubernetes集群可以有多个部署，每个部署管理多个Pod。而“服务”则负责将运行中的应用服务暴露给外部。Service提供了一个从部署和pod到外部的双向通道。

* 标签（Label）

  标签，用来关联各个资源。

本文接下来的部分会以例子演示来说明如何使用Kubernetes 构建 EMQ X应用。

## 环境准备
本文以本地网络的Unbuntu系统上安装为例，介绍如何在Kubernetes上部署EMQ X服务。本文的例子并不一定适合您的需求，请谨慎应用。

Kubernetes是分布式的集群，由多个节点组成。在本文中我们将安装一个主控节点和两个工作节点。装备宿主环境后，在主控节点和工作节点上安装docker-ce。

根据您的环境，您可能需要将Docker的repo添加到您的包管理工具中以获得最新版本的Docker-CE，具体方法请参考[Docker-CE文档](https://docs.docker.com/install/linux/docker-ce/)。

## Kubernetes 主控节点

集群在主控节点上需要以下组件：

* etcd
* Kube-apiserver 一个对外的RESTful API接口，可以供客户端和其他组件调用
* Kube-scheduler 负责对资源调度
* Kube-controller-manager 负责管理控制器

我们可以通过kubeadm工具来安装主控节点需要的组件并初始化主控节点。需要安装的包有：

* Kubeadm
* Kubelet
* Kubectl

要安装以上软件包需要添加google的repo到apt的资源列表中，添加google的apt key，并安装apt的https传输支持。非Ubuntu系统的安装方法类似。

```
$ sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
$ sudo cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
$ sudo apt-get update
$ sudo apt-get install -y kubelet kubeadm kubectl

```

关闭swap：

```
$ sudo swapoff -a
```

初始化主控节点：

```
$ sudo kubeadm init
```

在主控节点初始化的时候，会完成初始化预检、启动kubelet，创建这个证书、创建kubernetes控制面、创建etcd等工作。上面提到的`etcd`，`kube-apiserver`,`kube-scheduler`和`kube-controller-manager`会以satic pod的形式被创建。

初始化过程在提示初始化成功之后，会提示复制一些文件给一个普通用户，并以普通用户来启动kubernetes集群：

```
To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

```

在屏幕输出的最后，会有如下包含token和cert hash的命令提示，请做好记录。之后工作节点加入集群需要用到：

```
You can now join any number of machines by running the following on each node
as root:

  kubeadm join 192.168.1.184:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>

```

列出运行中的container应该能看到类似以下内容：

```
$ docker ps -a
CONTAINER ID        IMAGE                  COMMAND                  CREATED             STATUS                     PORTS               NAMES
45b797811750        98db19758ad4           "/usr/local/bin/kube…"   17 seconds ago      Up 17 seconds                                  k8s_kube-proxy_kube-proxy-nmrpk_kube-system_a92385a7-396c-11e9-9bcc-0800279e8ce2_0
b80ff76b3dc6        k8s.gcr.io/pause:3.1   "/pause"                 17 seconds ago      Up 17 seconds                                  k8s_POD_kube-proxy-nmrpk_kube-system_a92385a7-396c-11e9-9bcc-0800279e8ce2_0
b7ce44270bb3        0482f6400933           "kube-controller-man…"   43 seconds ago      Up 43 seconds                                  k8s_kube-controller-manager_kube-controller-manager-ubuntu18_kube-system_28e206bbbb7f71b37ec97822a0c233b4_0
2e0dc3fdedec        3a6f709e97a0           "kube-scheduler --ad…"   43 seconds ago      Up 43 seconds                                  k8s_kube-scheduler_kube-scheduler-ubuntu18_kube-system_b734fcc86501dde5579ce80285c0bf0c_0
2366c1ff236e        3cab8e1b9802           "etcd --advertise-cl…"   43 seconds ago      Up 43 seconds                                  k8s_etcd_etcd-ubuntu18_kube-system_17fc59d579031a3f54b93a8c2f1b3f7b_0
7e6679498711        fe242e556a99           "kube-apiserver --au…"   43 seconds ago      Up 43 seconds                                  k8s_kube-apiserver_kube-apiserver-ubuntu18_kube-system_71d1027cc253605ccacceb2554615b17_0
0ac27721153b        k8s.gcr.io/pause:3.1   "/pause"                 45 seconds ago      Up 43 seconds                                  k8s_POD_kube-scheduler-ubuntu18_kube-system_b734fcc86501dde5579ce80285c0bf0c_0
ac52922c9089        k8s.gcr.io/pause:3.1   "/pause"                 45 seconds ago      Up 43 seconds                                  k8s_POD_kube-controller-manager-ubuntu18_kube-system_28e206bbbb7f71b37ec97822a0c233b4_0
248607cf9a88        k8s.gcr.io/pause:3.1   "/pause"                 45 seconds ago      Up 43 seconds                                  k8s_POD_etcd-ubuntu18_kube-system_17fc59d579031a3f54b93a8c2f1b3f7b_0
d63a1c63ac22        k8s.gcr.io/pause:3.1   "/pause"                 45 seconds ago      Up 43 seconds                                  k8s_POD_kube-apiserver-ubuntu18_kube-system_71d1027cc253605ccacceb2554615b17_0

```



安装podnetwork（以flannel为例）:

```
$ kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

podsecuritypolicy.extensions/psp.flannel.unprivileged created
clusterrole.rbac.authorization.k8s.io/flannel created
clusterrolebinding.rbac.authorization.k8s.io/flannel created
serviceaccount/flannel created
configmap/kube-flannel-cfg created
daemonset.extensions/kube-flannel-ds-amd64 created
daemonset.extensions/kube-flannel-ds-arm64 created
daemonset.extensions/kube-flannel-ds-arm created
daemonset.extensions/kube-flannel-ds-ppc64le created
daemonset.extensions/kube-flannel-ds-s390x created
```

检查kubernetes集群状态可以看到目前有一个master节点：

```
$ kubectl cluster-info

Kubernetes master is running at https://192.168.1.184:6443
KubeDNS is running at https://192.168.1.184:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

```



## Kubernetes 工作节点

工作节点是Kubernetes运行引用程序服务Pod的节点。它受主控节点的管理，主控节点可以将Pod分发至发工作节点，并启停Pod。

通主控节点一样，在工作节点上也需要安装`Docker`和`kubeadm`、`kubelet`、`kubectl`。注意在工作节点上的Docker版本应该于主控节点的保持一致，否则有可能导致工作节点长时间出于NotReady状态。安装过程同上。

在安装完成之后，工作节点上不需要使用kubeadm对集群进行初始化（已经在主控节点上完成），只需要以root身份运行主控节点初始化完成时系统给出的命令加入集群即可。

加入集群：

```
# kubeadm join 192.168.1.184:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

现在我们可以看到工作节点上有flannel和kube-proxy等容器运行：

```
docker ps -a
CONTAINER ID        IMAGE                    COMMAND                  CREATED             STATUS                      PORTS               NAMES
98167a647148        ff281650a721             "/opt/bin/flanneld -…"   13 minutes ago      Up 13 minutes                                   k8s_kube-flannel_kube-flannel-ds-amd64-bc5ft_kube-system_e952241f-3971-11e9-9bcc-0800279e8ce2_0
abd33f3adcbe        quay.io/coreos/flannel   "cp -f /etc/kube-fla…"   13 minutes ago      Exited (0) 13 minutes ago                       k8s_install-cni_kube-flannel-ds-amd64-bc5ft_kube-system_e952241f-3971-11e9-9bcc-0800279e8ce2_0
ec3b3c52105f        k8s.gcr.io/kube-proxy    "/usr/local/bin/kube…"   13 minutes ago      Up 13 minutes                                   k8s_kube-proxy_kube-proxy-rl9s5_kube-system_e952646f-3971-11e9-9bcc-0800279e8ce2_0
a5d8a7178de0        k8s.gcr.io/pause:3.1     "/pause"                 13 minutes ago      Up 13 minutes                                   k8s_POD_kube-proxy-rl9s5_kube-system_e952646f-3971-11e9-9bcc-0800279e8ce2_0
b1e5ac492503        k8s.gcr.io/pause:3.1     "/pause"                 13 minutes ago      Up 13 minutes                                   k8s_POD_kube-flannel-ds-amd64-bc5ft_kube-system_e952241f-3971-11e9-9bcc-0800279e8ce2_0

```

在两个工作节点都加入集群后可以在主控节点上观察到集群状态。一个新加入的节点可能会处在NotReady的状态，等节点启动完成之后，状态会进入Ready：

```
$ kubectl get nodes
NAME       STATUS     ROLES    AGE     VERSION
emq1       Ready      <none>   6m11s   v1.13.3
emq2       NotReady   <none>   10s     v1.13.3
ubuntu18   Ready      master   44m     v1.13.3
```

到这一步，我们的1主控节点和2工作节点的Kubernetes集群就建立完成了。



## 部署EMQX到kubernetes集群

为EMQ X应用建立一个namespace：

```
$ kubectl create namespace kube-emqx
namespace/kube-emqx created
```

为了将EMQ X镜像打包在pod中，我们创建一个yaml文件（emqx-pod.yaml）来定义这个资源。

文件emqx-pod.yaml的一个示例：

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: mqtt
    labels: 
        name: emqx
        app: emqx
    namespace: kube-emqx

spec:
    containers:
    - image: emqx/emqx
      name: emqx
      ports:
      - name: mqtt
        containerPort: 1883
      - name: mqtt-http
        containerPort: 18083
```

以上文件定义了pod的名字空间为`kube-emqx`，使用的镜像为emqx/emqx，服务端口为1883和18083。kubernetes会自动在docker仓库下载镜像。

在主控节点上运行以下命令，这个pod将会被创建并被部署在一个可用的工作节点上：

```
$ kubectl create -f emqx-pod.yaml
pod/mqtt created
```

通过`kubectl` 的`get pods`命令我们可以查看这个pod的状态：

```
$ kubectl get pods --namespace=kube-emqx -o wide
NAME   READY   STATUS    RESTARTS   AGE   IP           NODE   NOMINATED NODE   READINESS GATES
mqtt   1/1     Running   0          59s   10.244.1.4   emq1   <none>           <none>

```

为Pod添加服务
在运行EMQX的pod运行后，如果emqx直接向外提供mqtt broker服务，则需要将该应用对外暴露。在此，我们可以通过添加一个服务的方式来将emqx的应用对外暴露。建立服务的过程类似于上面建立pod的过程。首先我们创建一个yaml文件：

```
apiVersion: v1
kind: Service
metadata:
    name: emqx
    labels:
      name: emqx
      app: emqx
    namespace: kube-mqtt
      
spec:
    selector:
      name: mqtt
    type: NodePort
    ports:
    - name: mqtt
      nodePort: 31883
      port: 1883
      targetPort: 1883
      protocol: TCP
      
    - name: mqtt-http
      nodePort: 30083
      port: 18083
      targetPort: 18083
      protocol: TCP
```

在以上配置中，我们选择了标签为mqtt的pod，以NodePort的方式，将emqx的mqtt broker服务对外暴露。NodePort是一种简单的服务暴露方式，他将服务开放节点上的的端口，再将这些端口暴露给外界。在默认情况下，对外暴露的端口号需要大于30000。可以指定一个端口号，也可以有系统自动配置。上例中，我们把节点上31883端口对外暴露并向内对应容器中emqx应用的1883端口，把节点的30083端口对外暴露并向内对应容器中emqx应用的18083端口。



