# 在Kubernetes集群中构建 EMQ X 应用

# Building an EMQ X application in a Kubernetes cluster

## Docker
以Docker为代表的容器化来实现虚拟化是近年来的趋势，相较传统的虚拟化方式，容器内的应用进程可以直接运行在宿主系统的内核上，而容器自身并没有内核，也不需要进行硬件虚拟。因此，容器化的虚拟化方式比传统的虚拟化更加轻便灵活，对于宿主系统的资源利用率也更高。**<u>以虚拟机的方式，一台宿主设备可能可以虚拟十几个VM，同样的设备使用Docker容器的话，上百个容器运行在同一个宿主上也是可能的</u>**（可以变得有层次一些）。同时，由于Docker镜像提供除了内核以外的完整的运行时，**<u>也保证了容器的环境一致性，使得应用在开发和生产中的应用环境一致，避免出现环境不一致引起的运行结果不一致(语言不够简练)  。</u>**

Virtualization realized from containerization represented by Docker is a trend in recent years. Compared with the traditional virtualization method, the application process in the container can run directly on the kernel of the host system. Since the container does not have a kernel and hardware virtualization is not required, containerized virtualization is more portable and flexible than traditional virtualization, and resource utilization for host systems is higher as well. In the methodology of a virtual machine, it is possible for a host device to virtualize a dozen VMs. If a Docker container is used by the same device, it is also possible to run hundreds of containers on the same host. At the same time, because the Docker image provides a complete runtime in addition to the kernel, it also ensures the environmental consistency of the container, which makes the application environment  in development and production consistent  and  avoids inconsistencies in operating results caused by environmental inconsistencies.

**<u>在实践上，Docker也可以被看成是将应用程序的环境、执行文件和命令行等打包在一起（语句似乎不通顺）。</u>**这样的包被称为镜像（image），然后在宿主（物理设备或虚拟机）上部署和运行这个镜像。一旦运行起来，这个运行中的镜像就是一个容器。这个容器运行在一个封闭隔离的环境中，在这个环境里，被运行的程序往往是系统中唯一的一个程序。一个宿主，可以运行多个容器，**<u>而容器和容器之间并不知道对方的存在。一个容器只完成一个任务。（这两者是否有逻辑关系？容器不知道对方存在，建议改为容器之间没有通信或者信息传递）</u>**

In practice, Docker can also be treated as a package of the application's environment, executable files, and command lines. Such a package is called an image and then deployed and run on the host (physical device or virtual machine). Once in operation, this running image is a container. This container runs in an isolated environment where the program being run is often the only program in the system. A host can run multiple containers as  the containers do not recognize the existence of each other. A container only completes one task.

从运维角度来说，引入容器可以大幅度的降低对服务器的手工操作。以容器方式存在的服务都可以以工具启动和配置，并以工具维护和伸缩。

From the perspective of operation and maintenance, the introduction of containers can greatly reduce the manual operation of the server. Services that exist in a container can be started, configured, maintained and scaled with tools.

更详细的Docker说明请参考[Docker官方文档](https://www.docker.com/resources)。

For a more detailed description of Docker, please refer to [Docker Official Documentation](https://www.docker.com/resources).


## Kubernetes
**Kubernetes**是Google在2014年启动的一个开源容器集群管理项目。它为基础设施容器化提供了强大的支持，**<u>它的众多功能</u>**（不通顺）可以完成应用的快速自动部署、扩容、升级等功能。**<u>同时又保持了良好的中立性和开放性，开发语言无关，易于扩展，</u>**（有些不符合汉语习惯）并且可以移植到公有、私有云等各种环境。

Kubernetes is an open source container cluster management project launched by Google in 2014. It provides powerful support for infrastructure containerization, and it can complete rapid automatic deployment, expansion, and upgrade of the application. At the same time, it maintains good features of neutrality and openness, language-independent, easy to extend, and can be ported to public and private clouds.

Kubernetes的架构比较复杂，**学习曲线也比较陡峭**（不大复合汉语表达习惯，建议改为入门较难），如果您是第一次接触Kubernetes，一开始您就会看到许多可能是陌生的概念。但是一旦您熟悉之后，就会体会到它的强大。**本文尽量将覆盖范围限制在运行EMQ X所必须的程度**(有些拗口，建议改为本文仅介绍和EMQ X运行相关的部分)。如果您需要更详细的Kubernetes知识细节，您可以访问[Kubernetes的官方文档](https://kubernetes.io/docs/home/)。

Kubernetes has a complex architecture and a steep learning curve, and if you're new to Kubernetes, you'll see many concepts that may be unfamiliar at first. But once you get used to it, it's powerful for you. This article only introduces what is necessary to run EMQ X. If you need more detailed  knowledge about Kubernetes, you can access the [official Kubernetes documentation.](https://kubernetes.io/docs/home/)

下图来自Kubernetes.io，展示了Kubernetes的架构。

The picture below from kubernetes.io shows the architecture of Kubernetes.

![K8S architecture](../assets/k8s_architecture.png)

Kubernetes使用各种的资源组合成集群（Kubernetes cluster），这些资源可以用JSON或者YAML定义。资源的类型很多，需要用Kubernetes启动一个应用通常需要使用到以下资源：

Kubernetes uses a variety of resources to be grouped into clusters (Kubernetes cluster), which can be defined in JSON or YAML. There are many types of resources. To start an application with Kubernetes, the following resources are usually required:

* 节点（Node）

  节点是运行Kubernetes的物理或虚拟宿主机。节点提供运行Kubernetes集群的底层资源，比如CPU、内存和网络服务等。

  最常用的节点有主控节点（Master Node）和工作节点（Worker Node）

  A node is a physical or virtual host that runs Kubernetes. Node provides the underlying resources for running Kubernetes clusters, such as CPU, memory, and network services. 

  The most commonly used nodes are the master node and the worker node.

* Pod

  Pod是Kubernetes管理的最底层的抽象。一个Pod可以包含一个或者多个容器。这些容器运行在同一个节点上，**斌且(并且)**共享这个节点的资源。在同一个Pod中的容器可以通过Localhost方式通讯。

  Pod是Kubernetes中的不可变层（immutable layer）。Pod不会被升级，只会被关闭、丢弃或者替代。Pod的配置和管理可以通过“部署”来完成。

  Pod is the lowest level of abstraction managed by Kubernetes. A Pod can contain one or more containers. These containers run on the same node and share its resources. Containers in the same Pod can communicate via Localhost mode. 

  Pod is an immutable layer in Kubernetes. Pods will not be upgraded but only be closed, discarded or replaced. The configuration and management of the Pod can be done through "deployment".

* 部署（Deployment）

  “部署”是Kubernetes集群的管理引擎，负责管理集群中的Pod的配置和启停等工作。比如集群中有多少个Pod，Pod上运行的内容，出现问题如何处理Pod等。

  ‘Deployment’ is the management engine of the Kubernetes cluster, which is responsible for managing the configuration and start-stop of Pod in the cluster, such as how many pods are in the cluster, what is running on the Pod, how to deal with the Pod when problems arise, and so on.

* 服务（Service）

  一个Kubernetes集群可以有多个部署，每个部署管理多个Pod。而“服务”则负责将运行中的应用服务暴露给外部。Service提供了一个从部署和pod到外部的双向通道。

  A Kubernetes cluster can have multiple deployments, and each deployment can manage multiple pods. The ‘service’ is responsible for exposing the running application services to the outside. Service provides a two-way channel to the outside from both deployment and pod.

* 标签（Label）

  **标签，(似乎没必要)**用来关联各个资源。

  Label is used to associate various resources.

本文接下来的部分会以例子演示来说明如何使用Kubernetes 构建 EMQ X应用。

The following sections of this article demonstrate how to build an EMQ X application by using Kubernetes.

## 环境准备

## Environmental preparation

本文以本地网络的Unbuntu系统上安装为例，介绍如何在Kubernetes上部署EMQ X服务。本文的例子并不一定适合您的需求，请谨慎应用。

Kubernetes是分布式的集群，由多个节点组成。在本文中我们将安装一个主控节点和两个工作节点。装备宿主环境后，在主控节点和工作节点上安装docker-ce。

根据您的环境，您可能需要将Docker的repo添加到您的包管理工具中以获得最新版本的Docker-CE，具体方法请参考[Docker-CE文档](https://docs.docker.com/install/linux/docker-ce/)。

This article describes how to deploy EMQ X services on Kubernetes by taking the installation on the Unbuntu system of the local network as an example. The example in this article is not necessarily suitable for your needs, so, please be cautious with it.

Kubernetes is a distributed cluster consisting of multiple nodes. In this article we will install a master node and two working nodes. After the host environment is configured, docker-ce will be installed on the master node and the worker node.

Depending on your environment, you may need to add Docker's repo to your package management tool to get the latest version of Docker-CE. For details, please refer to [the Docker-CE documentation]((https://docs.docker.com/install/linux/docker-ce/)).

## Kubernetes 主控节点

## Kubernetes master node

集群在主控节点上需要以下组件：

- etcd
- Kube-apiserver 一个对外的RESTful API接口，可以供客户端和其他组件调用
- Kube-scheduler 负责对资源调度
- Kube-controller-manager 负责管理控制器

The cluster requires the following components on the master node:

- Etcd
- Kube-apiserver, an external RESTful API interface that can be called by clients and other components
- Kube-scheduler, which is responsible for resource scheduling
- Kube-controller-manager, which is responsible for managing the controller

**我们可以通过kubeadm工具来安装主控节点需要的组件并初始化主控节点。需要安装的包有（组件和包建议统一）**：

- Kubeadm
- Kubelet
- Kubectl

We can use the kubeadm tool to install the components required by the master node and initialize the master node. The packages that need to be installed are:

- Kubeadm
- Kubelet
- Kubectl

**要以上软件包（是安装吗）**需要添加google的repo到apt的资源列表中，添加google的apt key，并安装apt的https**传输支持（协议吗）**。非Ubuntu系统的安装方法类似。

To install the above package, you need to add google repo to apt's resource list, add google's apt key, and install apt's https transport support. The installation method for non-Ubuntu systems is similar.

```
$ sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
$ sudo cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
$ sudo apt-get update
$ sudo apt-get install -y kubelet kubeadm kubectl

```

关闭swap：

Close swap:

```
$ sudo swapoff -a
```

初始化主控节点：

Initialize the master node:

```
$ sudo kubeadm init
```

在主控节点初始化的时候，会完成初始化预检、启动kubelet，创建这个证书、创建kubernetes控制面、创建etcd等工作。上面提到的`etcd`，`kube-apiserver`,`kube-scheduler`和`kube-controller-manager`会以satic pod的形式被创建。

初始化过程在提示初始化成功之后，会提示复制一些文件给一个普通用户，并以普通用户来启动kubernetes集群：

When the master node is initialized, such work as the initialization pre-check, start of the kubelet, creation of this certificate, the kubernetes control plane and etcd  will be completed. The etcd, kube-apiserver, kube-scheduler, and kube-controller-manager mentioned above are created in the form of a satic pod.

After the initialization process is finished, it will prompt to copy some files to a normal user, and start the kubernetes cluster as a normal user.

```
To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

```

在屏幕输出的最后，会有如下包含token和cert has的命令提示，请做好记录。之后工作节点加入集群需要用到：

At the end of the screen output, there will be the following command prompt containing token and cert has which will be used when the worker node joins the cluster. please make a record for it. 

```
You can now join any number of machines by running the following on each node
as root:

  kubeadm join 192.168.1.184:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>

```





列出运行中的container应该能看到类似以下内容：

When Listing the running container, the following should be seen:

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



**以安装podnetwork（以flannel为例）:**(不通顺)

To install podnetwork (taking flannel as an example):

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

Check the kubernetes cluster status to see that there is  a master node currently：

```
$ kubectl cluster-info

Kubernetes master is running at https://192.168.1.184:6443
KubeDNS is running at https://192.168.1.184:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

```



## Kubernetes 工作节点

## Kubernetes worker node

工作节点是Kubernetes运行引用程序服务Pod的节点。它**收（受）主控节点的管理**，主控节点可以将Pod分发至发工作节点，并启停Pod。

通主控节点一样，在工作节点上也需要安装`Docker`和`kubeadm`、`kubelet`、`kubectl`。注意在工作节点上的Docker版本应该于主控节点的保持一致，否则有可能导致工作节点长时间出于NotReady状态。安装过程同上。

在安装完成之后，工作节点上不需要使用kubeadm对集群进行初始化（已经在主控节点上完成）**。这里只需要以root身份运行在主控节点初始化完成是系统给出的命令来加入集群即可。(语句不通顺)**

The worker node is the node where Kubernetes runs the reference program to service Pod. It is managed by the master node, and the master node can distribute the Pod to the worker node and start or stop the Pod.

Like the master node, Docker and kubeadm, kubelet, and kubectl need to be installed on the worker node. Note that the version of Docker on the worker node should be consistent with the master node, otherwise it may cause the worker node to be in the NotReady state for a long time. The installation process is the same as above.

After the installation is complete, there is no need to initialize the cluster on the worker node using kubeadm (which is already done on the master node). Here, you only need to run as root to join the cluster.

加入集群：

Join the cluster:

```
# kubeadm join 192.168.1.184:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

现在我们可以看到工作节点上有flannel和kube-proxy等容器运行：

Now we can see that the containers such as flannel and kube-proxy are running on worker node:

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

After two worker nodes are added to the cluster, the cluster status can be observed on the master node. A newly added node may be in the state of NotReady. After the node is started, the state will be Ready:

```
$ kubectl get nodes
NAME       STATUS     ROLES    AGE     VERSION
emq1       Ready      <none>   6m11s   v1.13.3
emq2       NotReady   <none>   10s     v1.13.3
ubuntu18   Ready      master   44m     v1.13.3
```

到这一步，我们的1主控节点+2工作节点的Kubernetes集群就建立完成了。

At this step, our Kubernetes cluster of 1 master node +2 worker nodes is established.

## 部署EMQX到kubernetes集群

## Deploy EMQX to the kubernetes cluster

为EMQ X应用建立一个namespace：

Create a namespace for the EMQ X application:

```
$ kubectl create namespace kube-emqx
namespace/kube-emqx created
```

为了EMQ X镜像打包在pod中，我们创建一个yaml文件（emqx-pod.yaml）来定义这个资源。

To package the EMQ X image in the pod, we create a yaml file (emqx-pod.yaml) to define this resource.

文件emqx-pod.yaml的一个示例：

An example of the file emqx-pod.yaml:

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

The above file defines the pod namespace as kube-emqx, the  image used is emqx/emqx, and the service ports are 1883 and 18083. Kubernetes will automatically download the image in the docker repository.

在主控节点上运行以下命令，这个pod将会被创建并被部署在一个可用的工作节点上：

Run the following command on the master node, and the pod will be created and deployed on an available worker node:

```
$ kubectl create -f emqx-pod.yaml
pod/mqtt created
```

通过`kubectl` 的`get pods`命令我们可以查看这个pod的状态：

We can check the status of this pod by using the ‘get pods’ command of kubectl:

```
$ kubectl get pods --namespace=kube-emqx -o wide
NAME   READY   STATUS    RESTARTS   AGE   IP           NODE   NOMINATED NODE   READINESS GATES
mqtt   1/1     Running   0          59s   10.244.1.4   emq1   <none>           <none>

```

为Pod添加服务

Add a service to the Pod

在运行EMQX的pod运行后，如果emqx直接向外提供mqtt broker服务，则需要将该应用对外暴露。在此，我们可以通过添加一个服务的方式来将emqx的应用对外暴露。建立服务的过程类似于上面建立pod的过程。首先我们创建一个yaml文件：

After the pod running EMQX runs, if EMQX provides MQTT broker services directly to the outside, the application needs to be exposed. Here, we can expose the emqx application by adding a service. The process of creating a service is similar to the process of creating a pod above. First we create a yaml file:

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

在以上配置中，**我们用选择起选择了标签问mqtt的pod(不通顺)**，以NodePort的方式，将emqx的mqtt broker服务对外暴露。NodePort是一种简单的服务暴露方式，他将服务开放节点上的的端口，再将这些端口暴露给外界。在默认情况下，对外暴露的端口号需要大于30000。可以指定一个端口号，也可以有系统自动配置。上例中，我们把节点上31883端口对外暴露并向内对应容器中emqx应用的1883端口，把节点的30083端口对外暴露并向内对应容器中emqx应用的18083端口。

In the above configuration, we select the pod with the label mqtt and expose the emqx mqtt broker service to the outside in the way of NodePort. NodePort is a simple way to expose services. It will serve the ports on the open nodes and expose them to the outside. By default, the externally exposed port number needs to be greater than 30,000. You can specify a port number or the system can configure it automatically. In the above example, we exposed port 31883 on the node to the outside and corresponded to port 1883 of emqx application in the container internally, and exposed port 30083 of the node to the outside and corresponded to port 18083 of emqx application in the container internally.



