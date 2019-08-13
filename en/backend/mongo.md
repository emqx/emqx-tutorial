# MongoDB Backend


Config file: emqx_backend_mongo.conf


## Configure MongoDB Server


Connection pool of multiple MongoDB servers is supported:

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

## Configure MongoDB Persistence Hooks


```properties
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

## Description of MongoDB Persistence Hooks


| hook                   | topic                  | action                  | Description                      |
| ------------------------- | ------------------------- | -------------------------- | ----------------------------------- |
| client.connected       |                        | on_client_connected     | Store client connected state     |
| client.connected       |                        | on_subscribe_lookup     | Subscribed topics                |
| client.disconnected    |                        | on_client_disconnected  | Store client disconnected state  |
| session.subscribed     | #                      | on_message_fetch        | Fetch offline messages           |
| session.subscribed     | #                      | on_retain_lookup        | Lookup retained messages         |
| message.publish        | #                      | on_message_publish      | Store published messages         |
| message.publish        | #                      | on_message_retain       | Store retained messages          |
| message.publish        | #                      | on_retain_delete        | Delete retained messages         |
| message.acked          | #                      | on_message_acked        | Process ACK                      |


## Create MongoDB DB & Collections


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

```
>  DB name is free of choice


## MongoDB MQTT Client Collection


*mqtt_client* stores MQTT clients' connection states:

```javascript
    {
        clientid: string,
        state: 0,1, //0 disconnected 1 connected
        node: string,
        online_at: timestamp,
        offline_at: timestamp
    }
```

Query client's connection state:

```javascript
    db.mqtt_client.findOne({clientid: ${clientid}})
```

E.g., if client 'test' is online:

```javascript
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

Client 'test' is offline:

```javascript
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


## MongoDB Subscription Collection


*mqtt_sub* stores subscriptions of clients:

```javascript
    {
        clientid: string,
        topic: string,
        qos: 0,1,2
    }
```

E.g., client 'test' subscribes to topic 'test_topic1' and 'test_topic2':

```javascript
    db.mqtt_sub.insert({clientid: "test", topic: "test_topic1", qos: 1})
    db.mqtt_sub.insert({clientid: "test", topic: "test_topic2", qos: 2})
```

Query subscription of client 'test':

```javascript
    db.mqtt_sub.find({clientid: "test"})

    { "_id" : ObjectId("58646d90c65dff6ac9668ca1"), "clientid" : "test", "topic" : "test_topic1", "qos" : 1 }
    { "_id" : ObjectId("58646d96c65dff6ac9668ca2"), "clientid" : "test", "topic" : "test_topic2", "qos" : 2 }


## MongoDB Message Collection


*mqtt_msg* stores MQTT messages:

​```javascript
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

Query messages published by a client:

```javascript
    db.mqtt_msg.find({sender: ${clientid}})
```

Query messages published by client 'test':

```javascript
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


## MongoDB Retained Message Collection


*mqtt_retain* stores retained messages:

```javascript
    {
        topic: string,
        msgid: string,
        sender: string,
        qos: 0,1,2,
        payload: string,
        arrived: timestamp
    }
```

Query retained messages:

```javascript
    db.mqtt_retain.findOne({topic: ${topic}})
```

Query retained messages with topic 'retain':

```javascript
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


## MongoDB Acknowledgement Collection


*mqtt_acked* stores acknowledgements from the clients:

```javascript
    {
        clientid: string,
        topic: string,
        mongo_id: int
    }
```


## Enable MongoDB Backend


```bash
    ./bin/emqx_ctl plugins load emqx_backend_mongo
```
