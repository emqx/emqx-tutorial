# MySQL 数据存储

配置文件: emqx_backend_mysql.conf



## 配置 MySQL 服务器

支持配置多台 MySQL 服务器连接池:

```bash

## Mysql Server
backend.mysql.pool1.server = 127.0.0.1:3306

## Mysql Pool Size
backend.mysql.pool1.pool_size = 8

## Mysql Username
backend.mysql.pool1.user = root

## Mysql Password
backend.mysql.pool1.password = public

## Mysql Database
backend.mysql.pool1.database = mqtt

## Max number of fetch offline messages. Without count limit if infinity
## backend.mysql.max_returned_count = 500
## Time Range. Without time limit if infinity
## d - day
## h - hour
## m - minute
## s - second
## backend.mysql.time_range = 2h

```

## 配置 MySQL 存储规则

```bash
## Max number of fetch offline messages. Without count limit if infinity
## backend.mysql.max_returned_count = 500
## Time Range. Without time limit if infinity
## d - day
## h - hour
## m - minute
## s - second
## backend.mysql.time_range = 2h
## Client Connected Record
backend.mysql.hook.client.connected.1 = {"action": {"function": "on_client_connected"}, "pool": "pool1"}

## Subscribe Lookup Record
backend.mysql.hook.client.connected.2 = {"action": {"function": "on_subscribe_lookup"}, "pool": "pool1"}

## Client DisConnected Record

backend.mysql.hook.client.disconnected.1 = {"action": {"function": "on_client_disconnected"}, "pool": "pool1"}
## Lookup Unread Message QOS > 0

backend.mysql.hook.session.subscribed.1 = {"topic": "#", "action": {"function": "on_message_fetch"}, "pool": "pool1"}

## Lookup Retain Message
backend.mysql.hook.session.subscribed.2 = {"topic": "#", "action": {"function": "on_retain_lookup"}, "pool": "pool1"}

## Delete Ack
backend.mysql.hook.session.unsubscribed.1= {"topic": "#", "action": {"sql": ["delete from mqtt_acked where clientid = ${clientid} and topic = ${topic}"]}, "pool": "pool1"}

## Store Publish Message  QOS > 0
backend.mysql.hook.message.publish.1 = {"topic": "#", "action": {"function": "on_message_publish"}, "pool": "pool1"}

## Store Retain Message
backend.mysql.hook.message.publish.2 = {"topic": "#", "action": {"function": "on_message_retain"}, "pool": "pool1"}

## Delete Retain Message
backend.mysql.hook.message.publish.3 = {"topic": "#", "action": {"function": "on_retain_delete"}, "pool": "pool1"}

## Store Ack
backend.mysql.hook.message.acked.1 = {"topic": "#", "action": {"function": "on_message_acked"}, "pool": "pool1"}
```

## MySQL 存储规则说明

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



##  SQL 语句参数说明

| hook                         | 可用参数                                          | 示例 (sql 语句中 ${name} 表示可获取的参数)                      |
| ---------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| client.connected             | clientid                                          | insert into conn(clientid) values(${clientid})               |
| client.disconnected clientid | insert into disconn(clientid) values(${clientid}) |                                                              |
| session.subscribed           | clientid, topic, qos                              | insert into sub(topic, qos) values({topic}, ${qos})        |
| session.unsubscribed         | clientid, topic                                   | delete from sub where topic = ${topic}                       |
| message.publish              | msgid, topic, payload, qos, clientid              | insert into msg(msgid, topic) values({msgid}, ${topic})    |
| message.acked                | msgid, topic, clientid                            | insert into ack(msgid, topic) values({msgid}, ${topic})    |
| message.delivered            | msgid, topic, clientid                            | insert into delivered(msgid, topic) values({msgid}, ${topic}) |




## SQL 语句配置 Action


MySQL 存储支持用户采用 SQL 语句配置 Action:



    ## 在客户端连接到 EMQ 服务器后，执行一条 sql 语句 (支持多条 sql 语句)
    backend.mysql.hook.client.connected.3 = {"action": {"sql": ["insert into conn(clientid) values(${clientid})"]}, "pool": "pool1"}

## 创建 MySQL 数据库表


```sql
create database mqtt;
```

## 导入 MySQL 库表结构

```bash
mysql -u root -p mqtt < etc/sql/emqx_backend_mysql.sql
```
> 数据库名称可自定义


## MySQL 设备在线状态表


*mqtt_client* 存储设备在线状态:

```sql

    DROP TABLE IF EXISTS `mqtt_client`;
    CREATE TABLE `mqtt_client` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `clientid` varchar(64) DEFAULT NULL,
      `state` varchar(3) DEFAULT NULL,
      `node` varchar(100) DEFAULT NULL,
      `online_at` datetime DEFAULT NULL,
      `offline_at` datetime DEFAULT NULL,
      `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `mqtt_client_idx` (`clientid`),
      UNIQUE KEY `mqtt_client_key` (`clientid`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

查询设备在线状态:
``` sql
select * from mqtt_client where clientid = ${clientid};
```

例如 ClientId 为 test 客户端上线:

```sql
select * from mqtt_client where clientid = "test";
```

    +----+----------+-------+----------------+---------------------+---------------------+---------------------+
    | id | clientid | state | node           | online_at           | offline_at          | created             |
    +----+----------+-------+----------------+---------------------+---------------------+---------------------+
    |  1 | test     | 1     | emqx@127.0.0.1 | 2016-11-15 09:40:40 | NULL                | 2016-12-24 09:40:22 |
    +----+----------+-------+----------------+---------------------+---------------------+---------------------+
    1 rows in set (0.00 sec)

例如 ClientId 为 test 客户端下线:

```sql
select * from mqtt_client where clientid = "test";

    +----+----------+-------+----------------+---------------------+---------------------+---------------------+
    | id | clientid | state | node           | online_at           | offline_at          | created             |
    +----+----------+-------+----------------+---------------------+---------------------+---------------------+
    |  1 | test     | 0     | emqx@127.0.0.1 | 2016-11-15 09:40:40 | 2016-11-15 09:46:10 | 2016-12-24 09:40:22 |
    +----+----------+-------+----------------+---------------------+---------------------+---------------------+
    1 rows in set (0.00 sec)
```

## MySQL 主题订阅表

*mqtt_sub* 存储设备的主题订阅关系:

​```sql
    DROP TABLE IF EXISTS `mqtt_sub`;
    CREATE TABLE `mqtt_sub` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `clientid` varchar(64) DEFAULT NULL,
      `topic` varchar(255) DEFAULT NULL,
      `qos` int(3) DEFAULT NULL,
      `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `mqtt_sub_idx` (`clientid`,`topic`(255),`qos`),
      UNIQUE KEY `mqtt_sub_key` (`clientid`,`topic`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
例如 ClientId 为 "test" 客户端订阅主题 test_topic1 test_topic2:

​```sql
insert into mqtt_sub(clientid, topic, qos) values("test", "test_topic1", 1);

insert into mqtt_sub(clientid, topic, qos) values("test", "test_topic2", 2);
```

某个客户端订阅主题:
​```sql
select * from mqtt_sub where clientid = ${clientid};
```

查询 ClientId 为 "test" 的客户端已订阅主题:

​```sql
select * from mqtt_sub where clientid = "test";

    +----+--------------+-------------+------+---------------------+
    | id | clientId     | topic       | qos  | created             |
    +----+--------------+-------------+------+---------------------+
    |  1 | test         | test_topic1 |    1 | 2016-12-24 17:09:05 |
    |  2 | test         | test_topic2 |    2 | 2016-12-24 17:12:51 |
    +----+--------------+-------------+------+---------------------+
    2 rows in set (0.00 sec)
```

## MySQL 消息存储表

*mqtt_msg* 存储 MQTT 消息:

​```sql
    DROP TABLE IF EXISTS `mqtt_msg`;
    CREATE TABLE `mqtt_msg` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `msgid` varchar(100) DEFAULT NULL,
      `topic` varchar(1024) NOT NULL,
      `sender` varchar(1024) DEFAULT NULL,
      `node` varchar(60) DEFAULT NULL,
      `qos` int(11) NOT NULL DEFAULT '0',
      `retain` tinyint(2) DEFAULT NULL,
      `payload` blob,
      `arrived` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

查询某个客户端发布的消息:

​```sql
select * from mqtt_msg where sender = ${clientid};
```
查询 ClientId 为 "test" 的客户端发布的消息:

​```sql

    select * from mqtt_msg where sender = "test";

    +----+-------------------------------+----------+--------+------+-----+--------+---------+---------------------+
    | id | msgid                         | topic    | sender | node | qos | retain | payload | arrived             |
    +----+-------------------------------+----------+--------+------+-----+--------+---------+---------------------+
    | 1  | 53F98F80F66017005000004A60003 | hello    | test   | NULL |   1 |      0 | hello   | 2016-12-24 17:25:12 |
    | 2  | 53F98F9FE42AD7005000004A60004 | world    | test   | NULL |   1 |      0 | world   | 2016-12-24 17:25:45 |
    +----+-------------------------------+----------+--------+------+-----+--------+---------+---------------------+
    2 rows in set (0.00 sec)
```

## MySQL 保留消息表

mqtt_retain 存储 Retain 消息:

​```sql

    DROP TABLE IF EXISTS `mqtt_retain`;
    CREATE TABLE `mqtt_retain` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `topic` varchar(200) DEFAULT NULL,
      `msgid` varchar(60) DEFAULT NULL,
      `sender` varchar(100) DEFAULT NULL,
      `node` varchar(100) DEFAULT NULL,
      `qos` int(2) DEFAULT NULL,
      `payload` blob,
      `arrived` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `mqtt_retain_key` (`topic`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

查询 retain 消息:

​```sql
select * from mqtt_retain where topic = ${topic};
```

查询 topic 为 "retain" 的 retain 消息:

​```sql
    select * from mqtt_retain where topic = "retain";

    +----+----------+-------------------------------+---------+------+------+---------+---------------------+
    | id | topic    | msgid                         | sender  | node | qos  | payload | arrived             |
    +----+----------+-------------------------------+---------+------+------+---------+---------------------+
    |  1 | retain   | 53F33F7E4741E7007000004B70001 | test    | NULL |    1 | www     | 2016-12-24 16:55:18 |
    +----+----------+-------------------------------+---------+------+------+---------+---------------------+
    1 rows in set (0.00 sec)
```

## MySQL 消息确认表

*mqtt_acked* 存储客户端消息确认:

```bash
DROP TABLE IF EXISTS `mqtt_acked`;
    CREATE TABLE `mqtt_acked` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `clientid` varchar(200) DEFAULT NULL,
      `topic` varchar(200) DEFAULT NULL,
      `mid` int(200) DEFAULT NULL,
      `created` timestamp NULL DEFAULT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `mqtt_acked_key` (`clientid`,`topic`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```



## 启用 MySQL 数据存储

```bash
./bin/emqx_ctl plugins load emqx_backend_mysql
```
