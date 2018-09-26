## Q: EMQ X 是什么？

A: EMQ X 是开源百万级分布式 MQTT 消息服务器（MQTT Messaging Broker），用于支持各种接入标准 MQTT 协议的设备，实现从设备端到服务器端的消息传递，以及从服务器端到设备端的设备控制消息转发。从而实现物联网设备的数据采集，和对设备的操作和控制。




## Q: EMQ X 有哪些产品？

A: EMQ X 公司主要提供[三个产品](https://www.emqx.io/products)，主要体现在支持的连接数量、产品功能和商业服务等方面的区别：

- EMQ X Broker：EMQ X 开源版，提供 MQTT 协议、CoAP和LwM2M等常见物联网协议的支持；支持10万级的并发连接；

- EMQ X Enterprise：EMQ X 企业版，在开源版基础上，增加了数据持久化Redis、MySQL、MongoDB或PostgreSQL，数据桥接转发Kafka，LoRaWAN支持，监控管理，Kubernates部署等方面的支持；支持百万级并发连接；

- EMQ X Platform：EMQ X 平台版，在企业版基础上，支持千万级的连接和跨数据中心的解决方案，提供物联网平台全生命周期中需要的各种服务（咨询、培训、架构设计、定制开发、平台建设、功能测试与运维服务）。


## Q: EMQ X 企业版（Enterprise）和开源版（Broker）的主要区别是什么？

A: EMQ X 企业版基于开源版，包含了开源版的所有功能。与开源版相比，主要有以下方面的区别：

- 接入设备量级：开源版的稳定接入为10万，而企业版为100万。

- 数据持久化：企业版支持将消息转储到各类持久化数据库中，包括流行的关系型数据库，比如MySQL、PostgresSQL；内存数据库Redis；非关系型数据库MongoDB等；

- Kafka 数据桥接：通过内置桥接插件高效转发 MQTT 消息到 Kafka 集群，用户可以通过消费 Kafka 消息来实现实时流式数据的处理；

- RabbitMQ 数据桥接：支持 MQTT 消息桥接转发 RabbitMQ，应用可以通过消费 RabbitMQ 消息来实现可能的异构系统的集成；

- 监控管理（EMQ X Control Center）

  - EMQ X 集群监控：包括连接、主题、消息和对话（session）统计等

  - Erlang 虚拟机监测：Erlang 虚拟机的进程、线程、内存、数据库和锁的使用等

  - 主机监控：CPU、内存、磁盘、网络和操作系统等各类指标

- 安全特性：通过配置基于TLS、DTLS的安全连接（证书）等来提供更高级别安全保证。




## Q: 怎么样才能使用 EMQ X？

A: EMQ X 开源版可免费下载使用，下载地址：[https://www.emqx.io/downloads/emq/broker](https://www.emqx.io/downloads/emq/broker?osType=Linux)

EMQ X 企业版支持下载试用，用户可以在[https://www.emqx.io/downloads/emq/enterprise](https://www.emqx.io/downloads/emq/enterprise?osType=Linux)下载，[申请试用license](https://www.emqx.io/account?tab=login)之后即可试用。

另外，还可以在公有云直接创建 EMQ X 企业版：

- [阿里云](https://market.aliyun.com/products/56014009/cmjj029182.html?spm=5176.730005.productlist.d_cmjj029182.53cf3524sCmfnp)

- [青云](https://appcenter.qingcloud.com/search/category/iot)

## Q: EMQ X 提供方案咨询服务吗？

A: 提供。EMQ X 在为客户搭建物联网平台的咨询方面有丰富的经验，包括为互联网客户和电信运营商搭建千万级物联网平台的实践。包括如何搭建负载均衡、集群、安全策略、数据存储和分析方案等方面可以根据客户的需求制定方案，满足业务发展的需求。

## Q: EMQ X 推荐部署的操作系统是什么？

A: EMQ X 支持跨平台部署在Linux、Windows、MacOS、ARM嵌入系统，生产系推荐在 CentOS、Ubuntu、Debian 等 Linux 发行版上部署。

## Q: EMQ X 支持Windows操作系统吗？

A: 支持。部署参考[文章](https://www.jianshu.com/p/e5cf0c1fd55c).

## Q: EMQ X 支持私有协议进行扩展吗？如支持应该如何实现？

A: TODO...

## Q: EMQ X 如何预估资源的使用？

A: EMQ X 对资源的使用主要有以下的影响因素，每个因素都会对计算和存储资源的使用产生影响：

- 连接数：对于每一个 MQTT 长连接，EMQ X 会创建两个Erlang进程，每个进程都会耗费一定的资源。连接数越高，所需的资源越多；

- 平均吞吐量：值的是每秒 Pub 和 Sub 的消息数量。吞吐量越高，EMQ X 的路由处理和消息转发处理就需要更多的资源；

- 消息体大小：消息体越大，在 EMQ X 中处理消息转发的时候在内存中进行数据存储和处理，所需的资源就越多；

- 主题数目：如果主题数越多，在EMQ X中的路由表会相应增长，因此所需的资源就越多；

- QoS：消息的 QoS 越高，EMQ X 服务器端所处理的逻辑会更多，因此会耗费更多的资源；

另外，如果设备通过TLS（加密的连接）连接EMQ X，EMQ X 会需要额外的资源（主要是CPU资源）。推荐方案是在 EMQ X 前面部署负载均衡，由负载均衡节点卸载TLS，实现职责分离。

可参考[TODO](https://www.emqx.io)来预估计算资源的使用；公有云快速部署 EMQ X 实例，请参考[TODO](https://www.emqx.io)。

## Q: 什么是认证鉴权？使用场景是什么？

A: 认证鉴权指的是当一个客户端连接到 MQTT 服务器的时候，通过服务器端的配置来控制客户端连接服务器的权限。EMQ的认证机制包含了有三种，

- 用户名密码：针对每个 MQTT 客户端的连接，可以在服务器端进行配置，用于设定用户名和密码，只有在用户名和密码匹配的情况下才可以让客户端进行连接

- ClientID：每个MQTT客户端在连接到服务器的时候都会有个唯一的ClientID，可以在服务器中配置可以连接该服务器的ClientID列表，这些ClientID的列表

- 匿名：允许匿名访问

通过用户名密码、ClientID认证的方式除了通过配置文件之外，还可以通过各类数据库和外部应用来配置，比如MySQL、PostgreSQL、Redis、MongoDB、HTTP和LDAP等。

## Q: 我可以捕获设备上下线的事件吗？该如何使用？

A: EMQ X 企业版支持捕获设备的上下线的事件，并将其保存到数据库中（支持的数据库包括Redis、MySQL、PostgreSQL、MongoDB和Cassandra）。用户可以通过配置文件指定所要保存的数据库，以及监听client.connected和client.disconnected事件，这样在设备上、下线的时候把数据保存到数据库中。

## Q: 什么是Hook？使用场景是什么？

A: 钩子（hook）指的是由 EMQ X 在连接、对话和消息触发某些事件的时候提供给对外部的接口，主要提供了如下的钩子，EMQ X提供了将这些hook产生的事件持久化至数据库的功能，从而很方便地查询得知客户端的连接、断开等各种信息。

- client.connected：客户端上线
- client.disconnected：客户端连接断开
- client.subscribe：客户端订阅主题
- client.unsubscribe：客户端取消订阅主题
- session.created：会话创建
- session.resumed：会话恢复
- session.subscribed：会话订阅主题后
- session.unsubscribed：会话取消订阅主题后
- session.terminated：会话终止
- message.publish：MQTT 消息发布
- message.delivered：MQTT 消息送达
- message.acked：MQTT 消息回执
- message.dropped：MQTT 消息丢弃

## Q: 什么是WebSocket？什么情况下需要通过WebSocket去连接EMQ X服务器？

A: WebSocket 是一种在基于HTTP连接上支持全双工通讯的协议，通过该协议，用户可以使用浏览器和服务器之间的双向通信，比如可以通过服务器往浏览器端推送消息。EMQ X 提供了 WebSocket 连接支持，用户可以在浏览器端直接实现对主题的订阅和消息发送等操作。

## Q: 我想限定某些主题只为特定的客户端所使用，EMQ X该如何进行配置？

A: EMQ X 支持限定客户端可以使用的主题，从而实现设备权限的管理。如果要做这样的限定，需要在 EMQ X 启用ACL（Access Control List），并禁用匿名访问和关闭无ACL命中的访问许可（为了测试调试方便，在默认配置中，后两项是开启的，请注意关闭）。

ACL 可以配置在文件中，或者配置在后台数据库中。下面例子是 ACL 控制文件的一个配置行，含义是用户“dashboard”可以订阅“$SYS/#”主题。ACL在后台数据库中的配置思想与此类似，详细配置方法请参阅EMQ X文档的相关章节。

```
{allow, {user, "dashboard"}, subscribe, ["$SYS/#"]}.
```


## Q: 什么是共享订阅？有何使用场景？

A: 共享订阅是 MQTT 5.0 标准的新特性，在标准发布前，EMQ X就已经把共享订阅作为标准外特性进行了支持。在普通订阅中，所有订阅者都会收到订阅主题的所有消息，而在共享订阅中，订阅同一个主题的客户端会轮流的收到这个主题下的消息，也就是说同一个消息不会发送到多个订阅者，从而实现订阅端的多个节点之间的负载均衡。

共享订阅对于数据采集/集中处理类应用非常有用。在这样的场景下，数据的生产者远多余数据的消费者，且同一条数据只需要被任意消费者处理一次。

## Q: EMQ X 能做流量控制吗？

A：能。目前EMQ X支持连接速率和消息率控制。配置如下：

```
## Value: Number
listener.tcp.external.max_conn_rate = 1000

## Value: rate,burst
listener.tcp.external.rate_limit = 1024,4096
```

## Q: 什么是离线消息？

A: 一般情况下 MQTT 客户端仅在连接到消息服务器的时候，如果客户端离线将收不到消息。但是在客户端有固定的ClientID，clean_session为false，且QoS设置满足服务器端的配置要求时，在客户端离线时，服务器可以为客户端保持一定量的离线消息，并在客户端再次连接是发送给客户端。

离线消息在网络连接不是很稳定时，或者对QoS有一定要求时非常有用。


## Q: 什么是代理订阅？使用场景是什么？

A: 通常情况客户端需要在连接到 EMQ X 之后主动订阅主题。代理订阅是指服务器为客户端订阅主题，这一过程不需要客户端参与，客户端和需要代理订阅的主题的对应关系保存在服务器中。

试用代理订阅可以集中管理大量的客户端的订阅，同时为客户端省略掉订阅这个步骤，可以节省客户端侧的计算资源和网络带宽。

*注：目前 EMQ X 企业版支持代理订阅。*


## Q: EMQ X 是如何实现支持大规模并发和高可用的？

A: 高并发和高可用是EMQ X的设计目标，为了实现这些目标EMQ X中应用了多种技术，比如：

- 利用Erlang/OTP平台的软实时、高并发和容错；
- 全异步架构；
- 连接、会话、路由、集群的分层设计；
- 消息平面和控制平面的分离等。

在精心设计和实现之后，单个EMQ X Enterprise节点就可以处理百万级的连接。

EMQ X 支持多节点集群，集群下整个系统的性能会成倍高于单节点，并能在单节点故障时保证系统服务不中断。


## Q: EMQ X 能把接入的 MQTT 消息保存到数据库吗？

A: EMQ X 企业版支持消息持久化，可以将消息保存到数据库，开源版还暂时不支持。目前EMQ X企业版消息持久化支持的数据库有：

- Redis
- MongoDB
- MySQL
- PostgreSQL
- Cassandra


## Q: EMQ X 能把接入的消息转发到 Kafka 吗？

A: 能。目前EMQ X企业版提供了内置的Kafka桥接方式，支持把消息桥接至Kafka进行流式处理。

## Q: EMQ X支持集群自动发现吗？有哪些实现方式？

A: EMQ X 支持集群自动发现。集群可以通过手动配置或自动配置的方式实现。

目前支持的自动发现方式有：

- 手动集群
- 静态集群
- DNS自动集群
- ETCD自动集群
- K8S自动集群


## Q: 我可以把 MQTT 消息从 EMQ X 转发其他消息中间件吗？例如RabbitMQ？

A: EMQ X 支持转发消息到其他消息中间件，通过 EMQ X 提供的桥接方式就可以做基于主题级别的配置，从而实现主题级别的消息转发。


## Q: 我可以把消息从 EMQ X 转到公有云 MQTT 服务上吗？比如 AWS 或者 Azure 的IoT Hub？

A: EMQ X 可以转发消息到公有云的 IoT Hub，通过 EMQ X 提供的桥接就可以实现。


## Q: MQTT Broker（比如Mosquitto）可以转发消息到EMQ X吗？

A: Mosquitto可以配置转发消息到EMQ X，请参考[TODO](https://www.emqx.io)。


## Q: 系统主题有何用处？都有哪些系统主题？

A: 系统主题以`$SYS/`开头。EMQ X会以系统主题的方式周期性的发布关于自身运行状态、MQTT协议统计、客户端上下线状态到系统主题。订阅系统主题可以获得这些信息。

这里列举一些系统主题，完整的系统主题请参考EMQ X文档的相关章节：

- $SYS/brokers:  集群节点列表
- $SYS/brokers/${node}/clients/${clientid}/connected: 当客户端连接是发送的客户端信息
- $SYS/broker/${node}/stats/connections/count: 当前客户端总数
- $SYS/broker/${node}/stats/sessions/count: 当前会话总数


## Q: 我想跟踪特定消息的发布和订阅过程，应该如何做？

A: EMQ X 支持追踪来自某个客户端的报文或者发布到某个主题的报文。追踪消息的发布和订阅需要使用命令行工具（emqx_ctl）的trace命令，下面给出一个最终‘topic’主题的消息并保存在`trace_topic.log`中的例子。更详细的说明请参阅EMQ X文档的相关章节。

```
./bin/emqx_ctl trace topic "topic" "trace_topic.log"
```


## Q: 为什么我做压力测试的时候，连接数目和吞吐量老是上不去，有系统调优指南吗？

A: 在做压力测试的时候，除了要选用有足够计算能力的硬件，也需要对软件运行环境做一定的调优。比如修改修改操作系统的全局最大文件句柄数，允许用户打开的文件句柄数，TCP的backlog和buffer，erlang虚拟机的进程数限制等等。甚至包括需要在客户端上做一定的调优以保证客户端可以有足够的连接资源。

系统的调优在不同的需求下有不同的方式，在EMQ X的文档[TODO](https://www.emqx.io)中对用于普通场景的调优有较详细的说明


## Q: 我的连接数目并不大，EMQ X 生产环境部署需要多节点吗？

A: 即使在连接数量，消息率不高的情况下（服务器低负载），在生产环境下部署多节点的集群依然收很有意义的。集群能提高系统的可用性，降低单点故障的可能性。当一个节点宕机时，其他在线节点可以保证整个系统的服务不中断。


## Q: EMQ X 支持加密连接吗？推荐的部署方案是什么？

A：EMQ X 支持加密连接。在生产环境部署时，推荐的方案是使用 Load Balancer 终结TLS。


