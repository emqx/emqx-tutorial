# 数据持久化概念

EMQ X 支持客户端事件数据、 MQTT 消息直接存储至 Redis、MySQL、PostgreSQL、MongoDB、Cassandra 数据库。


## 数据持久化的原理

EMQ X 持久化插件使用事件驱动模型处理数据，Broker 注册了连接 / 断开连接、订阅 / 取消订阅、消息发布、消息抵达等多个事件钩子（hook），事件触发时拿到回调数据并在钩子处理函数（action）中根据配置进行相应处理。

数据持久化消息事件钩子、处理函数及可用操作对照表：


| hook                | topic | action                 | 可用操作           |
| ------------------- | ----- | ---------------------- | ------------------ |
| client.connected    |       | on_client_connected    | 存储客户端在线状态 |
| client.connected    |       | on_subscribe_lookup    | 订阅主题           |
| client.disconnected |       | on_client_disconnected | 存储客户端离线状态 |
| session.subscribed  | #     | on_message_fetch       | 获取离线消息       |
| session.subscribed  | #     | on_retain_lookup       | 获取 retain 消息    |
| message.publish     | #     | on_message_publish     | 存储发布消息       |
| message.publish     | #     | on_message_retain      | 存储 retain 消息   |
| message.publish     | #     | on_retain_delete       | 删除 retain 消息   |
| message.acked       | #     | on_message_acked       | 消息 ACK 处理        |



## 数据持久化的应用场景

根据不同的消息事件类型，可以事件触发后执行如客户端上下线状态更改、自动订阅主题，消息发布时记录消息内容，消息抵达后发送消息回执等操作：

- 结合 `client.connected / client.disconnected` 钩子实现设备上、下线状态监控、记录；
- 在 `client.connected` 后为设备自动订阅指定主题；
- `message.publish` 后将消息、订阅 / 会话信息存储至数据库或同步至 Redis ；
- `message.acked` 后处理消息抵达回执，记录消息发送成功状态。



## 可以供配置的类型

根据不同的数据持久化方案，可配置如数据库连接信息与连接池、事件 / 主题过滤器、处理函数的处理方式如 SQL 语句、NoSQL 操作模式等，能通过配置灵活地实现各个应用场景下的特定功能。



## 介绍一下配置文件的格式

数据持久化插件中的配置可以分为两类：

### 资源连接配置

该部分配置数据库地址、认证信息、连接池等信息， 插件将根据此配置信息连接到指定资源：

```bash
    ## Pgsql Server
    backend.pgsql.pool1.server = 127.0.0.1:5432

    ## Pgsql Pool Size
    backend.pgsql.pool1.pool_size = 8

    ## Pgsql Username
    backend.pgsql.pool1.username = root

    ## Pgsql Password
    backend.pgsql.pool1.password = public

    ## Pgsql Database
    backend.pgsql.pool1.database = mqtt

    ## Pgsql Ssl
    backend.pgsql.pool1.ssl = false
```

#### 事件注册与函数处理

在该插件中注册需要的事件钩子，选取相应的内置函数并配置函数处理方式：

```bash
    ## Subscribe Lookup Record
    backend.pgsql.hook.client.connected.2    = {"action": {"function": "on_subscribe_lookup"}, "pool": "pool1"}

    ## Client DisConnected Record
    backend.pgsql.hook.client.disconnected.1 = {"action": {"function": "on_client_disconnected"}, "pool": "pool1"}

    ## Lookup Unread Message QOS > 0
    backend.pgsql.hook.session.subscribed.1  = {"topic": "#", "action": {"function": "on_message_fetch"}, "pool": "pool1"}

    ## Lookup Retain Message
    backend.pgsql.hook.session.subscribed.2  = {"topic": "#", "action": {"function": "on_retain_lookup"}, "pool": "pool1"}

    ## Delete Ack
    backend.pgsql.hook.session.unsubscribed.1= {"topic": "#", "action": {"sql": ["delete from mqtt_acked where clientid = ${clientid} and topic = ${topic}"]}, "pool": "pool1"}
```


## 持久化存储插件对照表

EMQ X 使用插件进行数据持久化，请根据资源类别配置持久化插件：


| 存储插件           | 配置文件                | 说明                |
| ------------------ | ----------------------- | ------------------- |
| emqx_backend_redis | emqx_backend_redis.conf | Redis 消息存储      |
| emqx_backend_mysql | emqx_backend_mysql.conf | MySQL 消息存储      |
| emqx_backend_pgsql | emqx_backend_pgsql.conf | PostgreSQL 消息存储 |
| emqx_backend_mongo | emqx_backend_mongo.conf | MongoDB 消息存储    |
| emqx_backend_cassa | emqx_backend_cassa.conf | Cassandra 消息存储  |



