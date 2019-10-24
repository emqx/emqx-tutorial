# SQL 手册

## 兼容性说明

EMQ X 在 v3.4.1 对规则引擎做出功能调整，不再自动解码对消息 payload 以提升性能和规则 SQL 语义性，需要使用到 payload 中的字段请按如下方式升级：

3.4.0 以及更老版本:

```sql
SELECT
  payload.host as host,
  payload.location as location,
  payload.internal as internal,
  payload.external as external
FROM
  "message. publish"
```

3.4.1 以及以后版本:
```sql
SELECT
  json_decode(payload) as p, -- 需要手动对 payload 字段解码
  p.host as host,
  p.location as location,
  p.internal as internal,
  p.external as external
FROM
  "message. publish"
```



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
    SELECT * FROM "message.publish" WHERE topic = 't/a'
    ```



2. 从 topic 能够匹配到 't/#' 的消息中提取所有字段。注意这里使用了 '=~' 操作符进行带通配符的 topic 匹配

    ```sql
    SELECT * FROM "message.publish" WHERE topic =~ 't/#'
    ```

3. 从 topic 能够匹配到 't/#' 的消息中提取 qos，username 和 client_id 字段

    ```sql
    SELECT qos, username, client_id FROM "message.publish" WHERE topic =~ 't/#'
    ```

4. 从任意 topic 的消息中提取 username 字段，并且筛选条件为 username = 'u_emqx'

    ```sql
    SELECT username FROM "message.publish" WHERE username='u_emqx'
    ```

5. 从任意 topic 的消息的消息体(payload) 中提取 x 字段，并创建别名 x 以便在 WHERE 子句中使用。WHERE 子句限定条件为 x = 1。注意 payload 必须为 JSON 格式。举例：此 SQL 语句可以匹配到消息体 `{"x": 1}`, 但不能匹配到消息体 `{"x": 2}`

    ```sql
    SELECT json_decode(payload) as p, p.x as x FROM "message.publish" WHERE x=1
    ```

6. 类似于上面的 SQL 语句，但嵌套地提取消息体中的数据，此 SQL 语句可以匹配到消息体 `{"x": {"y": 1}}`

    ```sql
    SELECT json_decode(payload) as p, p.x.y as a FROM "message.publish" WHERE a=1
    ```

7. 在 client_id = 'c1' 尝试连接时，提取其来源 IP 地址和端口号

    ```sql
    SELECT peername as ip_port FROM "client.connected" WHERE client_id = 'c1'
    ```

8. 筛选所有订阅 't/#' 主题且订阅级别为 QoS1 的 client_id。注意这里用的是严格相等操作符 '='，所以不会匹配主题为 't' 或 't/+/a' 的订阅请求

    ```sql
    SELECT  client_id FROM "client.subscribe" WHERE topic = 't/#' and qos = 1
    ```

9. 事实上，上例中的 topic 和 qos 字段，是当订阅请求里只包含了一对 (Topic, QoS) 时，为使用方便而设置的别名。但如果订阅请求中 Topic Filters 包含了多个 (Topic, QoS) 组合对，那么必须显式使用 contains_topic() 或 contains_topic_match() 函数来检查 Topic Filters 是否包含指定的 (Topic, QoS)

    ```sql
    SELECT  client_id FROM "client.subscribe" WHERE contains_topic(topic_filters, 't/#')
    ```

    ```sql
    SELECT  client_id FROM "client.subscribe" WHERE contains_topic(topic_filters, 't/#', 1)
    ```

## SELECT 子句可用的字段


### 消息发布(message.publish)


|  字段      | 字段说明                             |
|-----------|------------------------------------|
| client_id | Client ID                          |
| username  | 用户名                             |
| event     | 事件类型，固定为 "message.publish" |
| flags     | MQTT 消息的 flags                  |
| id        | MQTT 消息 ID                       |
| topic     | MQTT 主题                          |
| payload   | MQTT 消息体                        |
| peername  | 客户端的 IPAddress 和 Port         |
| qos       | MQTT 消息的 QoS                    |
| timestamp | 时间戳                             |



### 消息投递(message.deliver)

|  字段      | 字段说明                             |
|-----------|------------------------------------|
| client_id   | Client ID                          |
| username    | 用户名                             |
| event       | 事件类型，固定为 "message.deliver" |
| flags       | MQTT 消息的 flags                  |
| id          | MQTT 消息 ID                       |
| topic       | MQTT 主题                          |
| payload     | MQTT 消息体                        |
| peername    | 客户端的 IPAddress 和 Port         |
| qos         | MQTT 消息的 QoS                    |
| timestamp   | 时间戳                             |
| auth_result | 认证结果                           |
| mountpoint  | 消息主题挂载点                     |



### 消息确认(message.acked)


|  字段      | 字段说明                             |
|-----------|------------------------------------|
| client_id | Client ID                        |
| username  | 用户名                           |
| event     | 事件类型，固定为 "message.acked" |
| flags     | MQTT 消息的 flags                |
| id        | MQTT 消息 ID                     |
| topic     | MQTT 主题                        |
| payload   | MQTT 消息体                      |
| peername  | 客户端的 IPAddress 和 Port       |
| qos       | MQTT 消息的 QoS                  |
| timestamp | 时间戳                           |



### 消息丢弃(message.dropped)


|  字段      | 字段说明                             |
|-----------|------------------------------------|
| client_id | Client ID                          |
| username  | 用户名                             |
| event     | 事件类型，固定为 "message.dropped" |
| flags     | MQTT 消息的 flags                  |
| id        | MQTT 消息 ID                       |
| topic     | MQTT 主题                          |
| payload   | MQTT 消息体                        |
| peername  | 客户端的 IPAddress 和 Port         |
| qos       | MQTT 消息的 QoS                    |
| timestamp | 时间戳                             |
| node      | 节点名                             |



### 连接完成(client.connected)


|  字段      | 字段说明                             |
|-----------|------------------------------------|
| client_id    | Client ID                           |
| username     | 用户名                              |
| event        | 事件类型，固定为 "client.connected" |
| auth_result  | 认证结果                            |
| clean_start  | MQTT clean start 标志位             |
| connack      | MQTT CONNACK 结果                   |
| connected_at | 连接时间戳                          |
| is_bridge    | 是否是桥接                          |
| keepalive    | MQTT 保活间隔                       |
| mountpoint   | 消息主题挂载点                      |
| peername     | 客户端的 IPAddress 和 Port          |
| proto_ver    | MQTT 协议版本                       |




### 连接断开(client.disconnected)


|  字段      | 字段说明                             |
|-----------|------------------------------------|
| client_id   | Client ID                              |
| username    | 用户名                                 |
| event       | 事件类型，固定为 "client.disconnected" |
| auth_result | 认证结果                               |
| mountpoint  | 消息主题挂载点                         |
| peername    | 客户端的 IPAddress 和 Port             |
| reason_code | 断开原因码                             |



### 订阅(client.subscribe)


|  字段      | 字段说明                             |
|-----------|------------------------------------|
| client_id     | Client ID                           |
| username      | 用户名                              |
| event         | 事件类型，固定为 "client.subscribe" |
| auth_result   | 认证结果                            |
| mountpoint    | 消息主题挂载点                      |
| peername      | 客户端的 IPAddress 和 Port          |
| topic_filters | MQTT 订阅列表                       |
| topic         | MQTT 订阅列表中的第一个订阅的主题   |
| topic_filters | MQTT 订阅列表中的第一个订阅的 QoS   |



### 取消订阅(client.unsubscribe)


|  字段      | 字段说明                             |
|-----------|------------------------------------|
| client_id     | Client ID                             |
| username      | 用户名                                |
| event         | 事件类型，固定为 "client.unsubscribe" |
| auth_result   | 认证结果                              |
| mountpoint    | 消息主题挂载点                        |
| peername      | 客户端的 IPAddress 和 Port            |
| topic_filters | MQTT 订阅列表                         |
| topic         | MQTT 订阅列表中的第一个订阅的主题     |
| topic_filters | MQTT 订阅列表中的第一个订阅的 QoS     |

