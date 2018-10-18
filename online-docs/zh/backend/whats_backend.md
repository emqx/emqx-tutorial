# 数据持久化概览

数据持久化的主要使用场景包括将客户端上下线状态，订阅主题信息，消息内容，消息抵达后发送消息回执等操作记录到 Redis、MySQL、PostgreSQL、MongoDB、Cassandra 等各种数据库中。用户也可以通过订阅相关主题的方式来实现类似的功能，但是在企业版中内置支持了对这些持久化的支持；相比于前者，后者的执行效率更高，也能大大降低开发者的工作量。



## 数据持久化内容

EMQ X 持久化插件使用事件驱动模型处理数据，主要分成了三类事件钩子（hook）：连接 / 断开连接、会话和消息。

TODO：这部分内容在redis和别的数据库中有些差异化，为什么有这些差异化的内容？

### 连接

TODO：可用操作是哪一些？

| hook                | action                 | 可用操作           |
| ------------------- | ---------------------- | ------------------ |
| client.connected    | on_client_connected    | 存储客户端在线状态 |
| client.connected    | on_subscribe_lookup    | 订阅主题           |
| client.disconnected | on_client_disconnected | 存储客户端离线状态 |

### 对话

TODO：可用操作是哪一些？Topic是何意义？

| hook                | topic | action                 | 可用操作           |
| ------------------- | ----- | ---------------------- | ------------------ |
| session.subscribed  | #     | on_message_fetch       | 获取离线消息       |
| session.subscribed  | #     | on_retain_lookup       | 获取 retain 消息    |

### 消息

TODO：可用操作是哪一些？Topic是何意义？

| hook            | topic | action             | 可用操作         |
| --------------- | ----- | ------------------ | ---------------- |
| message.publish | #     | on_message_publish | 存储发布消息     |
| message.publish | #     | on_message_retain  | 存储 retain 消息 |
| message.publish | #     | on_retain_delete   | 删除 retain 消息 |
| message.acked   | #     | on_message_acked   | 消息 ACK 处理    |



## 配置步骤介绍

EMQ X 中支持不同类型的数据库的持久化，虽然在一些细节的配置上有所不同，但是任何一种类型的持久化配置主要做两步操作，

- 数据库连接配置：这部分主要用于配置数据库的连接信息，包括服务器地址，数据库名称，以及用户名和密码等信息，针对每种不同的数据库，这部分配置可能会有所不同
- 事件注册与行为：根据不同的事件，用户可以在配置文件中配置相关的行为（action），相关的行为可以是函数，也可以是SQL语句

### 数据库连接配置语法和样例

该部分配置数据库地址、认证信息、连接池等信息， 插件将根据此配置信息连接到指定资源。

TODO：语法介绍，`pool1`代表的是数据库的名字；

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

### 事件注册与行为

TODO语法介绍：请使用下列语法描述的方式来解释配置文件的内容，包括action下面可以指定哪些不同类型的行为，可以是内部函数，也可以是SQL等，把相关的都列出来。

```shell
backend.[pgsql|mysql|...].hook.[client|session|...].[connect|disconnected|...].? = {....}
```

TODO：不要大段的copy配置文件的内容，针对于上面的语法，抽出几个典型的配置方式详细做一下介绍。

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

下表为数据库和配置文件的对应关系表格，这些配置文件都在目录TODO：xx中。


| 数据库     | 配置文件                |
| ---------- | ----------------------- |
| Redis      | emqx_backend_redis.conf |
| MySQL      | emqx_backend_mysql.conf |
| PostgreSQL | emqx_backend_pgsql.conf |
| MongoDB    | emqx_backend_mongo.conf |
| Cassandra  | emqx_backend_cassa.conf |



