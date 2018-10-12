# Cassandra 数据存储

配置文件: etc/plugins/emqx_backend_cassa.conf

## 配置 Cassandra 集群地址

支持配置多台Cassandra服务器连接池:

```properties
    ## Cassandra Node
    backend.ecql.pool1.nodes = 127.0.0.1:9042

    ## Cassandra Pool Size
    backend.ecql.pool1.size = 8

    ## Cassandra auto reconnect flag
    backend.ecql.pool1.auto_reconnect = 1

    ## Cassandra Username
    backend.ecql.pool1.username = cassandra

    ## Cassandra Password
    backend.ecql.pool1.password = cassandra

    ## Cassandra Keyspace
    backend.ecql.pool1.keyspace = mqtt

    ## Cassandra Logger type
    backend.ecql.pool1.logger = info

    ## Max number of fetch offline messages. Without count limit if infinity
    ## backend.cassa.max_returned_count = 500

    ## Time Range. Without time limit if infinity
    ## d - day
    ## h - hour
    ## m - minute
    ## s - second
    ## backend.cassa.time_range = 2h
```

## 配置 Cassandra 存储规则

```properties

    ## Max number of fetch offline messages. Without count limit if infinity
    ## backend.cassa.max_returned_count = 500

    ## Time Range. Without time limit if infinity
    ## d - day
    ## h - hour
    ## m - minute
    ## s - second
    ## backend.cassa.time_range = 2h

    ## Client Connected Record
    backend.cassa.hook.client.connected.1    = {"action": {"function": "on_client_connected"}, "pool": "pool1"}

    ## Subscribe Lookup Record
    backend.cassa.hook.client.connected.2    = {"action": {"function": "on_subscription_lookup"}, "pool": "pool1"}

    ## Client DisConnected Record
    backend.cassa.hook.client.disconnected.1 = {"action": {"function": "on_client_disconnected"}, "pool": "pool1"}

    ## Lookup Unread Message QOS > 0
    backend.cassa.hook.session.subscribed.1  = {"topic": "#", "action": {"function": "on_message_fetch"}, "pool": "pool1"}

    ## Lookup Retain Message
    backend.cassa.hook.session.subscribed.2  = {"action": {"function": "on_retain_lookup"}, "pool": "pool1"}

    ## Delete Ack
    backend.cassa.hook.session.unsubscribed.1= {"topic": "#", "action": {"cql": ["delete from acked where client_id = ${clientid} and topic = ${topic}"]}, "pool": "pool1"}

    ## Store Publish Message  QOS > 0
    backend.cassa.hook.message.publish.1     = {"topic": "#", "action": {"function": "on_message_publish"}, "pool": "pool1"}

    ## Delete Acked Record
    backend.cassa.hook.session.unsubscribed.1= {"topic": "#", action": {"cql": ["delete from acked where client_id = ${clientid} and topic = ${topic}"]}, "pool": "pool1"}

    ## Store Retain Message
    backend.cassa.hook.message.publish.2     = {"topic": "#", "action": {"function": "on_message_retain"}, "pool": "pool1"}

    ## Delete Retain Message
    backend.cassa.hook.message.publish.3     = {"topic": "#", "action": {"function": "on_retain_delete"}, "pool": "pool1"}

    ## Store Ack
    backend.cassa.hook.message.acked.1       = {"topic": "#", "action": {"function": "on_message_acked"}, "pool": "pool1"}
```

## Cassandra 存储规则说明

| hook                | topic | action                 | 说明               |
| ------------------- | ----- | ---------------------- | ------------------ |
| client.connected    |       | on_client_connected    | 存储客户端在线状态 |
| client.connected    |       | on_subscribe_lookup    | 订阅主题           |
| client.disconnected |       | on_client_disconnected | 存储客户端离线状态 |
| session.subscribed  | #     | on_message_fetch       | 获取离线消息       |
| session.subscribed  | #     | on_retain_lookup       | 获取retain消息     |
| message.publish     | #     | on_message_publish     | 存储发布消息       |
| message.publish     | #     | on_message_retain      | 存储retain消息     |
| message.publish     | #     | on_retain_delete       | 删除retain消息     |
| message.acked       | #     | on_message_acked       | 消息ACK处理        |




## CQL 语句参数说明

| hook                         | 可用参数                                          | 示例(cql语句中${name} 表示可获取的参数)                      |
| ---------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| client.connected             | clientid                                          | insert into conn(clientid) values(${clientid})               |
| client.disconnected clientid | insert into disconn(clientid) values(${clientid}) |                                                              |
| ses- sion.subscribed         | clientid, topic, qos                              | insert into sub(topic, qos) values(${topic}, ${qos})         |
| ses- sion.unsubscribed       | clientid, topic                                   | delete from sub where topic = ${topic}                       |
| message.publish              | msgid, topic, payload, qos, clientid              | insert into msg(msgid, topic) values(${msgid}, ${topic})     |
| message.acked                | msgid, topic, clientid                            | insert into ack(msgid, topic) values(${msgid}, ${topic})     |
| mes- sage.delivered          | msgid, topic, clientid                            | insert into delivered(msgid, topic) values(${msgid}, ${topic}) |

## CQL 语句方式配置 Action

Cassandra 存储支持用户采用 CQL 语句配置规则Action，例如:

```properties

    ## 在客户端连接到 EMQ X 服务器后，执行一条cql语句(支持多条cql语句)
    backend.cassa.hook.client.connected.3 = {"action": {"cql": ["insert into conn(clientid) values(${clientid})"]}, "pool": "pool1"}
```

## Cassandra 初始化

创建 KeySpace:

```bash
CREATE KEYSPACE mqtt WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };
USR mqtt;
```


导入 Cassandra 表:

```js
cqlsh -e "SOURCE 'emqx_backend_cassa.cql'"
```
    

> 数据库名称可自定义

## Cassandra 设备在线状态表

*mqtt.client* 存储设备在线状态::
```js
    CREATE TABLE mqtt.client (
        client_id text,
        node text,
        state int,
        connected timestamp,
        disconnected timestamp,
        PRIMARY KEY(client_id)
    );
```

查询设备在线状态:
```js
select * from mqtt.client where clientid = 'test';
```

例如 ClientId 为 test 客户端上线::

```bash
     client_id | connected                       | disconnected  | node          | state
    -----------+---------------------------------+---------------+---------------+-------
    test | 2017-02-14 08:27:29.872000+0000 |          null | emqx@127.0.0.1|     1
```

例如 ClientId 为 test 客户端下线::

```bash
select * from mqtt.client where clientid = 'test';

     client_id | connected                       | disconnected                    | node          | state
    -----------+---------------------------------+---------------------------------+---------------+-------
test | 2017-02-14 08:27:29.872000+0000 | 2017-02-14 08:27:35.872000+0000 | emqx@127.0.0.1|     0
```

## Cassandra 主题订阅表

*mqtt.sub* 存储设备订阅关系::

```bash
CREATE TABLE mqtt.sub (
        client_id text,
        topic text,
        qos int,
        PRIMARY KEY(client_id, topic)
);
```

例如为 ClientId 为 "test "订阅主题 test_topic1, test_topic2:

```sql
insert into mqtt.sub(client_id, topic, qos) values('test', 'test_topic1', 1);
insert into mqtt.sub(client_id, topic, qos) values('test', 'test_topic2', 2);
```

查询某个客户端订阅主题::

    select * from mqtt_sub where clientid = ${clientid};


查询 ClientI d为 'test' 的客户端已订阅主题::

 ```bash
 select * from mqtt_sub where clientid = 'test';
 
      client_id | topic       | qos
     -----------+-------------+-----
 test | test_topic1 |   1
 test | test_topic2 |   2
 ```

## Cassandra 消息存储表

*mqtt.msg* 存储 MQTT 消息:
```bash
    CREATE TABLE mqtt.msg (
        topic text,
        msgid text,
        sender text,
        qos int,
        retain int,
        payload text,
        arrived timestamp,
        PRIMARY KEY(topic, msgid)
      ) WITH CLUSTERING ORDER BY (msgid DESC);
```

查询某个客户端发布的消息:

```bash
select * from mqtt_msg where sender = ${clientid};
```

查询 ClientId 为  'test'的客户端发布的消息::

```bash
select * from mqtt_msg where sender = 'test';

     topic | msgid                | arrived                         | payload      | qos | retain | sender
    -------+----------------------+---------------------------------+--------------+-----+--------+--------
     hello | 2PguFrHsrzEvIIBdctmb | 2017-02-14 09:07:13.785000+0000 | Hello world! |   1 |      0 |   test
     world | 2PguFrHsrzEvIIBdctmb | 2017-02-14 09:07:13.785000+0000 | Hello world! |   1 |      0 |   test
```
    

## Cassandra 保留消息表

*mqtt.retain* 存储 Retain 消息:

```retain
CREATE TABLE mqtt.retain (
        topic text,
        msgid text,
        PRIMARY KEY(topic)
);
```

查询 retain 消息:

```bash
select * from mqtt_retain where topic = ${topic};
```

查询 topic 为 'retain' 的 retain 消息:

```bash
select * from mqtt_retain where topic = 'retain';

     topic  | msgid
    --------+----------------------
     retain | 2PguFrHsrzEvIIBdctmb
```

## Cassandra 消息确认表

*mqtt.acked* 存储客户端消息确认::

```bash
CREATE TABLE mqtt.acked (
        client_id text,
        topic text,
        msgid text,
        PRIMARY KEY(client_id, topic)
);
```

## 启用 Cassandra 存储插件

```js
./bin/emqx_ctl plugins load emqx_backend_cassa
```
