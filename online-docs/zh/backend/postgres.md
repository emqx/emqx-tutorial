# PostgreSQL 数据存储

配置文件: emqx_backend_pgsql.conf

## 配置 PostgreSQL 服务器

支持配置多台 PostgreSQL 服务器连接池:

```properties

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

    ## Max number of fetch offline messages. Without count limit if infinity
    ## backend.pgsql.max_returned_count = 500

    ## Time Range. Without time limit if infinity
    ## d - day
    ## h - hour
    ## m - minute
    ## s - second
    ## backend.pgsql.time_range = 2h
```

## 配置 PostgreSQL 存储规则

```properties

    ## Max number of fetch offline messages. Without count limit if infinity
    ## backend.pgsql.max_returned_count = 500

    ## Time Range. Without time limit if infinity
    ## d - day
    ## h - hour
    ## m - minute
    ## s - second
    ## backend.pgsql.time_range = 2h

    ## Client Connected Record
    backend.pgsql.hook.client.connected.1    = {"action": {"function": "on_client_connected"}, "pool": "pool1"}

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

    ## Store Publish Message  QOS > 0
    backend.pgsql.hook.message.publish.1     = {"topic": "#", "action": {"function": "on_message_publish"}, "pool": "pool1"}

    ## Store Retain Message
    backend.pgsql.hook.message.publish.2     = {"topic": "#", "action": {"function": "on_message_retain"}, "pool": "pool1"}

    ## Delete Retain Message
    backend.pgsql.hook.message.publish.3     = {"topic": "#", "action": {"function": "on_retain_delete"}, "pool": "pool1"}

    ## Store Ack
    backend.pgsql.hook.message.acked.1       = {"topic": "#", "action": {"function": "on_message_acked"}, "pool": "pool1"}
```

## PostgreSQL 存储规则说明

| hook                | topic | action                 | 说明               |
| ------------------- | ----- | ---------------------- | ------------------ |
| client.connected    |       | on_client_connected    | 存储客户端在线状态 |
| client.connected    |       | on_subscribe_lookup    | 订阅主题           |
| client.disconnected |       | on_client_disconnected | 存储客户端离线状态 |
| session.subscribed  | #     | on_message_fetch       | 获取离线消息       |
| session.subscribed  | #     | on_retain_lookup       | 获取 retain 消息     |
| message.publish     | #     | on_message_publish     | 存储发布消息       |
| message.publish     | #     | on_message_retain      | 存储 retain 消息     |
| message.publish     | #     | on_retain_delete       | 删除 retain 消息     |
| message.acked       | #     | on_message_acked       | 消息 ACK 处理        |

## SQL 语句参数说明

| hook                         | 可用参数                                          | 示例 (sql 语句中 ${name} 表示可获取的参数)                      |
| ---------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| client.connected             | clientid                                          | insert into conn(clientid) values(${clientid})               |
| client.disconnected clientid | insert into disconn(clientid) values(${clientid}) |                                                              |
| ses- sion.subscribed         | clientid, topic, qos                              | insert into sub(topic, qos) values(${topic}, ${qos})         |
| ses- sion.unsubscribed       | clientid, topic                                   | delete from sub where topic = ${topic}                       |
| message.publish              | msgid, topic, payload, qos, clientid              | insert into msg(msgid, topic) values(${msgid}, ${topic})     |
| message.acked                | msgid, topic, clientid                            | insert into ack(msgid, topic) values(${msgid}, ${topic})     |
| mes- sage.delivered          | msgid, topic, clientid                            | insert into delivered(msgid, topic) values(${msgid}, ${topic}) |



## SQL 语句配置 Action

PostgreSQL 存储支持用户采用 SQL 语句配置 Action，例如:

```properties
    ## 在客户端连接到 EMQ 服务器后，执行一条 sql 语句 (支持多条 sql 语句)
    backend.pgsql.hook.client.connected.3 = {"action": {"sql": ["insert into conn(clientid) values(${clientid})"]}, "pool": "pool1"}
```

## 创建 PostgreSQL 数据库

​```bash
createdb mqtt -E UTF8 -e
```


## 导入 PostgreSQL 库表结构

​```bash
\i etc/sql/emqx_backend_pgsql.sql
```

> 数据库名称可自定义


## PostgreSQL 设备在线状态表

*mqtt_client* 存储设备在线状态:
```bash
    CREATE TABLE mqtt_client(
      id SERIAL primary key,
      clientid character varying(100),
      state integer,
      node character varying(100),
      online_at timestamp,
      offline_at timestamp,
      created timestamp without time zone,
      UNIQUE (clientid)
    );
```

## 查询设备在线状态

```bash
select * from mqtt_client where clientid = ${clientid};
```

例如 ClientId 为 test 客户端上线::
```bash
    select * from mqtt_client where clientid = 'test';

     id | clientid | state | node             | online_at           | offline_at        | created
    ----+----------+-------+----------------+---------------------+---------------------+---------------------
      1 | test     | 1     | emqx@127.0.0.1 | 2016-11-15 09:40:40 | NULL                | 2016-12-24 09:40:22
    (1 rows)
```

例如 ClientId 为 test 客户端下线::
```bash
    select * from mqtt_client where clientid = 'test';

     id | clientid | state | nod            | online_at           | offline_at          | created
    ----+----------+-------+----------------+---------------------+---------------------+---------------------
      1 | test     | 0     | emqx@127.0.0.1 | 2016-11-15 09:40:40 | 2016-11-15 09:46:10 | 2016-12-24 09:40:22
    (1 rows)

```

## PostgreSQL 代理订阅表

*mqtt_sub* 存储订阅关系::
```bash
    CREATE TABLE mqtt_sub(
      id SERIAL primary key,
      clientid character varying(100),
      topic character varying(200),
      qos integer,
      created timestamp without time zone,
      UNIQUE (clientid, topic)
    );
```

例如 ClientId 为'test' 客户端订阅主题 test_topic1 test_topic2:

```bash
insert into mqtt_sub(clientid, topic, qos) values('test', 'test_topic1', 1);
insert into mqtt_sub(clientid, topic, qos) values('test', 'test_topic2', 2);
```

某个客户端订阅主题::

```bash
select * from mqtt_sub where clientid = ${clientid};
```

查询 ClientId 为 test 的客户端已订阅主题:
```bash
    select * from mqtt_sub where clientid = 'test';

     id | clientId     | topic       | qos  | created
    ----+--------------+-------------+------+---------------------
      1 | test         | test_topic1 |    1 | 2016-12-24 17:09:05
      2 | test         | test_topic2 |    2 | 2016-12-24 17:12:51
    (2 rows)
```

## PostgreSQL 消息存储表

*mqtt_msg* 存储 MQTT 消息:

```sql
CREATE TABLE mqtt_msg (
      id SERIAL primary key,
      msgid character varying(60),
      sender character varying(100),
      topic character varying(200),
      qos integer,
      retain integer,
      payload text,
      arrived timestamp without time zone
    );
```

查询某个客户端发布的消息:

```sql
select * from mqtt_msg where sender = ${clientid};
```

查询 ClientId 为 "test" 的客户端发布的消息:

```bash
    select * from mqtt_msg where sender = 'test';

     id | msgid                         | topic    | sender | node | qos | retain | payload | arrived
    ----+-------------------------------+----------+--------+------+-----+--------+---------+---------------------
     1  | 53F98F80F66017005000004A60003 | hello    | test   | NULL |   1 |      0 | hello   | 2016-12-24 17:25:12
     2  | 53F98F9FE42AD7005000004A60004 | world    | test   | NULL |   1 |      0 | world   | 2016-12-24 17:25:45
    (2 rows)
```

## PostgreSQL 保留消息表

*mqtt_retain* 存储 Retain 消息:

```bash
CREATE TABLE mqtt_retain(
      id SERIAL primary key,
      topic character varying(200),
      msgid character varying(60),
      sender character varying(100),
      qos integer,
      payload text,
      arrived timestamp without time zone,
      UNIQUE (topic)
    );
```

查询 retain 消息::

```bash
select * from mqtt_retain where topic = ${topic};
```

查询 topic 为 retain 的 retain 消息:
```bash
    select * from mqtt_retain where topic = 'retain';

     id | topic    | msgid                         | sender  | node | qos  | payload | arrived
    ----+----------+-------------------------------+---------+------+------+---------+---------------------
      1 | retain   | 53F33F7E4741E7007000004B70001 | test    | NULL |    1 | www     | 2016-12-24 16:55:18
    (1 rows)
```

PostgreSQL 消息确认表
---------------------

*mqtt_acked* 存储客户端消息确认:

```bash
CREATE TABLE mqtt_acked (
      id SERIAL primary key,
      clientid character varying(100),
      topic character varying(100),
      mid integer,
      created timestamp without time zone,
      UNIQUE (clientid, topic)
    );
```

## 启用 PostgreSQL 存储插件

​`./bin/emqx_ctl plugins load emqx_backend_pgsql`

