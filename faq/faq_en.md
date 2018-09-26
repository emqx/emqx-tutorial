## Q: What's EMQ X?

A: EMQ X is an open-source, distributed MQTT messaging broker, it can support up to million level of concurrent MQTT connections.  It can be used to connected to any devices that supports MQTT protocol, and it can also be used for delivering message from server side to client. 




## Q: How many products in EMQ X?

A: EMQ X totally has [3 products.](https://www.emqx.io/products) Different products supports different level of connections, features and services etc.

- EMQ X Broker: EMQ X open source version, support the popular IoT protocols, such as MQTT, CoAP and LwM2M. It supports 100k level concurrent MQTT connections.

- EMQ X Enterprise: EMQ X enterprise version.  It is based on open source version, and  adds data persistance (support Redis, MySQL, MongoDB or PostgreSQL),  data bridge to Kafka, LoRaWAN support, EMQ monitoring, Kubernates deployment etc.  It supports 1M level concurrent MQTT connections.

- EMQ X Platform: EMQ X Platform version is based on Enterprise version，and support 10M level concurrent MQTT connections. We can provide consulting service for complex IoT platforms, such as cross data center solutions. All kinds of servcies building an IoT platform can be provided, such as consulting, training, architect design, customized development, platform implementation, testing and operation. 


## Q: What's the major difference between EMQ X enterprise and broker?

A: EMQ X Enterprise (enterprise version) is based on Broker (open source version), it includes all of features of open source version.  Comparing to open source version, it has following difference:

- Concurrent connection level: the stable concurrent concurrent connection level for open source version is 100k, while enterprise version is 1M. 

- Data persistance: Enterprise version supports to persist data to several kinds of databases, includes the popular relational database, such as MySQL, PostgresSQL; Memory database, such as Redis; Non-SQL DB, such as MongoDB. 

- Kafka brdige: Forward MQTT message to Kafka clusters through internal bridge plugins, application can consome Kafka message to implement the streaming data process.

- RabbitMQ bridge: Support to forward MQTT message to RabbitMQ, application can consume RabbitMQ message to integrate the 3rd party system.

- System monitoring (EMQ X Control Center)

  - EMQ X cluster monitor: Include statistics of connections, topics, message & sessions.

  - Erlang VM monitor: Erlang process, threads, memory, distributed database & distributed locks etc. 

  - Host monitor: Measurements of CPU, memory, disk, network and operate system.

- Securities: By configuration of TLS, DTLS connections and certifications to get higher secured connections.




## Q: How to use EMQ X?

A: EMQ X Broker is free and it can be download at [https://www.emqx.io/downloads/emq/broker](https://www.emqx.io/downloads/emq/broker?osType=Linux).

EMQ X Enterprise can be downloaded and evaluated by free.  You can download it from [https://www.emqx.io/downloads/emq/enterprise](https://www.emqx.io/downloads/emq/enterprise?osType=Linux), and the apply trial license at[https://www.emqx.io/account?tab=login](https://www.emqx.io/account?tab=login).

Also you can use the EMQ X enterprise version through public cloud service. 

- [TODO AWS](https://www.emqx.io)

  


## Q: Can EMQ X provide consulting service?

A: Yes. We have rich experience at consulting of building IoT platforms, include practice of helping Internet companies and carriers to build 10M level concurrent connections.  We can help to customize solutions for creating load-balancing, clustering, security policies, data storage and analytics, and to make the solution can satisfy future business evolvment. 

## Q: What's EMQ X suggested OS?

A: EMQ X supports to deploy at Linux, Windows, MacOS, ARM system, and suggest to deploy product environment at issued Linux version, such as CentOS, Ubuntu and Debian.

## Q: Can EMQ X support customized protocols? How to implement?

A: TODO...

## Q: How to estimize reource usage of EMQ X?

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

## Q: Can I capture device online and offline events? How to use it? 

A: EMQ X 企业版支持捕获设备的上下线的事件，并将其保存到数据库中（支持的数据库包括Redis、MySQL、PostgreSQL、MongoDB和Cassandra）。用户可以通过配置文件指定所要保存的数据库，以及监听client.connected和client.disconnected事件，这样在设备上、下线的时候把数据保存到数据库中。

## Q: What's Hook? What's the use scenario?

A: 钩子（hook）指的是由 EMQ X 在连接、对话和消息触发某些事件的时候提供给对外部的接口，主要提供了如下的钩子，EMQ X提供了将这些hook产生的事件持久化至数据库的功能，从而很方便地查询得知客户端的连接、断开等各种信息。

- client.connected: client online
- client.disconnected: client offline
- client.subscribe: client subscribes topics
- client.unsubscribe: client unsubscribes topics 
- session.created: session was created
- session.resumed: session is resumed
- session.subscribed: after session subscribe topic
- session.unsubscribed: after session unsubscribe topic
- session.terminated: session is terminated
- message.publish: MQTT message is publish
- message.delivered: MQTT message is delivered
- message.acked: MQTT message is acknowledged
- message.dropped: MQTT message is dropped

## Q: What's webSocket? When to use websocket to connect EMQ X?

A: WebSocket is a full-duplex communication based on HTTP protocol, user can realize dual communications  beween browser and server. Through Websocket, server can push message to web browser. EMQ X provides support of WebSocket, user can realize pub to topics and sub to topic from browsers. 

## Q: I want to control topics can be used for specific clients, how to configure it in EMQ X?

A: EMQ X can constrain clients used topics to realize device access controls. To use the feature, ACL (Access Control List) should be enabled, disable anonymous access and close 关闭无ACL命中的访问许可(?) (To debug convenient, the last 2 options are enabled by default, and please close them).

ACL can be configured in config file, or backend databases. Below is one of sample line for ACL control file, the meaning is user 'dashboard' can subscribe '$SYS/#' topic. ACL configuration in backend databases is similar, refer to EMQ X document for more detailed configurations.

```
{allow, {user, "dashboard"}, subscribe, ["$SYS/#"]}.
```


## Q: What's shared subscription, and it's use scenario?

A: Shared subscription is a new feature of MQTT 5.0 specification. Before the feature was introduced in MQTT 5.0 specification, EMQ 2.x already supported the feature as non-standard MQTT protocol. In general subscriptions, all of subscribers will receive ALL message for the subscribed topics, while clients that subscribe the same topic will receive the message with round-robin way, so one message will not be delivered to different clients. By this way, the subscribers can be load-balanced.

Shared subscription is very useful in data collection and centralized data analysis applications. In such cases,  number of data producers is much larger than consumers, and one message is ONLY need to be consumed by once.

## Q: Can EMQ X support traffic control?

A：Yes. Currently EMQ X supports to control connection rate and message publish rate. Refer to below for sample configuration.

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


