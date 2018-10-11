# TODO: 翻译 - EMQ X 简介

EMQ X 基于Erlang/OTP平台开发的MQTT消息服务器，是开源社区中最流行的MQTT消息服务器，EMQ X 主要有以下的特点，

- 基于Apache 2.0协议许可，完全开源。EMQ X 的代码都放在[github](https://github.com/emqx/emqx)中，用户可以查看所有源代码。
- EMQ X 3.0支持MQTT 5.0协议，是**开源社区中第一个**支持5.0协议规范的消息服务器，并且完全兼容MQTT V3.1和V3.1.1协议。除了MQTT协议之外，EMQ X 还支持别的一些物联网协议（具体请参见下文的EMQ X Broker产品功能介绍）。
- 单机支持百万连接，集群支持千万级连接；毫秒级消息转发。EMQ X中应用了多种技术以实现上述功能，
  - 利用Erlang/OTP平台的软实时、高并发和容错
  - 全异步架构
  - 连接、会话、路由、集群的分层设计
  - 消息平面和控制平面的分离等
- 扩展模块和插件，EMQ X 提供了灵活的扩展机制，可以实现私有协议、认证鉴权、数据持久化、桥接转发和管理控制台等的扩展
- 桥接：EMQ X 可以跟别的消息系统进行对接，比如EMQ X Enterprise版本中可以支持将消息转发到Kafka、RabbitMQ或者别的EMQ节点等
- 共享订阅：共享订阅支持通过负载均衡的方式在多个订阅者之间来分发MQTT消息。比如针对物联网等数据采集场景，会有比较多的设备在发送数据，通过共享订阅的方式可以在订阅端设置多个订阅者来实现这几个订阅者之间的工作负载均衡

# EMQ X 版本

EMQ X 现在有三种版本，用户可以根据自己的需求选择不同的版本。

## EMQ X Broker

EMQ X 开源版本，用户可以免费下载和使用，包含了以下功能。

- 十万级并发连接能力
- 常见物联网协议支持
  - MQTT
  - MQTT-SN
  - CoAP
  - LwM2M
  - WebSocket
  - STOMP
  - TCP
- 认证鉴权
- 集群、高可用
- Docker部署
- 社区服务支持

## EMQ X Enterprise

EMQ X 商业版本，用户可以通过网站来[下载企业评估版](https://www.emqx.io/downloads/emq/enterprise?osType=Linux)进行试用。

- 开源版的全部功能
- 百万级并发连接能力
- 数据持久化：可以将消息保存到数据库，目前支持的数据库为，
  - Redis
  - MongoDB
  - MySQL
  - PostgreSQL
  - Cassandra
- 数据桥接，支持将消息转发到Kafka、RabbitMQ或者别的EMQ节点
- LoRaWAN支持
- Kubernates部署
- 安全 - 提供完整的安全连接方案
- 监控，提供机器、EMQ X 和Erlang虚拟机级别的监控功能
- 商业化技术支持

## EMQ X Platform

EMQ X 平台版本，提供超大规模的物联网连接解决方案。

- Enterprise版本的所有功能
- 千万级并发连接能力
- 大规模、跨数据中心解决方案咨询与实施
- 提供物联网平台全生命周期中需要的各种服务（咨询、培训、架构设计、定制开发、平台建设、功能测试与运维服务）
