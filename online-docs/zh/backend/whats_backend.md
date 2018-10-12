# 数据持久化概念

EMQ X 支持 MQTT 消息直接存储 Redis、MySQL、PostgreSQL、MongoDB、Cassandra 数据库。



## 持久化存储插件对照表

EMQ X 使用插件进行数据持久化，请根据资源类别配置持久化插件：


| 存储插件           | 配置文件                | 说明                |
| ------------------ | ----------------------- | ------------------- |
| emqx_backend_redis | emqx_backend_redis.conf | Redis 消息存储      |
| emqx_backend_mysql | emqx_backend_mysql.conf | MySQL 消息存储      |
| emqx_backend_pgsql | emqx_backend_pgsql.conf | PostgreSQL 消息存储 |
| emqx_backend_mongo | emqx_backend_mongo.conf | MongoDB 消息存储    |
| emqx_backend_cassa | emqx_backend_cassa.conf | Cassandra 消息存储  |



## 消息类型对照表

EMQ X 特定事件响应时相关插件可获得对应的参数，通过配置操作语句可以进行状态更改、数据变更等持久化操作：


| hook                | topic | action                 | 可用操作           |
| ------------------- | ----- | ---------------------- | ------------------ |
| client.connected    |       | on_client_connected    | 存储客户端在线状态 |
| client.connected    |       | on_subscribe_lookup    | 订阅主题           |
| client.disconnected |       | on_client_disconnected | 存储客户端离线状态 |
| session.subscribed  | #     | on_message_fetch       | 获取离线消息       |
| session.subscribed  | #     | on_retain_lookup       | 获取 retain消息    |
| message.publish     | #     | on_message_publish     | 存储发布消息       |
| message.publish     | #     | on_message_retain      | 存储 retain 消息   |
| message.publish     | #     | on_retain_delete       | 删除 retain 消息   |
| message.acked       | #     | on_message_acked       | 消息ACK处理        |