# Redis 数据存储

本章节以在 `CentOS 7.2` 中的实际例子来说明如何通过 Redis 来存储相关的信息。

## 安装与验证 Redis 服务器

读者可以参考 Redis 官方的 [Quick Start](https://redis.io/topics/quickstart) 来安装 Redis（写本文的时候，Redis 版本为5.0），通过 `redis-server` 命令来启动 Redis 服务器。

```bash
# redis-server
20433:C 01 Nov 2018 11:36:30.773 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
20433:C 01 Nov 2018 11:36:30.773 # Redis version=5.0.0, bits=64, commit=00000000, modified=0, pid=20433, just started
... more logs ...
```

在另外的窗口打开 `redis-cli` 命令，在 `redis-cli` 的交互式命令行窗口中可以通过 `ping` 测试一下 Redis 是否安装成功（返回 'PONG' 表示成功）；通过 `keys *` 命令来查看一下现在 Redis 中有多少存储的值，由于 Redis 首次安装使用，因此返回的是一个空的列表。

```bash
# redis-cli
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> keys *
(empty list or set)
127.0.0.1:6379>
```

## 配置 EMQ X 服务器

通过 RPM 方式安装的 EMQ X，Redis 相关的配置文件位于 `/etc/emqx/plugins/emqx_backend_redis.conf`，如果只是测试 Redis 持久化的功能，大部分配置不需要做更改。唯一需要更改的地方可能是 Redis 服务器的地址：如果读者安装的 Redis 不与 EMQ X 在同一服务器上，请指定正确的 Redis 服务器的地址与端口。如下所示，

```bash
## Redis Server 127.0.0.1:6379, Redis Sentinel: 127.0.0.1:26379
backend.redis.pool1.server = 127.0.0.1:6379
```

保持剩下部分的配置文件不变，然后需要启动该插件。启动插件的方式有 `命令行`和 `控制台`两种方式，读者可以任选其一。

### 通过命令行启动

TODO：

```bash
emqx_ctl plugins ...
```



### 通过管理控制台启动

TODO：截图等



## 连接存储

通过任意客户端建立一个 `MQTT` 连接，本文通过 [Eclipse mosquitto](https://mosquitto.org/) 提供的命令行工具。命令如下所示，与 EMQ X 服务器10.211.55.10建立了一个连接，clientId 为 sub_client1，订阅的主题为 /devices/001/temp。

```bash
mosquitto_sub -h 10.211.55.10 -i sub_client1 -t /devices/001/temp
```

切换至 `redis-cli` 命令行窗口，执行命令 `keys *`，结果如下所示，读者可以看到在 Redis 中存储了两个列表。

```bash
127.0.0.1:6379> keys *
1) "mqtt:node:emqx@127.0.0.1"
2) "mqtt:client:sub_client1"
```

TODO：解释一下上述存储的内容是通过配置文件中哪个配置项起作用的，其代表的含义是什么？



### 连接列表

//TODO 详细解释该处的数据结构的含义

```bash
127.0.0.1:6379> hgetall mqtt:node:emqx@127.0.0.1
1) "sub_client1"
2) "1541055363"
```



### 连接详细信息

//TODO 详细解释该处的数据结构的含义

```bash
127.0.0.1:6379> hgetall mqtt:client:sub_client1
1) "state"
2) "1"
3) "online_at"
4) "1541055363"
5) "offline_at"
6) "undefined"
```



## 消息相关存储

保持以上的订阅连接，接下来通过 `mosquitto_pub` 来发布一条消息，如下所示。

```bash
mosquitto_pub -h 10.211.55.10 -i pub_client1  -q 2 -t /devices/001/temp -m "hello message"
mosquitto_pub -h 10.211.55.10 -i pub_client1  -q 2 -t /devices/001/temp -m "hello message"
```



```bash
127.0.0.1:6379> keys *
1) "mqtt:msg:2V7sw5t4nUJn4gsvqT7h"
2) "mqtt:node:emqx@127.0.0.1"
3) "mqtt:client:sub_client1"
4) "mqtt:msg:/devices/001/temp"
5) "mqtt:client:pub_client1"
```



//TODO 挨个说明各个列表及其每个字段所表达的意思

```bash
127.0.0.1:6379> hgetall mqtt:client:pub_client1
1) "state"
2) "0"
3) "online_at"
4) "1541056870"
5) "offline_at"
6) "1541056870"
```



```bash
127.0.0.1:6379> zrange mqtt:msg:/devices/001/temp 0 -1
1) "2V7sw5t4nUJn4gsvqT7h"
2) "2V7szMYcJMndAzRPUbez"
```



```bash
127.0.0.1:6379> hgetall mqtt:msg:2V7sw5t4nUJn4gsvqT7h
 1) "id"
 2) "2V7sw5t4nUJn4gsvqT7h"
 3) "from"
 4) "pub_client1"
 5) "qos"
 6) "2"
 7) "topic"
 8) "/devices/001/temp"
 9) "payload"
10) "hello message"
11) "ts"
12) "1541056734"
13) "retain"
14) "false"
```



TODO：再加一下 一对多、retain 等的例子。



TODO：如果上述都描述的比较清楚了，那么可能下面大部分内容都不需要了，只需要留一些总结性的内容即可。



## 总结

读者在理解了 Redis 中所存储的数据结构之后，可以利用各种 [Redis 客户端](https://redis.io/clients)来实现对相关信息的读取，



## Redis 存储规则说明

| hook                | topic    | action/function             | 说明               |
| ------------------- | -------- | --------------------------- | ------------------ |
| client.connected    |          | on_client_connected         | 存储客户端在线状态 |
| client.connected    |          | on_subscribe_lookup         | 订阅主题           |
| client.disconnected |          | on_client_disconnected      | 存储客户端离线状态 |
| session.subscribed  | queue/#  | on_message_fetch_for_queue  | 获取一对一离线消息 |
| session.subscribed  | pubsub/# | on_message_fetch_for_pubsub | 获取一对多离线消息 |
| session.subscribed  | #        | on_retain_lookup            | 获取 retain 消息     |
| message.publish     | #        | on_message_publish          | 存储发布消息       |
| message.publish     | #        | on_message_retain           | 存储 retain 消息     |
| message.publish     | #        | on_retain_delete            | 删除 retain 消息     |
| message.acked       | queue/#  | on_message_acked_for_queue  | 一对一消息 ACK 处理  |
| message.acked       | pubsub/# | on_message_acked_for_pubsub | 一对多消息 ACK 处理  |





## Redis 命令行参数说明



| hook                   | 可用参数                                      | 示例 (每个字段分隔，必须是一个空 格)          |
| ---------------------- | --------------------------------------------- | -------------------------------------------- |
| client.connected       | clientid                                      | SET conn:${clientid} ${clientid}             |
| client.disconnected    | clientid                                      | SET disconn:${clientid} ${clientid}          |
| ses- sion.subscribed   | clientid, topic, qos                          | HSET sub:${clientid} ${topic} ${qos}         |
| ses- sion.unsubscribed | clientid, topic                               | SET unsub:${clientid} ${topic}               |
| message.publish        | message, msgid, topic, payload, qos, clientid | RPUSH pub:${topic} ${msgid}                  |
| message.acked          | msgid, topic, clientid                        | HSET ack:${clientid} ${topic} ${ms- gid}     |
| message.delivered      | msgid, topic, clientid                        | HSET delivered:${clientid} ${topic} ${msgid} |





## Redis 命令行配置 Action

Redis 存储支持用户采用 Redis Commands 语句配置 Action，例如:

```bash
## 在客户端连接到 EMQ X 服务器后，可以支持配置一条或多条 Redis 指令 

backend.redis.hook.client.connected.3 = {"action": {"commands": ["SET conn:${clientid} ${clientid}"]}, "pool": "pool1"}
```





## Redis 设备在线状态 Hash

mqtt:client Hash 存储设备在线状态:

```bash
hmset
key = mqtt:client:${clientid}
value = {state:int, online_at:timestamp, offline_at:timestamp}
hset
key = mqtt:node:${node}
field = ${clientid}
value = ${ts}
```



## 查询设备在线状态

```bash
HGETALL "mqtt:client:${clientId}"
```

例如 ClientId 为 test 客户端上线:

```bash
HGETALL mqtt:client:test
1) "state"
2) "1"
3) "online_at"
4) "1481685802"
5) "offline_at"
6) "undefined"
```

例如 ClientId 为 test 客户端下线:

```bash
HGETALL mqtt:client:test
1) "state"
2) "0"
3) "online_at"
4) "1481685802"
5) "offline_at"
6) "1481685924"
```



## Redis 保留消息 Hash

mqtt:retain Hash 存储 Retain 消息:

```bash
hmset
key = mqtt:retain:${topic}
value = {id: string, from: string, qos: int, topic: string, retain: int, payload: string, ts: timestamp}
```

查询 retain 消息:

```bash
HGETALL "mqtt:retain:${topic}" 
```

例如查看 topic 为 topic 的 retain 消息: 

```bash
 HGETALL mqtt:retain:topic
 1) "id"
 2) "6P9NLcJ65VXBbC22sYb4"
 3) "from"
 4) "test"
 5) "qos"
 6) "1"
 7) "topic"
 8) "topic"
 9) "retain"
10) "true"
11) "payload"
12) "Hello world!"
13) "ts"
14) "1481690659"
```

## Redis 消息存储 Hash

mqtt:msg Hash 存储 MQTT 消息:

```bash
hmset
key = mqtt:msg:${msgid}
value = {id: string, from: string, qos: int, topic: string, retain: int, payload: string, ts: timestamp}
zadd
key = mqtt:msg:${topic}
field = 1
value = ${msgid}
```



## Redis 消息确认 SET

mqtt:acked SET 存储客户端消息确认:

```bash
set
key = mqtt:acked:${clientid}:${topic}
value = ${msgid}
```



##  Redis 订阅存储 Hash

mqtt:sub Hash 存储订阅关系:

```bash
hset
key = mqtt:sub:${clientid}
field = ${topic}
value = ${qos}
```

某个客户端订阅主题:

```bash
HSET mqtt:sub:${clientid} ${topic} ${qos}
```

例如为 ClientId 为 "test" 的客户端订阅主题 topic1, topic2:

```bash
HSET "mqtt:sub:test" "topic1" 1
HSET "mqtt:sub:test" "topic2" 2
```



## 查询 ClientId 为 "test" 的客户端已订阅主题

```bash
HGETALL mqtt:sub:test
1) "topic1"
2) "1"
3) "topic2"
4) "2"
```



## Redis SUB/UNSUB 事件发布

设备需要订阅 / 取消订阅主题时，业务服务器向 Redis 发布事件消息:

```bash
PUBLISH
channel = "mqtt_channel"
message = {type: string , topic: string, clientid: string, qos: int}
type: [subscribe/unsubscribe]
```



例如 ClientId 为 test 客户端订阅主题 topic0:

```bash
 PUBLISH "mqtt_channel" "{\"type\": \"subscribe\", \"topic\": \"topic0\", \"clientid\": \"test\", \"qos\": \"0\"}"
```



例如 ClientId 为 test 客户端取消订阅主题:

```bash
PUBLISH "mqtt_channel" "{\"type\": \"unsubscribe\", \"topic\": \"test_topic0\", \"clientid\": \"test\"}"
```



## EMQ X 启用 Redis 存储插件

```bash
./bin/emqx_ctl plugins load emqx_backend_redis
```

