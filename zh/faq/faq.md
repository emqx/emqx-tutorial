## Q: EMQ X 是什么？

A: EMQ X 是开源百万级分布式 MQTT 消息服务器（MQTT Messaging Broker），用于支持各种接入标准 MQTT 协议的设备，实现从设备端到服务器端的消息传递，以及从服务器端到设备端的设备控制消息转发。从而实现物联网设备的数据采集，和对设备的操作和控制。

## Q: 为什么选择EMQ X？

A: EMQ X 与别的 MQTT 服务器相比，有以下的优点：

- 经过100+版本的迭代，EMQ X 目前为开源社区中最流行的 MQTT 消息中间件，在各种客户严格的生产环境上经受了严苛的考验；
- EMQ X 支持丰富的物联网协议，包括 MQTT、MQTT-SN、CoAP、 LwM2M、LoRaWAN 和 WebSocket 等；
- 优化的架构设计，支持超大规模的设备连接。企业版单机能支持百万的 MQTT 连接；集群能支持千万级别的 MQTT 连接；
- 易于安装和使用；
- 灵活的扩展性，支持企业的一些定制场景；
- 中国本地的技术支持服务，通过微信、QQ等线上渠道快速响应客户需求；

## Q: EMQ X 与物联网平台的关系是什么？

A: 典型的物联网平台包括设备硬件、数据采集、数据存储、分析、Web / 移动应用等。EMQ X 位于数据采集这一层，分别与硬件和数据存储、分析进行交互，是物联网平台的核心：前端的硬件通过 MQTT 协议与位于数据采集层的 EMQ X 交互，通过 EMQ X 将数据采集后，通过 EMQ X 提供的数据接口，将数据保存到后台的持久化平台中（各种关系型数据库和 NOSQL 数据库），或者流式数据处理框架等，上层应用通过这些数据分析后得到的结果呈现给最终用户。


## Q: EMQ X 有哪些产品？

A: EMQ X 公司主要提供[三个产品](https://www.emqx.io/products)，主要体现在支持的连接数量、产品功能和商业服务等方面的区别：

- EMQ X Broker：EMQ X 开源版，提供 MQTT 协议、CoAP 和 LwM2M 等常见物联网协议的支持；支持 10 万级的并发连接；

- EMQ X Enterprise：EMQ X 企业版，在开源版基础上，增加了数据持久化 Redis、MySQL、MongoDB 或 PostgreSQL，数据桥接转发 Kafka，LoRaWAN 支持，监控管理，Kubernates 部署等方面的支持；支持百万级并发连接；

- EMQ X Platform：EMQ X 平台版，在企业版基础上，支持千万级的连接和跨数据中心的解决方案，提供物联网平台全生命周期中需要的各种服务（咨询、培训、架构设计、定制开发、平台建设、功能测试与运维服务）。


## Q: EMQ X 企业版（Enterprise）和开源版（Broker）的主要区别是什么？

A: EMQ X 企业版基于开源版，包含了开源版的所有功能。与开源版相比，主要有以下方面的区别：

- 接入设备量级：开源版的稳定接入为 10 万，而企业版为 100 万。

- 数据持久化：企业版支持将消息转储到各类持久化数据库中，包括流行的关系型数据库，比如 MySQL、PostgresSQL；内存数据库 Redis；非关系型数据库 MongoDB 等；

- Kafka 数据桥接：通过内置桥接插件高效转发 MQTT 消息到 Kafka 集群，用户可以通过消费 Kafka 消息来实现实时流式数据的处理；

- RabbitMQ 数据桥接：支持 MQTT 消息桥接转发 RabbitMQ，应用可以通过消费 RabbitMQ 消息来实现可能的异构系统的集成；

- 监控管理（EMQ X Control Center）

  - EMQ X 集群监控：包括连接、主题、消息和对话（session）统计等

  - Erlang 虚拟机监测：Erlang 虚拟机的进程、线程、内存、数据库和锁的使用等

  - 主机监控：CPU、内存、磁盘、网络和操作系统等各类指标

- 安全特性：通过配置基于 TLS、DTLS 的安全连接（证书）等来提供更高级别安全保证。

## Q: EMQ X 与 NB-IoT、LoRAWAN 的关系是什么？

A: EMQ X 是一个开源的 MQTT 消息服务器，并且 MQTT 是一个 TCP 协议栈上位于应用层的协议；而 NB-IoT 和 LoRAWAN 在 TCP 协议层处于物理层，负责物理信号的传输。因此两者在 TCP 协议栈的不同层次上，实现不同的功能。


## Q: 怎么样才能使用 EMQ X？

A: EMQ X 开源版可免费下载使用，下载地址：[https://www.emqx.io/downloads#broker](https://www.emqx.io/downloads#broker)

EMQ X 企业版支持下载试用，用户可以在 [https://www.emqx.io/downloads#enterprise](https://www.emqx.io/downloads#enterprise) 下载，[申请试用 license](https://www.emqx.io/licenses#trial)之后即可试用。

另外，还可以在公有云直接创建 EMQ X 企业版：

- [阿里云](https://market.aliyun.com/products/56014009/cmjj029979.html?spm=5176.730005.productlist.d_cmjj029979.69013524xism4L&innerSource=search_EMQ)

- [青云](https://appcenter.qingcloud.com/search/category/iot)


## Q: 怎样更新 EMQ X license?
      
点击 "Download License" 按钮下载 license, 然后找到您下载的 "license.zip" 文件并解压.

复制压缩包里的两个文件 (emqx.lic, emqx.key) 到 EMQ X 的 license 目录.

如果您的 EMQX 是使用 zip 包安装的, 那么压缩包里的两个文件需要拷贝到 "emqx/etc/" 目录;
如果是用 DEB/RPM 包安装的, 两个文件需要拷贝到 "/etc/emqx/" 目录;
如果是用 Docker 镜像安装的, 两个文件需要拷贝到 "/opt/emqx/etc/" 目录.

拷贝完成后需要通过命令行重新加载 license 以完成更新：

基础命令：

```
emqx_ctl license reload [license 文件所在路径]
```

不同安装方式更新命令如下：

```
## 适用于 zip 包
./bin/emqx_ctl license reload etc/emqx.lic

## DEB/RPM 包安装
emqx_ctl license reload /etc/emqx/emqx.lic

## Docker 镜像安装
docker exec -it emqx-ee emqx_ctl license reload /opt/emqx/etc/emqx.lic
```



## Q: EMQ X 提供方案咨询服务吗？

A: 提供。EMQ X 在为客户搭建物联网平台的咨询方面有丰富的经验，包括为互联网客户和电信运营商搭建千万级物联网平台的实践。包括如何搭建负载均衡、集群、安全策略、数据存储和分析方案等方面可以根据客户的需求制定方案，满足业务发展的需求。

## Q: EMQ X 推荐部署的操作系统是什么？

A: EMQ X 支持跨平台部署在 Linux、Windows、MacOS、ARM 嵌入系统，生产系推荐在 CentOS、Ubuntu、Debian 等 Linux 发行版上部署。

## Q: EMQ X 支持 Windows 操作系统吗？

A: 支持。部署参考[文章](https://www.jianshu.com/p/e5cf0c1fd55c).

## Q: EMQ X 支持私有协议进行扩展吗？如支持应该如何实现？

A: 对于新开发的私有协议，EMQ X 提供一套 TCP 协议接入规范，私有协议可以按照该规范进行开发接入。如果您所使用的协议已经定型或协议底层非 TCP，可以通过网关进行转换处理，之后通过 MQTT 协议接入 EMQ X，或直接联系 EMQ 官方支持私有协议适配。

## Q: EMQ X 如何预估资源的使用？

A: EMQ X 对资源的使用主要有以下的影响因素，每个因素都会对计算和存储资源的使用产生影响：

- 连接数：对于每一个 MQTT 长连接，EMQ X 会创建两个 Erlang 进程，每个进程都会耗费一定的资源。连接数越高，所需的资源越多；

- 平均吞吐量：指的是每秒 Pub 和 Sub 的消息数量。吞吐量越高，EMQ X 的路由处理和消息转发处理就需要更多的资源；

- 消息体大小：消息体越大，在 EMQ X 中处理消息转发的时候在内存中进行数据存储和处理，所需的资源就越多；

- 主题数目：如果主题数越多，在 EMQ X 中的路由表会相应增长，因此所需的资源就越多；

- QoS：消息的 QoS 越高，EMQ X 服务器端所处理的逻辑会更多，因此会耗费更多的资源；

另外，如果设备通过 TLS（加密的连接）连接 EMQ X，EMQ X 会需要额外的资源（主要是 CPU 资源）。推荐方案是在 EMQ X 前面部署负载均衡，由负载均衡节点卸载 TLS，实现职责分离。

可参考 [TODO](https://www.emqx.io) 来预估计算资源的使用；公有云快速部署 EMQ X 实例，请参考[TODO](https://www.emqx.io)。

## Q: MQTT 协议与 HTTP 协议相比，有何优点和弱点?

A: HTTP 协议是一个无状态的协议，每个 HTTP 请求为 TCP 短连接，每次请求都需要重新创建一个 TCP 连接（可以通过 keep-alive 属性来优化 TCP 连接的使用，多个 HTTP 请求可以共享该 TCP 连接）；而 MQTT 协议为长连接协议，每个客户端都会保持一个长连接。与 HTTP 协议相比优势在于
：

- MQTT 的长连接可以用于实现从设备端到服务器端的消息传送之外，还可以实现从服务器端到设备端的实时控制消息发送，而 HTTP 协议要实现此功能只能通过轮询的方式，效率相对来说比较低；

- MQTT 协议在维护连接的时候会发送心跳包，因此协议以最小代价内置支持设备 “探活” 的功能，而 HTTP 协议要实现此功能的话需要单独发出 HTTP 请求，实现的代价会更高；

- 低带宽、低功耗。MQTT 在传输报文的大小上与 HTTP 相比有巨大的优势，因为 MQTT 协议在连接建立之后，由于避免了建立连接所需要的额外的资源消耗，发送实际数据的时候报文传输所需带宽与 HTTP 相比有很大的优势，参考网上[有人做的测评](https://medium.com/@flespi/http-vs-mqtt-performance-tests-f9adde693b5f )，发送一样大小的数据，MQTT 比 HTTP 少近 50 倍的网络传输数据，而且速度快了将近 20 倍。在网上有人做的[另外一个评测显示](http://stephendnicholas.com/posts/power-profiling-mqtt-vs-https )，接收消息的场景，MQTT 协议的耗电量为 HTTP 协议的百分之一，而发送数据的时候 MQTT 协议的耗电量为 HTTP 协议的十分之一；

- MQTT 提供消息质量控制（QoS），消息质量等级越高，消息交付的质量就越有保障，在物联网的应用场景下，用户可以根据不同的使用场景来设定不同的消息质量等级；

## Q: 什么是认证鉴权？使用场景是什么？

A: 认证鉴权指的是当一个客户端连接到 MQTT 服务器的时候，通过服务器端的配置来控制客户端连接服务器的权限。EMQ 的认证机制包含了有三种，

- 用户名密码：针对每个 MQTT 客户端的连接，可以在服务器端进行配置，用于设定用户名和密码，只有在用户名和密码匹配的情况下才可以让客户端进行连接

- ClientID：每个 MQTT 客户端在连接到服务器的时候都会有个唯一的 ClientID，可以在服务器中配置可以连接该服务器的 ClientID 列表，这些 ClientID 的列表里的客户端可以连接该服务器

- 匿名：允许匿名访问

通过用户名密码、ClientID 认证的方式除了通过配置文件之外，还可以通过各类数据库和外部应用来配置，比如 MySQL、PostgreSQL、Redis、MongoDB、HTTP 和 LDAP 等。

## Q: 我可以捕获设备上下线的事件吗？该如何使用？

A: EMQ X 企业版可以通过以下的三种方式捕获设备的上下线的事件，

- Web Hook
- 订阅相关的 $SYS 主题
  - $SYS/brokers/${node}/clients/${clientid}/connected
  - $SYS/brokers/${node}/clients/${clientid}/disconnected
- 直接保存到数据库

最后一种方法只有在企业版里才支持，支持的数据库包括 Redis、MySQL、PostgreSQL、MongoDB 和 Cassandra。用户可以通过配置文件指定所要保存的数据库，以及监听 client.connected 和 client.disconnected 事件，这样在设备上、下线的时候把数据保存到数据库中。

## Q: 什么是 Hook？使用场景是什么？

A: 钩子（hook）指的是由 EMQ X 在连接、对话和消息触发某些事件的时候提供给对外部的接口，主要提供了如下的钩子，EMQ X 提供了将这些 hook 产生的事件持久化至数据库的功能，从而很方便地查询得知客户端的连接、断开等各种信息。

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

## Q: 什么是 mqueue？如何配置 mqueue？

A: mqueue 是 EMQ X 在消息发布流程中保存在会话中的一个消息队列，当 MQTT 连接报文中的 clean session 设置为 false 的时候，即使是客户端断开连接的情况下，EMQ X 也会为断连客户端保存一个会话，这个会话会缓存订阅关系，并代替断开连接的客户端去接收订阅主题上的消息，而这些消息会存在 EMQ X 的 mqueue 中，等到客户端重新上线再将消息重新发给客户端。由于 qos0 消息在 MQTT 协议中的优先级比较低，所以 EMQ X 默认不缓存 qos 0 的消息，mqueue 在 EMQ X 中是可以配置的，通过配置 `zone.$name.mqueue_store_qos0 = true` 可以将 qos0 消息也存在 mqueue 中，mqueue 的大小也是有限制的，通过配置项 `zone.external.max_mqueue_len` ，可以确定每个会话缓存的消息数量。注意，这些消息是存储在内存中的，所以尽量不要将 mqueue 长度限制修改为 0（设置为 0 代表 mqueue 长度没有限制），否则在实际的业务场景中，有内存耗光的风险。

## Q: 什么是 WebSocket？什么情况下需要通过 WebSocket 去连接 EMQ X 服务器？

A: WebSocket 是一种在基于 HTTP 协议上支持全双工通讯的协议，通过该协议，用户可以实现浏览器和服务器之间的双向通信，比如可以通过服务器往浏览器端推送消息。EMQ X 提供了 WebSocket 连接支持，用户可以在浏览器端直接实现对主题的订阅和消息发送等操作。

## Q: 我想限定某些主题只为特定的客户端所使用，EMQ X 该如何进行配置？

A: EMQ X 支持限定客户端可以使用的主题，从而实现设备权限的管理。如果要做这样的限定，需要在 EMQ X 启用 ACL（Access Control List），并禁用匿名访问和关闭无 ACL 命中的访问许可（为了测试调试方便，在默认配置中，后两项是开启的，请注意关闭）。

```bash
## etc/emqx.conf

## ACL nomatch
mqtt.acl_nomatch = allow
```

ACL 可以配置在文件 `etc/acl.conf` 中，或者配置在后台数据库中。下面例子是 ACL 控制文件的一个配置行，含义是用户 “dashboard” 可以订阅 “$SYS/#” 主题。ACL 在后台数据库中的配置思想与此类似，详细配置方法请参阅 EMQ X 文档的 [ACL 访问控制](https://docs.emqx.io/tutorial/v3/cn/security/acl.html) 章节。
```
{allow, {user, "dashboard"}, subscribe, ["$SYS/#"]}.
```


## Q: 什么是共享订阅？有何使用场景？

A: 共享订阅是 MQTT 5.0 标准的新特性，在标准发布前，EMQ X 就已经把共享订阅作为标准外特性进行了支持。在普通订阅中，所有订阅者都会收到订阅主题的所有消息，而在共享订阅中，订阅同一个主题的客户端会轮流的收到这个主题下的消息，也就是说同一个消息不会发送到多个订阅者，从而实现订阅端的多个节点之间的负载均衡。

共享订阅对于数据采集 / 集中处理类应用非常有用。在这样的场景下，数据的生产者远多余数据的消费者，且同一条数据只需要被任意消费者处理一次。


更多使用方式请参考 [共享订阅](https://docs.emqx.io/tutorial/v3/cn/advanced/share_subscribe.html)。



## Q: EMQ X 能做流量控制吗？

A：能。目前 EMQ X 支持连接速率和消息率控制。配置如下：

```
## Value: Number
listener.tcp.external.max_conn_rate = 1000

## Value: rate,burst
listener.tcp.external.rate_limit = 1024,4096
```

## Q: 什么是离线消息？

A: 一般情况下 MQTT 客户端仅在连接到消息服务器的时候，如果客户端离线将收不到消息。但是在客户端有固定的 ClientID，clean_session 为 false，且 QoS 设置满足服务器端的配置要求时，在客户端离线时，服务器可以为客户端保持一定量的离线消息，并在客户端再次连接是发送给客户端。

离线消息在网络连接不是很稳定时，或者对 QoS 有一定要求时非常有用。


## Q: 什么是代理订阅？使用场景是什么？

A: 通常情况客户端需要在连接到 EMQ X 之后主动订阅主题。代理订阅是指服务器为客户端订阅主题，这一过程不需要客户端参与，客户端和需要代理订阅的主题的对应关系保存在服务器中。

使用代理订阅可以集中管理大量的客户端的订阅，同时为客户端省略掉订阅这个步骤，可以节省客户端侧的计算资源和网络带宽。

以 Redis 数据库为例，代理订阅在 EMQ X 上使用方式请参考 [Redis 实现客户端代理订阅](https://docs.emqx.io/tutorial/v3/cn/backend/redis.html#%E5%AE%A2%E6%88%B7%E7%AB%AF%E4%BB%A3%E7%90%86%E8%AE%A2%E9%98%85)

> 注：目前 EMQ X 企业版支持代理订阅。


## Q: EMQ X 是如何实现支持大规模并发和高可用的？

A: 高并发和高可用是 EMQ X 的设计目标，为了实现这些目标 EMQ X 中应用了多种技术，比如：

- 利用 Erlang/OTP 平台的软实时、高并发和容错；
- 全异步架构；
- 连接、会话、路由、集群的分层设计；
- 消息平面和控制平面的分离等。

在精心设计和实现之后，单个 EMQ X Enterprise 节点就可以处理百万级的连接。

EMQ X 支持多节点集群，集群下整个系统的性能会成倍高于单节点，并能在单节点故障时保证系统服务不中断。


## Q: EMQ X 能把接入的 MQTT 消息保存到数据库吗？

A: EMQ X 企业版支持消息持久化，可以将消息保存到数据库，开源版还暂时不支持。目前 EMQ X 企业版消息持久化支持的数据库有：

- Redis
- MongoDB
- MySQL
- PostgreSQL
- Cassandra
- AWS DynamoDB
- TimescaleDB
- OpenTSDB
- InfluxDB

有关数据持久化的支持请参见 [EMQ X 数据持久化概览](https://docs.emqx.io/tutorial/v3/cn/backend/whats_backend.html)。



## Q: 在服务器端能够直接断开一个 MQTT 连接吗？

A: 可以的。EMQ X 提供的 REST API 中包含断开 MQTT 连接，该操作在 EMQ X 2.x 和 3.0 的实现方式有所不同：

- 在 2.x 版本中是由 EMQ X 自定义扩展协议实现的
- 在 3.0 版本之后按照 MQTT 5.0 协议对从服务器端断开连接的规范要求实现的

调用的 API 如下所示：

```html
HTTP 方法：DELETE 
URL：api/[v2|v3]/clients/{clientid} 
<!--请注意区分 URL 中第二部分的版本号，请根据使用的版本号来决定 -->

返回内容：
{
    "code": 0,
    "result": []
}
```

REST API 使用方式参考 [管理监控API (REST API)](https://docs.emqx.io/broker/v3/cn/rest.html)




## Q: EMQ X 能把接入的消息转发到 Kafka 吗？

A: 能。目前 EMQ X 企业版提供了内置的 Kafka 桥接方式，支持把消息桥接至 Kafka 进行流式处理。

EMQ X 使用 Kafka 参照 [EMQ X 到 Kafka 的桥接](https://docs.emqx.io/tutorial/v3/cn/bridge/bridge_to_kafka.html)



## Q: EMQ X 企业版中桥接 Kafka，一条 MQTT 消息到达 EMQ X 集群之后就回 MQTT Ack 报文还是写入 Kafka 之后才回 MQTT Ack 报文? 

A: 取决于 Kafka 桥接的配置，配置文件位于`/etc/emqx/plugins/emqx_bridge_kafka.conf`

```bash
## Pick a partition producer and sync/async.
bridge.kafka.produce = sync
```

- 同步：EMQ X 在收到 Kafka 返回的 Ack 之后才会给前端返回 MQTT Ack 报文
- 异步：MQTT 消息到达 EMQ X 集群之后就回 MQTT Ack 报文，而不会等待 Kafka 返回给 EMQ X 的 Ack

如果运行期间，后端的 Kafka 服务不可用，则消息会被累积在 EMQ X 服务器中，

- EMQ X 2.4.3 之前的版本会将未发送至 Kafka 的消息在内存中进行缓存，直至内存使用完毕，并且会导致 EMQ X 服务不可用。
- EMQ X 2.4.3 版本开始会将未发送至 Kafka 的消息在磁盘中进行缓存，如果磁盘用完可能会导致数据丢失。

因此建议做好 Kafka 服务的监控，在发现 Kafka 服务有异常情况的时候尽快恢复 Kafka 服务。

## Q: EMQ X 支持集群自动发现吗？有哪些实现方式？

A: EMQ X 支持集群自动发现。集群可以通过手动配置或自动配置的方式实现。

目前支持的自动发现方式有：

- 手动集群
- 静态集群
- IP Multi-cast 自动集群
- DNS 自动集群
- ETCD 自动集群
- K8S 自动集群

有关集群概念和组建集群方式请参照 [EMQ X 的集群概念](https://docs.emqx.io/tutorial/v3/cn/cluster/whats_cluster.html)


## Q: 我可以把 MQTT 消息从 EMQ X 转发其他消息中间件吗？例如 RabbitMQ？

A: EMQ X 支持转发消息到其他消息中间件，通过 EMQ X 提供的桥接方式就可以做基于主题级别的配置，从而实现主题级别的消息转发。

EMQ X 桥接相关的使用方式请参照 [EMQ X 桥接](https://docs.emqx.io/tutorial/v3/cn/bridge/bridge.html)

## Q: 我可以把消息从 EMQ X 转到公有云 MQTT 服务上吗？比如 AWS 或者 Azure 的 IoT Hub？

A: EMQ X 可以转发消息到标准 MQTT Broker，包括其他 MQTT 实现、公有云的 IoT Hub，通过 EMQ X 提供的桥接就可以实现。


## Q: MQTT Broker（比如 Mosquitto）可以转发消息到 EMQ X 吗？

A: Mosquitto 可以配置转发消息到 EMQ X，请参考[数据桥接](https://developer.emqx.io/docs/tutorial/zh/bridge/bridge.html)。

> EMQ X 桥接相关的使用方式请参照 [EMQ X 桥接](https://docs.emqx.io/tutorial/v3/cn/bridge/bridge.html)

## Q: 系统主题有何用处？都有哪些系统主题？

A: 系统主题以 `$SYS/` 开头。EMQ X 会以系统主题的方式周期性的发布关于自身运行状态、MQTT 协议统计、客户端上下线状态到系统主题。订阅系统主题可以获得这些信息。

这里列举一些系统主题，完整的系统主题请参考 EMQ X 文档的相关章节：

- $SYS/brokers:  集群节点列表
- $SYS/brokers/${node}/clients/${clientid}/connected: 当客户端连接时发送的客户端信息
- $SYS/broker/${node}/stats/connections/count: 当前客户端总数
- $SYS/broker/${node}/stats/sessions/count: 当前会话总数


## Q: 我想跟踪特定消息的发布和订阅过程，应该如何做？

A: EMQ X 支持追踪来自某个客户端的报文或者发布到某个主题的报文。追踪消息的发布和订阅需要使用命令行工具（emqx_ctl）的 trace 命令，下面给出一个追踪‘topic’主题的消息并保存在 `trace_topic.log` 中的例子。更详细的说明请参阅 EMQ X 文档的相关章节。

```
./bin/emqx_ctl trace topic "topic" "trace_topic.log"
```


## Q: 为什么我做压力测试的时候，连接数目和吞吐量老是上不去，有系统调优指南吗？

A: 在做压力测试的时候，除了要选用有足够计算能力的硬件，也需要对软件运行环境做一定的调优。比如修改修改操作系统的全局最大文件句柄数，允许用户打开的文件句柄数，TCP 的 backlog 和 buffer，Erlang 虚拟机的进程数限制等等。甚至包括需要在客户端上做一定的调优以保证客户端可以有足够的连接资源。

系统的调优在不同的需求下有不同的方式，在 EMQ X 的[文档-测试调优](https://developer.emqx.io/docs/broker/v3/cn/tune.html) 中对用于普通场景的调优有较详细的说明

## Q：EMQ X 的百万连接压力测试的场景是什么？

A: 在EMQ 2.0版本发布的时候，由第三方软件测试工具服务提供商 [XMeter](https://www.xmeter.net) 执行了一次百万级别连接的性能测试。测试基于开源社区中最流行的性能测试工具 [Apache JMeter](https://jmeter.apache.org/)，以及开源[性能测试插件](https://github.com/emqx/mqtt-jmeter)。该性能测试场景为测试客户端到服务器端的MQTT协议连接，该测试场景下除了发送MQTT协议的控制包和PING包（每5分钟发送一次）外，不发送用户数据，每秒新增连接数为1000，共计运行30分钟。

在该测试中，还执行了一些别的性能测试，主要为在为10万MQTT背景连接的情况下，执行了不同条件下的消息发送和接收的场景。具体请参见[性能测试报告](https://media.readthedocs.org/pdf/emq-xmeter-benchmark-cn/latest/emq-xmeter-benchmark-cn.pdf).


## Q: 我的连接数目并不大，EMQ X 生产环境部署需要多节点吗？

A: 即使在连接数量，消息率不高的情况下（服务器低负载），在生产环境下部署多节点的集群依然是很有意义的。集群能提高系统的可用性，降低单点故障的可能性。当一个节点宕机时，其他在线节点可以保证整个系统的服务不中断。


## Q: EMQ X 支持加密连接吗？推荐的部署方案是什么？

A：EMQ X 支持加密连接。在生产环境部署时，推荐的方案是使用负载均衡终结 TLS。通过该方式，设备端和服务器端（负载均衡）的采用加密的连接，而负载均衡和后端的 EMQ X 节点采用一般的 TCP 连接。



## Q：EMQ X 安装之后无法启动怎么排查？

A：执行 `$ emqx console` ，查看输出内容

+	`logger` 命令缺失

  ```
  $ emqx console
  Exec: /usr/lib/emqx/erts-10.3.5.1/bin/erlexec -boot /usr/lib/emqx/releases/v3.2.1/emqx -mode embedded -boot_var ERTS_LIB_DIR /usr/lib/emqx/erts-10.3.5.1/../lib -mnesia dir "/var/lib/emqx/mnesia/emqx@127.0.0.1" -config /var/lib/emqx/configs/app.2019.07.23.03.07.32.config -args_file /var/lib/emqx/configs/vm.2019.07.23.03.07.32.args -vm_args /var/lib/emqx/configs/vm.2019.07.23.03.07.32.args -- console
  Root: /usr/lib/emqx
  /usr/lib/emqx
  /usr/bin/emqx: line 510: logger: command not found
  ```
  
  **解决办法：**
  
  + `Centos/Redhat`
  
    ```
    $ yum install rsyslog
    ```
  
  + `Ubuntu/Debian`
  
    ```
    $ apt-get install bsdutils
    ```
  
+	`openssl` 缺失

```
    $ emqx console
    Exec: /emqx/erts-10.3/bin/erlexec -boot /emqx/releases/v3.2.1/emqx -mode embedded -boot_var ERTS_LIB_DIR /emqx/erts-10.3/../lib -mnesia dir "/emqx/data/mnesia/emqx@127.0.0.1" -config /emqx/data/configs/app.2019.07.23.03.34.43.config -args_file /emqx/data/configs/vm.2019.07.23.03.34.43.args -vm_args /emqx/data/configs/vm.2019.07.23.03.34.43.args -- console
    Root: /emqx
    /emqx
    Erlang/OTP 21 [erts-10.3] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:32] [hipe]
    
    {"Kernel pid terminated",application_controller,"{application_start_failure,kernel,{{shutdown,{failed_to_start_child,kernel_safe_sup,{on_load_function_failed,crypto}}},{kernel,start,[normal,[]]}}}"}
    Kernel pid terminated (application_controller) ({application_start_failure,kernel,{{shutdown,{failed_to_start_child,kernel_safe_sup,{on_load_function_failed,crypto}}},{kernel,start,[normal,[]]}}})
    
    Crash dump is being written to: log/crash.dump...done
```

**解决办法：**安装1.1.1以上版本的 `openssl`

+ `License` 文件缺失

```
  $ emqx console
  Exec: /usr/lib/emqx/erts-10.3.5.1/bin/erlexec -boot /usr/lib/emqx/releases/v3.2.1/emqx -mode embedded -boot_var ERTS_LIB_DIR /usr/lib/emqx/erts-10.3.5.1/../lib -mnesia dir "/var/lib/emqx/mnesia/emqx@127.0.0.1" -config /var/lib/emqx/configs/app.2019.07.23.05.52.46.config -args_file /var/lib/emqx/configs/vm.2019.07.23.05.52.46.args -vm_args /var/lib/emqx/configs/vm.2019.07.23.05.52.46.args -- console
  Root: /usr/lib/emqx
  /usr/lib/emqx
  Erlang/OTP 21 [erts-10.3.5.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:32] [hipe]
  
  Starting emqx on node emqx@127.0.0.1
  Start http:management listener on 8080 successfully.
  Start http:dashboard listener on 18083 successfully.
  Start mqtt:tcp listener on 127.0.0.1:11883 successfully.
  Start mqtt:tcp listener on 0.0.0.0:1883 successfully.
  Start mqtt:ws listener on 0.0.0.0:8083 successfully.
  Start mqtt:ssl listener on 0.0.0.0:8883 successfully.
  Start mqtt:wss listener on 0.0.0.0:8084 successfully.
  EMQ X Broker 3.2.1 is running now!
  "The license certificate is expired!"
  2019-07-23 05:52:51.355 [critical] The license certificate is expired!
  2019-07-23 05:52:51.355 [critical] The license certificate is expired! System shutdown!
  Stop mqtt:tcp listener on 127.0.0.1:11883 successfully.
  Stop mqtt:tcp listener on 0.0.0.0:1883 successfully.
  Stop mqtt:ws listener on 0.0.0.0:8083 successfully.
  Stop mqtt:ssl listener on 0.0.0.0:8883 successfully.
  Stop mqtt:wss listener on 0.0.0.0:8084 successfully.
  [os_mon] memory supervisor port (memsup): Erlang has closed
  [os_mon] cpu supervisor port (cpu_sup): Erlang has closed
```

  **解决办法：**登陆[emqx.io](https://emqx.io)申请license或安装开源版的 EMQ X Broker



## Q：EMQ X 无法连接 MySQL 8.0

  A：不同于以往版本，MySQL 8.0 对账号密码配置默认使用`caching_sha2_password`插件，需要将密码插件改成`mysql_native_password`

  + 修改 `mysql.user` 表

    ```
    ## 切换到 mysql 数据库
    mysql> use mysql;

    ## 查看 user 表

    mysql> select user, host, plugin from user;
    +------------------+-----------+-----------------------+
    | user             | host      | plugin                |
    +------------------+-----------+-----------------------+
    | root             | %         | caching_sha2_password |
    | mysql.infoschema | localhost | caching_sha2_password |
    | mysql.session    | localhost | caching_sha2_password |
    | mysql.sys        | localhost | caching_sha2_password |
    | root             | localhost | caching_sha2_password |
    +------------------+-----------+-----------------------+

    ## 修改密码插件
    mysql> ALTER USER 'your_username'@'your_host' IDENTIFIED WITH mysql_native_password BY 'your_password';
    Query OK, 0 rows affected (0.01 sec)

    ## 刷新
    mysql> FLUSH PRIVILEGES;
    Query OK, 0 rows affected (0.00 sec)
    ```

  + 修改 `my.conf`
    
    在 `my.cnf` 配置文件里面的 [mysqld] 下面加一行
    ```
    default_authentication_plugin=mysql_native_password
    ```

  + 重启 MySQL 即可




## Q: EMQ X中ssl resumption session的使用

A: 修改emqx.conf配置中的 reuse_sessions = on 并生效后。如果客户端与服务端通过 SSL 已经连接成功，当第二次遇到客户端连接时，会跳过 SSL 握手阶段，直接建立连接，节省连接时间，增加客户端连接速度。


## Q：MQTT 客户端断开连接统计

A：执行 `emqx_ctl listeners`，查看对应端口下的 `shutdown_count` 统计。

客户端断开链接错误码列表：

+ `keepalive_timeout`：MQTT keepalive 超时
+ `closed`：TCP客户端断开连接（客户端发来的FIN，但没收到 MQTT DISCONNECT）
+ `normal`：MQTT客户端正常断开
+ `einval`：EMQ X 想向客户端发送一条消息，但是Socket 已经断开
+ `function_clause`：MQTT 报文格式错误
+ `etimedout`：TCP 发送超时（没有收到TCP ACK 回应）
+ `proto_unexpected_c`：在已经有一条MQTT连接的情况下重复收到了MQTT连接请求
+ `idle_timeout`： TCP 连接建立 15s 之后，还没收到 connect 报文

  

  

  


