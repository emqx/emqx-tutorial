# MongoDB数据存储

配置文件: emqx_backend_mongo.conf

## 配置MongoDB服务器

支持配置多台 MongoDB 数据库连接池:

```properties

    ## MongoDB Server Pools
    ## Mongo Topology Type single|unknown|sharded|rs
    backend.mongo.pool1.type = single

    ## If type rs, need config setname
    ## backend.mongo.pool1.rs_set_name = testrs

    ## Mongo Server 127.0.0.1:27017,127.0.0.2:27017...
    backend.mongo.pool1.server = 127.0.0.1:27017

    ## MongoDB Pool Size
    backend.mongo.pool1.c_pool_size = 8

    ## MongoDB Database
    backend.mongo.pool1.database = mqtt

    ## Mongo User
    ## backend.mongo.pool1.login =  emqtt
    ## Mongo Password
    ## backend.mongo.pool1.password = emqtt

    ## MongoDB AuthSource
    ## Value: String
    ## Default: mqtt
    ## backend.mongo.pool1.auth_source = admin

    ## Whether to enable SSL connection.
    ##
    ## Value: true | false
    ## backend.mongo.pool1.ssl = false

    ## SSL keyfile.
    ##
    ## Value: File
    ## backend.mongo.pool1.keyfile =

    ## SSL certfile.
    ##
    ## Value: File
    ## backend.mongo.pool1.certfile =

    ## SSL cacertfile.
    ##
    ## Value: File
    ## backend.mongo.pool1.cacertfile =

    # Value: unsafe | safe
    ## backend.mongo.pool1.w_mode = safe
    ## Value: master | slave_ok
    ## backend.mongo.pool1.r_mode = slave_ok

    ## Mongo Topology Options
    ## backend.mongo.topology.pool_size = 1
    ## backend.mongo.topology.max_overflow = 0
    ## backend.mongo.topology.overflow_ttl = 1000
    ## backend.mongo.topology.overflow_check_period = 1000
    ## backend.mongo.topology.local_threshold_ms = 1000
    ## backend.mongo.topology.connect_timeout_ms = 20000
    ## backend.mongo.topology.socket_timeout_ms = 100
    ## backend.mongo.topology.server_selection_timeout_ms = 30000
    ## backend.mongo.topology.wait_queue_timeout_ms = 1000
    ## backend.mongo.topology.heartbeat_frequency_ms = 10000
    ## backend.mongo.topology.min_heartbeat_frequency_ms = 1000

    ## Max number of fetch offline messages. Without count limit if infinity
    ## backend.mongo.max_returned_count = 500

    ## Time Range. Without time limit if infinity
    ## d - day
    ## h - hour
    ## m - minute
    ## s - second
    ## backend.mongo.time_range = 2h
```

## 配置 MongoDB 存储规则

```properties

    ## Max number of fetch offline messages. Without count limit if infinity
    ## backend.mongo.max_returned_count = 500

    ## Time Range. Without time limit if infinity
    ## d - day
    ## h - hour
    ## m - minute
    ## s - second
    ## backend.mongo.time_range = 2h

    ## Client Connected Record
    backend.mongo.hook.client.connected.1    = {"action": {"function": "on_client_connected"}, "pool": "pool1"}

    ## Subscribe Lookup Record
    backend.mongo.hook.client.connected.2    = {"action": {"function": "on_subscribe_lookup"}, "pool": "pool1"}

    ## Client DisConnected Record
    backend.mongo.hook.client.disconnected.1 = {"action": {"function": "on_client_disconnected"}, "pool": "pool1"}

    ## Lookup Unread Message QOS > 0
    backend.mongo.hook.session.subscribed.1  = {"topic": "#", "action": {"function": "on_message_fetch"}, "pool": "pool1"}

    ## Lookup Retain Message
    backend.mongo.hook.session.subscribed.2  = {"topic": "#", "action": {"function": "on_retain_lookup"}, "pool": "pool1"}

    ## Store Publish Message  QOS > 0, payload_format options mongo_json | plain_text
    backend.mongo.hook.message.publish.1     = {"topic": "#", "action": {"function": "on_message_publish"}, "pool": "pool1", "payload_format": "mongo_json"}

    ## Store Retain Message, payload_format options mongo_json | plain_text
    backend.mongo.hook.message.publish.2     = {"topic": "#", "action": {"function": "on_message_retain"}, "pool": "pool1", "payload_format": "mongo_json"}

    ## Delete Retain Message
    backend.mongo.hook.message.publish.3     = {"topic": "#", "action": {"function": "on_retain_delete"}, "pool": "pool1"}

    ## Store Ack
    backend.mongo.hook.message.acked.1       = {"topic": "#", "action": {"function": "on_message_acked"}, "pool": "pool1"}

```


## MongoDB 存储规则说明

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


## 创建MongoDB数据库集合
```javascript

    use mqtt
    db.createCollection("mqtt_client")
    db.createCollection("mqtt_sub")
    db.createCollection("mqtt_msg")
    db.createCollection("mqtt_retain")
    db.createCollection("mqtt_acked")

    db.mqtt_client.ensureIndex({clientid:1, node:2})
    db.mqtt_sub.ensureIndex({clientid:1})
    db.mqtt_msg.ensureIndex({sender:1, topic:2})
    db.mqtt_retain.ensureIndex({topic:1})
````

> 数据库名称可自定义

## MongoDB 设备在线状态集合

*mqtt_client* 存储设备在线状态:

```js
{
   clientid: string,
   state: 0,1, //0离线 1在线
   node: string,
   online_at: timestamp,
   offline_at: timestamp
}
```

查询设备在线状态:

```js
db.mqtt_client.findOne({clientid: ${clientid}})
```

例如 ClientId 为 test 客户端上线:

```js
db.mqtt_client.findOne({clientid: "test"})

    {
        "_id" : ObjectId("58646c9bdde89a9fb9f7fb73"),
        "clientid" : "test",
        "state" : 1,
        "node" : "emqx@127.0.0.1",
        "online_at" : 1482976411,
        "offline_at" : null
    }
```

例如 ClientId 为 test 客户端下线:

```js
db.mqtt_client.findOne({clientid: "test"})

    {
        "_id" : ObjectId("58646c9bdde89a9fb9f7fb73"),
        "clientid" : "test",
        "state" : 0,
        "node" : "emq@127.0.0.1",
        "online_at" : 1482976411,
        "offline_at" : 1482976501
    }
```
    

## MongoDB 主题订阅集合

*mqtt_sub* 存储订阅关系:


```js
{
        clientid: string,
        topic: string,
        qos: 0,1,2
}
```

例如 ClientId 为 test 的客户端订阅主题 test_topic1 test_topic2:

```js
db.mqtt_sub.insert({clientid: "test", topic: "test_topic1", qos: 1})
db.mqtt_sub.insert({clientid: "test", topic: "test_topic2", qos: 2})
```

    

查询 ClientId 为 "test" 的客户端的代理订阅主题:

```js
db.mqtt_sub.find({clientid: "test"})

    { "_id" : ObjectId("58646d90c65dff6ac9668ca1"), "clientid" : "test", "topic" : "test_topic1", "qos" : 1 }
    { "_id" : ObjectId("58646d96c65dff6ac9668ca2"), "clientid" : "test", "topic" : "test_topic2", "qos" : 2 }
```
    

## MongoDB 消息存储集合

*mqtt_msg* 存储 MQTT 消息:

```js
    {
        _id: int,
        topic: string,
        msgid: string,
        sender: string,
        qos: 0,1,2,
        retain: boolean (true, false),
        payload: string,
        arrived: timestamp
    }
```

查询某个客户端发布的消息:

```js
```


例如查询 ClientId 为 "test" 的客户端发布的消息:

```js
db.mqtt_msg.find({sender: "test"})
    {
        "_id" : 1,
        "topic" : "/World",
        "msgid" : "AAVEwm0la4RufgAABeIAAQ==",
        "sender" : "test",
        "qos" : 1,
        "retain" : 1,
        "payload" : "Hello world!",
        "arrived" : 1482976729
    }
```
    

## MongoDB 保留消息集合

*mqtt_retain* 存储 Retain 消息:

```js
{
        topic: string,
        msgid: string,
        sender: string,
        qos: 0,1,2,
        payload: string,
        arrived: timestamp
    }
```
    

查询 retain 消息:

```js
db.mqtt_retain.findOne({topic: ${topic}})
```
    

查询 topi c为 "retain" 的 retai n消息:

```js
db.mqtt_retain.findOne({topic: "/World"})
    {
        "_id" : ObjectId("58646dd9dde89a9fb9f7fb75"),
        "topic" : "/World",
        "msgid" : "AAVEwm0la4RufgAABeIAAQ==",
        "sender" : "c1",
        "qos" : 1,
        "payload" : "Hello world!",
        "arrived" : 1482976729
    }
```
    

## MongoDB 消息确认集合

*mqtt_acked* 集合存储客户端消息确认:

```js
{
  clientid: string,
  topic: string,
  mongo_id: int
}
```

    

## 启用 MongoDB 数据存储

```bash
./bin/emqx_ctl plugins load emqx_backend_mongo
```
