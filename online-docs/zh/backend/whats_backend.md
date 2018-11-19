# 数据持久化概览

数据持久化的主要使用场景包括将客户端上下线状态，订阅主题信息，消息内容，消息抵达后发送消息回执等操作记录到 Redis、MySQL、PostgreSQL、MongoDB、Cassandra 等各种数据库中。用户也可以通过订阅相关主题的方式来实现类似的功能，但是在企业版中内置了对这些持久化的支持；相比于前者，后者的执行效率更高，也能大大降低开发者的工作量。


## 持久化设计

### 一对一消息存储

![backend](../assets/backends_1.png)

1. PUB端发布一条消息；
2. Backend将消息记录数据库中；
3. SUB端订阅主题；
4. Backend从数据库中获取该主题的消息；
5. 发送消息给SUB端；
6. SUB端确认后Backend从数据库中移除该消息；



### 一对多消息存储

![./_static/images/backends_2.png](../assets/backends_2.png)

1. PUB端发布一条消息；
2. Backend将消息记录在数据库中；
3. SUB1和SUB2订阅主题；
4. Backend从数据库中获取该主题的消息；
5. 发送消息给SUB1和SUB2；
6. Backend记录SUB1和SUB2已读消息位置，下次获取消息从该位置开始。



## 数据持久化内容

EMQ X 持久化插件使用事件驱动模型处理数据，主要分成了三类事件钩子（hook）：连接 / 断开连接、会话和消息。

持久化原理是配置事件钩子触发时调用处理函数（action）,处理函数获取到相应的数据后按照配置的指令进行回调处理，实现数据的增、删、改、查。

相同事件钩子在不同数据库中可用参数是一样的，但处理函数（action）因数据库特性不同有所差异，如 Redis 可以使用其发布 / 订阅模式实现基础的数据桥接，支持一对一、一对多消息 ACK 处理。具体支持差异化请查阅相应数据库文档，下面给出通用的持久化方案：

### 连接

客户端连接成功 / 断开连接钩子。钩子里可选取处理函数进行客户端上 / 下线日志记录、在线状态更改与记录、从数据库加载订阅主题为客户端自动订阅等操作。

| hook                | action                 | 可用参数 | 可用操作           |
| ------------------- | ---------------------- | -------- | ------------------ |
| client.connected    | on_client_connected    | clientid | 存储客户端在线状态 |
| client.connected    | on_subscribe_lookup    | clientid | 订阅主题           |
| client.disconnected | on_client_disconnected | clientid | 存储客户端离线状态 |

### 对话

客户端订阅 / 取消订阅主题钩子，EMQ  X 会为每个连接创建会话，在主题订阅 / 取消订阅时会触发。钩子里可选取处理函数进行离线 / retain消息获取、记录 / 更新客户端主题订阅列表等操作。

topic 参数作用于可用参数中的 `topic`，规则同 MQTT 协议主题，用于过滤处理会话。

| hook                | topic | action                 | 可用参数       | 可用操作 |
| ------------------- | ----- | ---------------------- | ------------------ | ------------------- |
| session.subscribed  | #     | on_message_fetch       | clientid, topic, qos | 获取离线消息 |
| session.subscribed  | #     | on_retain_lookup       | clientid, topic, qos | 获取 retain 消息 |
| session.unsubscribed | # | -- | clientid, topic | 更新订阅列表 |

### 消息

客户端消息相关钩子。消息发布、传递、抵达时均会触发相关钩子，钩子里可进行消息记录存储、保留消息操作、消息抵达确认操作等。

topic 参数作用于可用参数中的 `topic`，规则同 MQTT 协议主题，用于过滤处理消息。

| hook              | topic | action               | 可用参数                                      | 可用操作            |
| ----------------- | ----- | -------------------- | --------------------------------------------- | ------------------- |
| message.publish   | #     | on_message_publish   | message, msgid, topic, payload, qos, clientid | 存储发布消息        |
| message.publish   | #     | on_message_retain    | message, msgid, topic, payload, qos, clientid | 存储 retain 消息    |
| message.publish   | #     | on_retain_delete     | message, msgid, topic, payload, qos, clientid | 删除 retain 消息    |
| message.acked     | #     | on_message_acked     | msgid, topic, clientid                        | 消息 ACK 处理       |
| message.delivered | #     | on_message_delivered | msgid, topic, clientid                        | 消息 delivered 处理 |



## 配置步骤介绍

EMQ X 中支持不同类型的数据库的持久化，虽然在一些细节的配置上有所不同，但是任何一种类型的持久化配置主要做两步操作：

- 数据库连接配置：这部分主要用于配置数据库的连接信息，包括服务器地址，数据库名称，以及用户名和密码等信息，针对每种不同的数据库，这部分配置可能会有所不同；
- 事件注册与行为：根据不同的事件，用户可以在配置文件中配置相关的行为（action），相关的行为可以是函数，也可以是SQL语句。

### 数据库连接配置语法和样例

该部分配置数据库地址、认证信息、连接池等信息， 插件将根据此配置信息连接到指定资源。

EMQ X 配置采用了类似 sysctl 的 k = v 通用格式，每行一个配置，关键字段间以 `.` 分隔。数据库连接配置信息如下：

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

在此处配置中，`backend` 表示该行配置属于 EMQ X backend 系列插件，第二段 `pgsql` 表示配置 PostgreSQL 数据库；第三段的 `pool1` 表示数据库连接源，多个连接源最后一位数字依次累加，后续其他配置应该指定已经配置存在的连接源；第四段是该连接源中配置的属性。

配置文件的 key 按 `.` 分段，其结构如下：

```bash
# backend.pgsql.pool1.server = 127.0.0.1:5432
- backend # 插件类别，此处是 backend
    - pgsql # 具体插件，此处是 PostgreSQL 数据库
        - pool1 # 数据源标识，用于区分该项配置作用的配置源
            - server # 该数据源的服务器地址
```



### 事件注册与行为

通过配置文件可进行事件注册（hook）及相关行为（action/function）配置。

此部分配置的 value 为 JSON 字符串，视配置不同有不同内容：

```bash
# backend.pgsql.hook.session.subscribed.1 # 最后一段 1 表示第一个处理配置
# PostgreSQL 数据库客户端获取离线消息

{
  "topic": "#", # 主题过滤：任意主题
  "action": { # 处理行为
    "function": "on_message_fetch" # 使用内部函数 获取离线消息 处理
   }, 
  "pool": "pool1"  # 作用于数据源：pool1
}


# backend.pgsql.hook.session.unsubscribed.1
# 删除已 ACK 的消息记录
{
  "topic": "#", # 主题过滤：任意主题
  "action": { # 处理行为
    # 执行多个 SQL 语句， SQL 中使用模板语法替换响应数据
    "sql": ["delete from mqtt_acked where clientid = ${clientid} and topic = ${topic}"]
   }, 
  "pool": "pool1" # 作用于数据源：pool1
}
```

> 每类数据库支持的事件与行为、内部函数、响应数据等详见相关数据库内配置，此处仅展示通用示例。




## 持久化存储插件对照表

下表为数据库和配置文件的对应关系表格，这些配置文件都在目录 `etc/plugins` 中。


| 数据库     | 配置文件                |
| ---------- | ----------------------- |
| Redis      | emqx_backend_redis.conf |
| MySQL      | emqx_backend_mysql.conf |
| PostgreSQL | emqx_backend_pgsql.conf |
| MongoDB    | emqx_backend_mongo.conf |
| Cassandra  | emqx_backend_cassa.conf |



