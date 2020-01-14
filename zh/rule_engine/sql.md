# SQL 手册

> 兼容提示: EMQ X v4.0 对规则引擎 SQL 语法做出较大调整，v3.x 升级用户请参照[迁移指南](./rule_engine.md#迁移指南)进行适配。

## SQL 语句

SQL 语句用于从原始数据中，根据条件筛选出字段，并进行预处理和转换，基本格式为：

```
SELECT <字段名> FROM <触发事件> [WHERE <条件>]
```

1. 注意事项
- FROM 子句后面的主题名需要用双引号("") 引起来。
- WHERE 子句后面接筛选条件，如果使用到字符串需要用单引号 ('') 引起来。
- SELECT 子句中，若使用 "." 符号对 payload 进行嵌套选择，必须保证 payload 为 JSON 格式。


## SQL 语句示例

1. 从 topic 为 "t/a" 的消息中提取所有字段：

    ```sql
    SELECT * FROM "t/a"
    ```



2. 从 topic 能够匹配到 't/#' 的消息中提取所有字段。注意这里使用了 '=~' 操作符进行带通配符的 topic 匹配

    ```sql
    SELECT * FROM "t/#"
    ```

3. 从 topic 能够匹配到 't/#' 的消息中提取 qos，username 和 clientid 字段

    ```sql
    SELECT qos, username, clientid FROM "t/#"
    ```

4. 从任意 topic 的消息中提取 username 字段，并且筛选条件为 username = 'u_emqx'

    ```sql
    SELECT username FROM "#" WHERE username='u_emqx'
    ```

5. 从任意 topic 的消息的消息体(payload) 中提取 x 字段，并创建别名 x 以便在 WHERE 子句中使用。WHERE 子句限定条件为 x = 1。注意 payload 必须为 JSON 格式。举例：此 SQL 语句可以匹配到消息体 `{"x": 1}`, 但不能匹配到消息体 `{"x": 2}`

    ```sql
    SELECT payload as p, p.x as x FROM "#" WHERE x=1
    ```

6. 类似于上面的 SQL 语句，但嵌套地提取消息体中的数据，此 SQL 语句可以匹配到消息体 `{"x": {"y": 1}}`

    ```sql
    SELECT payload as p, p.x.y as a FROM "#" WHERE a=1
    ```

7. 在 clientid = 'c1' 尝试连接时，提取其来源 IP 地址和端口号

    ```sql
    SELECT peername as ip_port FROM "$events/client_connected" WHERE clientid = 'c1'
    ```

8. 筛选所有订阅 't/#' 主题且订阅级别为 QoS1 的 clientid。注意这里用的是严格相等操作符 '='，所以不会匹配主题为 't' 或 't/+/a' 的订阅请求

    ```sql
    SELECT  clientid FROM "$events/session_subscribe" WHERE topic = 't/#' and qos = 1
    ```

## 事件主题

### Message Publish ($events/message_publish)

| 字段        | 类型      | 示例值              | 说明                                                                                                        |
| --------- | ------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| id        | string  | --               | MQTT message id                                                                                           |
| clientid  | string  |                  | clientid                                                                                                  |
| username  | string  | u_emqx           | 当前客户端 MQTT username                                                                                       |
| payload   | string  | {"msg": "hello"} | 消息内容, 如果是 JSON 格式将自动解码, 在 SQL 中使用 payload.x 获取对象信息                                                        |
| peerhost  | string  |                  | peerhost                                                                                                  |
| topic     | string  | t/a              | 当前 MQTT 主题, SQL 中可以使用通配符进行筛选.<br/>Subscribe 与 Unsubscribe 请求中包含多个主题时, 这里只会获取到第一个, 如需获取全部请使用 topic_filters |
| qos       | integer | 1                | 消息 QoS 0,1,2 中枚举                                                                                          |
| flags     | string  |                  | flags                                                                                                     |
| headers   | string  |                  | headers                                                                                                   |
| timestamp | integer | 1576549961086    | 当前毫秒级时间戳                                                                                                  |
| node      | string  | emqx@127.0.0.1   | 触发事件的节点名称                                                                                                 |




### Message Delivered ($events/message_delivered)

| 字段            | 类型      | 示例值              | 说明                                                                                                        |
| ------------- | ------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| event         | string  | disconnect       | 触发事件名称                                                                                                    |
| id            | string  | --               | MQTT message id                                                                                           |
| from_clientid | string  |                  | from_clientid                                                                                             |
| from_username | string  |                  | from_username                                                                                             |
| clientid      | string  |                  | clientid                                                                                                  |
| username      | string  | u_emqx           | 当前客户端 MQTT username                                                                                       |
| payload       | string  | {"msg": "hello"} | 消息内容, 如果是 JSON 格式将自动解码, 在 SQL 中使用 payload.x 获取对象信息                                                        |
| peerhost      | string  |                  | peerhost                                                                                                  |
| topic         | string  | t/a              | 当前 MQTT 主题, SQL 中可以使用通配符进行筛选.<br/>Subscribe 与 Unsubscribe 请求中包含多个主题时, 这里只会获取到第一个, 如需获取全部请使用 topic_filters |
| qos           | integer | 1                | 消息 QoS 0,1,2 中枚举                                                                                          |
| flags         | string  |                  | flags                                                                                                     |
| timestamp     | integer | 1576549961086    | 当前毫秒级时间戳                                                                                                  |
| node          | string  | emqx@127.0.0.1   | 触发事件的节点名称                                                                                                 |




### Message Acked ($events/message_acked)

| 字段            | 类型      | 示例值              | 说明                                                                                                        |
| ------------- | ------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| event         | string  | disconnect       | 触发事件名称                                                                                                    |
| id            | string  | --               | MQTT message id                                                                                           |
| from_clientid | string  |                  | from_clientid                                                                                             |
| from_username | string  |                  | from_username                                                                                             |
| clientid      | string  |                  | clientid                                                                                                  |
| username      | string  | u_emqx           | 当前客户端 MQTT username                                                                                       |
| payload       | string  | {"msg": "hello"} | 消息内容, 如果是 JSON 格式将自动解码, 在 SQL 中使用 payload.x 获取对象信息                                                        |
| peerhost      | string  |                  | peerhost                                                                                                  |
| topic         | string  | t/a              | 当前 MQTT 主题, SQL 中可以使用通配符进行筛选.<br/>Subscribe 与 Unsubscribe 请求中包含多个主题时, 这里只会获取到第一个, 如需获取全部请使用 topic_filters |
| qos           | integer | 1                | 消息 QoS 0,1,2 中枚举                                                                                          |
| flags         | string  |                  | flags                                                                                                     |
| timestamp     | integer | 1576549961086    | 当前毫秒级时间戳                                                                                                  |
| node          | string  | emqx@127.0.0.1   | 触发事件的节点名称                                                                                                 |




### Message Dropped ($events/message_dropped)

| 字段        | 类型      | 示例值              | 说明                                                                                                        |
| --------- | ------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| event     | string  | disconnect       | 触发事件名称                                                                                                    |
| id        | string  | --               | MQTT message id                                                                                           |
| reason    | string  |                  | reason                                                                                                    |
| clientid  | string  |                  | clientid                                                                                                  |
| username  | string  | u_emqx           | 当前客户端 MQTT username                                                                                       |
| payload   | string  | {"msg": "hello"} | 消息内容, 如果是 JSON 格式将自动解码, 在 SQL 中使用 payload.x 获取对象信息                                                        |
| peerhost  | string  |                  | peerhost                                                                                                  |
| topic     | string  | t/a              | 当前 MQTT 主题, SQL 中可以使用通配符进行筛选.<br/>Subscribe 与 Unsubscribe 请求中包含多个主题时, 这里只会获取到第一个, 如需获取全部请使用 topic_filters |
| qos       | integer | 1                | 消息 QoS 0,1,2 中枚举                                                                                          |
| flags     | string  |                  | flags                                                                                                     |
| timestamp | integer | 1576549961086    | 当前毫秒级时间戳                                                                                                  |
| node      | string  | emqx@127.0.0.1   | 触发事件的节点名称                                                                                                 |




### Client Connected ($events/client_connected)

| 字段              | 类型      | 示例值             | 说明                  |
| --------------- | ------- | --------------- | ------------------- |
| event           | string  | disconnect      | 触发事件名称              |
| clientid        | string  |                 | clientid            |
| username        | string  | u_emqx          | 当前客户端 MQTT username |
| mountpoint      | string  | undefined       | 挂载点, 使用于桥接消息        |
| peername        | string  | 127.0.0.1:63412 | 客户端网络地址             |
| sockname        | string  |                 | sockname            |
| proto_name      | string  |                 | proto_name          |
| proto_ver       | string  | 4               | 当前协议版本              |
| keepalive       | integer | 60              | 当前客户端 keepalive     |
| clean_start     | boolean | false           | Clean Start         |
| expiry_interval | string  |                 | expiry_interval     |
| is_bridge       | string  |                 |                     |
| connected_at    | integer | 1576549961086   | 连接毫秒级时间戳            |
| timestamp       | integer | 1576549961086   | 当前毫秒级时间戳            |
| node            | string  | emqx@127.0.0.1  | 触发事件的节点名称           |




### Client Disconnected ($events/client_disconnected)

| 字段              | 类型      | 示例值             | 说明                  |
| --------------- | ------- | --------------- | ------------------- |
| event           | string  | disconnect      | 触发事件名称              |
| reason          | string  |                 | reason              |
| clientid        | string  |                 | clientid            |
| username        | string  | u_emqx          | 当前客户端 MQTT username |
| peername        | string  | 127.0.0.1:63412 | 客户端网络地址             |
| sockname        | string  |                 | sockname            |
| disconnected_at | string  |                 | disconnected_at     |
| timestamp       | integer | 1576549961086   | 当前毫秒级时间戳            |
| node            | string  | emqx@127.0.0.1  | 触发事件的节点名称           |




### Session Subscribed ($events/session_subscribed)

| 字段        | 类型      | 示例值            | 说明                                                                                                        |
| --------- | ------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| event     | string  | disconnect     | 触发事件名称                                                                                                    |
| clientid  | string  |                | clientid                                                                                                  |
| username  | string  | u_emqx         | 当前客户端 MQTT username                                                                                       |
| peerhost  | string  |                | peerhost                                                                                                  |
| topic     | string  | t/a            | 当前 MQTT 主题, SQL 中可以使用通配符进行筛选.<br/>Subscribe 与 Unsubscribe 请求中包含多个主题时, 这里只会获取到第一个, 如需获取全部请使用 topic_filters |
| qos       | integer | 1              | 消息 QoS 0,1,2 中枚举                                                                                          |
| timestamp | integer | 1576549961086  | 当前毫秒级时间戳                                                                                                  |
| node      | string  | emqx@127.0.0.1 | 触发事件的节点名称                                                                                                 |




### Session Unsubscribed ($events/session_unsubscribed)

| 字段        | 类型      | 示例值            | 说明                                                                                                        |
| --------- | ------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| event     | string  | disconnect     | 触发事件名称                                                                                                    |
| clientid  | string  |                | clientid                                                                                                  |
| username  | string  | u_emqx         | 当前客户端 MQTT username                                                                                       |
| peerhost  | string  |                | peerhost                                                                                                  |
| topic     | string  | t/a            | 当前 MQTT 主题, SQL 中可以使用通配符进行筛选.<br/>Subscribe 与 Unsubscribe 请求中包含多个主题时, 这里只会获取到第一个, 如需获取全部请使用 topic_filters |
| qos       | integer | 1              | 消息 QoS 0,1,2 中枚举                                                                                          |
| timestamp | integer | 1576549961086  | 当前毫秒级时间戳                                                                                                  |
| node      | string  | emqx@127.0.0.1 | 触发事件的节点名称                                                                                                 |



