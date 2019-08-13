## 代理订阅

代理订阅可为在线设备订阅/取消订阅指定主题，可以通过配置文件、数据库或 REST API 灵活、批量地从数据层面设定 / 改变代理订阅列表。


### 通过 Subscription 模块配置代理订阅

打开 EMQ X 配置文件 `etc/emqx.conf`，找到 Subscription Module 相关配置项，可在设备连接后配置多个自动订阅项：

```bash
## Subscription Module

## 启用订阅模块
module.subscription = on

## Subscribe the Topics automatically when client connected.
module.subscription.1.topic = $client/%c
## Qos of the subscription: 0 | 1 | 2
module.subscription.1.qos = 0

module.subscription.2.topic = $user/%u/%c
module.subscription.2.qos = 0
```

> 支持占位符, %c 为设备连接 cliendId, %u 为设备连接 username，在设备连接成功时生效。




### 通过持久化模块配置代理订阅

详见各[持久化方案](./backend/whats_backend.md)中的代理订阅配置，该方案在设备成功连接时生效。



### 通过 REST API 进行订阅控制

可以使用 [EMQ X 管理监控 REST API](https://developer.emqx.io/docs/emq/v3/en/rest.html#create-a-subscription) 对在线设备进行订阅/取消订阅操作，该方案只需设备在线即可使用。


#### 创建订阅

HTTP 请求地址：
```
http://127.0.0.1:8080/api/v3/mqtt/subscribe
```

请求体：

```json
{
  "topic": "test_topic",
  "qos": 1,
  "client_id": "mqttjs_ab9069449e"
}
```

#### 取消订阅

HTTP 请求地址：
```
http://127.0.0.1:8080/api/v3/mqtt/unsubscribe
```

请求体：

```json
{
  "topic": "test_topic",
  "payload": "hello",
  "qos": 1,
  "retain": false,
  "client_id": "mqttjs_ab9069449e"
}
```