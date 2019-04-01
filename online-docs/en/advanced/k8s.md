# Building an EMQ X application in a Kubernetes cluster

## Docker
Virtualization realized from containerization represented by Docker is a trend in recent years. Compared with the traditional virtualization method, the application process in the container can run directly on the kernel of the host system. Since the container does not have a kernel and hardware virtualization is not required, containerized virtualization is more portable and flexible than traditional virtualization, and resource utilization for host systems is higher as well. In the methodology of a virtual machine, it is possible for a host device to virtualize a dozen VMs. If a Docker container is used by the same device, it is also possible to run hundreds of containers on the same host. At the same time, because the Docker image provides a complete runtime in addition to the kernel, it also ensures the environmental consistency of the container, which makes the application environment  in development and production consistent  and  avoids inconsistencies in operating results caused by environmental inconsistencies.

In practice, Docker can also be treated as a package of the application's environment, executable files, and command lines. Such a package is called an image and then deployed and run on the host (physical device or virtual machine). Once in operation, this running image is a container. This container runs in an isolated environment where the program being run is often the only program in the system. A host can run multiple containers as  the containers do not recognize the existence of each other. A container only completes one task.

From the perspective of operation and maintenance, the introduction of containers can greatly reduce the manual operation of the server. Services that exist in a container can be started, configured, maintained and scaled with tools.

For a more detailed description of Docker, please refer to [Docker Official Documentation](https://www.docker.com/resources).


## Kubernetes
Kubernetes is an open source container cluster management project launched by Google in 2014. It provides powerful support for infrastructure containerization, and it can complete rapid automatic deployment, expansion, and upgrade of the application. At the same time, it maintains good features of neutrality and openness, language-independent, easy to extend, and can be ported to public and private clouds.

Kubernetes has a complex architecture and a steep learning curve, and if you're new to Kubernetes, you'll see many concepts that may be unfamiliar at first. But once you get used to it, it's powerful for you. This article only introduces what is necessary to run EMQ X. If you need more detailed  knowledge about Kubernetes, you can access the [official Kubernetes documentation.](https://kubernetes.io/docs/home/)

下图来自Kubernetes.io，展示了Kubernetes的架构。

The picture below from kubernetes.io shows the architecture of Kubernetes.

![K8S architecture](../assets/k8s_architecture.png)

Kubernetes uses a variety of resources to be grouped into clusters (Kubernetes cluster), which can be defined in JSON or YAML. There are many types of resources. To start an application with Kubernetes, the following resources are usually required:

* Node

  A node is a physical or virtual host that runs Kubernetes. Node provides the underlying resources for running Kubernetes clusters, such as CPU, memory, and network services. 

  The most commonly used nodes are the master node and the worker node.

* Pod

  Pod is the lowest level of abstraction managed by Kubernetes. A Pod can contain one or more containers. These containers run on the same node and share its resources. Containers in the same Pod can communicate via Localhost mode. 

  Pod is an immutable layer in Kubernetes. Pods will not be upgraded but only be closed, discarded or replaced. The configuration and management of the Pod can be done through "deployment".

* Deployment

  ‘Deployment’ is the management engine of the Kubernetes cluster, which is responsible for managing the configuration and start-stop of Pod in the cluster, such as how many pods are in the cluster, what is running on the Pod, how to deal with the Pod when problems arise, and so on.

* Service

  A Kubernetes cluster can have multiple deployments, and each deployment can manage multiple pods. The ‘service’ is responsible for exposing the running application services to the outside. Service provides a two-way channel to the outside from both deployment and pod.

* Label

  Label is used to associate various resources.

The following sections of this article demonstrate how to build an EMQ X application by using Kubernetes.

## Environmental preparation

This article describes how to deploy EMQ X services on Kubernetes by taking the installation on the Unbuntu system of the local network as an example. The example in this article is not necessarily suitable for your needs, so, please be cautious with it.

Kubernetes is a distributed cluster consisting of multiple nodes. In this article we will install a master node and two working nodes. After the host environment is configured, docker-ce will be installed on the master node and the worker node.

Depending on your environment, you may need to add Docker's repo to your package management tool to get the latest version of Docker-CE. For details, please refer to [the Docker-CE documentation]((https://docs.docker.com/install/linux/docker-ce/)).

## Kubernetes master node

The cluster requires the following components on the master node:

- Etcd
- Kube-apiserver, an external RESTful API interface that can be called by clients and other components
- Kube-scheduler, which is responsible for resource scheduling
- Kube-controller-manager, which is responsible for managing the controller

We can use the kubeadm tool to install the components required by the master node and initialize the master node. The packages that need to be installed are:

- Kubeadm
- Kubelet
- Kubectl

To install the above package, you need to add google repo to apt's resource list, add google's apt key, and install apt's https transport support. The installation method for non-Ubuntu systems is similar.

```
$ sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
$ sudo cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
$ sudo apt-get update
$ sudo apt-get install -y kubelet kubeadm kubectl

```

Close swap:

```
$ sudo swapoff -a
```

Initialize the master node:

```
$ sudo kubeadm init
```

When the master node is initialized, such work as the initialization pre-check, start of the kubelet, creation of this certificate, the kubernetes control plane and etcd  will be completed. The etcd, kube-apiserver, kube-scheduler, and kube-controller-manager mentioned above are created in the form of a satic pod.

After the initialization process is finished, it will prompt to copy some files to a normal user, and start the kubernetes cluster as a normal user.

```
To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

```

At the end of the screen output, there will be the following command prompt containing token and cert hash which will be used when the worker node joins the cluster. please make a record for it. 

```
You can now join any number of machines by running the following on each node
as root:

  kubeadm join 192.168.1.184:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>

```

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

Check the kubernetes cluster status to see that there is  a master node currently：

```
$ kubectl cluster-info

Kubernetes master is running at https://192.168.1.184:6443
KubeDNS is running at https://192.168.1.184:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

```



## Kubernetes worker node

The worker node is the node where Kubernetes runs the reference program to service Pod. It is managed by the master node, and the master node can distribute the Pod to the worker node and start or stop the Pod.

Like the master node, Docker and kubeadm, kubelet, and kubectl need to be installed on the worker node. Note that the version of Docker on the worker node should be consistent with the master node, otherwise it may cause the worker node to be in the NotReady state for a long time. The installation process is the same as above.

After the installation is complete, there is no need to initialize the cluster on the worker node using kubeadm (which is already done on the master node). Here, you only need to run as root to join the cluster.

Join the cluster:

```
# kubeadm join 192.168.1.184:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

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

After two worker nodes are added to the cluster, the cluster status can be observed on the master node. A newly added node may be in the state of NotReady. After the node is started, the state will be Ready:

```
$ kubectl get nodes
NAME       STATUS     ROLES    AGE     VERSION
emq1       Ready      <none>   6m11s   v1.13.3
emq2       NotReady   <none>   10s     v1.13.3
ubuntu18   Ready      master   44m     v1.13.3
```

At this step, our Kubernetes cluster of 1 master node  and 2 worker nodes is established.

## Deploy EMQX to the kubernetes cluster

Create a namespace for the EMQ X application:

```
$ kubectl create namespace kube-emqx
namespace/kube-emqx created
```

To package the EMQ X image in the pod, we create a yaml file (emqx-pod.yaml) to define this resource.

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

The above file defines the pod namespace as kube-emqx, the  image used is emqx/emqx, and the service ports are 1883 and 18083. Kubernetes will automatically download the image in the docker repository.

Run the following command on the master node, and the pod will be created and deployed on an available worker node:

```
$ kubectl create -f emqx-pod.yaml
pod/mqtt created
```

We can check the status of this pod by using the ‘get pods’ command of kubectl:

```
$ kubectl get pods --namespace=kube-emqx -o wide
NAME   READY   STATUS    RESTARTS   AGE   IP           NODE   NOMINATED NODE   READINESS GATES
mqtt   1/1     Running   0          59s   10.244.1.4   emq1   <none>           <none>

```

Add a service to the Pod

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

In the above configuration, we select the pod with the label mqtt and expose the emqx mqtt broker service to the outside in the way of NodePort. NodePort is a simple way to expose services. It will serve the ports on the open nodes and expose them to the outside. By default, the externally exposed port number needs to be greater than 30,000. You can specify a port number or the system can configure it automatically. In the above example, we exposed port 31883 on the node to the outside and corresponded to port 1883 of emqx application in the container internally, and exposed port 30083 of the node to the outside and corresponded to port 18083 of emqx application in the container internally.



