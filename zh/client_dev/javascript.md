# 使用 JavaScript 开发 MQTT 客户端

作为标准的 MQTT 协议的一部分，EMQ X 支持通过 WebSocket 端口与客户端进行通信。WebSocket 是一种在单个 TCP 连接上进行全双工通讯的协议。WebSocket 通信协议于 2011 年被 IETF 定为标准 RFC 6455，并由 RFC 7936 补充规范。WebSocket API 也被 W3C 定为标准。WebSocket 使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在 WebSocket API 中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

## 客户端库比较

**Paho.mqtt.js**

[Paho](https://www.eclipse.org/paho/) 是 Eclipse 的一个 MQTT 客户端项目，Paho JavaScript Client 是其基于浏览器 JavaScript 运行环境的库，它使用 WebSockets 连接到 MQTT 服务器。相较于 MQTT.js 来说，其功能较少，不推荐使用。

**MQTT.js**

[MQTT.js](https://www.npmjs.com/package/mqtt) 可用于 Node.js 环境和浏览器环境。在 Node.js 上可以通过全局安装使用命令行连接，同时还支持 MQTT ，MQTT TLS 证书连接；值得一提的是 MQTT.js 对微信小程序有较好的支持。


## 安装 MQTT.js

如果在您的系统中已经有了 Node.js 环境，可使用 NPM 安装：

npm 安装使用

```bash
npm i mqtt

import mqtt from 'mqtt'
```


或使用 CDN 引用

```html
<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>

<script>
    // 将在全局初始化一个 mqtt 变量
    console.log(mqtt)
</script>
```

## 实现一个简单的客户端

mqtt.js 在浏览器环境下支持 WebSocket MQTT 连接，Node.js 环境下支持 TCP(SSL/TLS) MQTT 连接，请根据您的使用场景选择对应的连接方式：
 - 使用 connect() 函数连接并返回一个 client 实例
 - client 有多个事件，在 client 事件中使用回调函数处理相关逻辑：
   - connect：连接成功事件
   - reconnect：连接错误、异常断开后重连的事件
   - error：连接错误、终止连接事件
   - message：收到订阅消息事件
 - client 有多个基本函数  
   - 使用 subscribe() 函数订阅主题
   - 使用 publish() 函数发布消息
   - 使用 end() 函数连断开和 broker 的连接

_这里我们只对 MQTT.js 客户端做简单的介绍，关于该客户端的更详尽的说明请参阅 [MQTT.js 文档](https://www.npmjs.com/package/mqtt)_


## 初始化和建立连接

EMQ X 使用 8083 端口用于 WebSocket 普通连接，8084 用于 SSL 上的 WebSocket 连接。

本地连接 URL 为: `ws://localhost:8083/mqtt`

上述示范的连接地址可以拆分为： `ws:` // `localhost` : `8083` `/mqtt` 

即 ` 协议 ` // ` 域名 ` : ` 端口 ` / ` 路径 `

建立连接代码如下:

```js
// <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
// const mqtt = require('mqtt')
import mqtt from 'mqtt'

// 连接选项
const options = {
      // 超时时间
      connectTimeout: 4000,
      
      // 认证信息
      clientId: 'emqx',
      // username: 'emqx',
      // password: 'emqx',
      
      // 心跳时间
      keepalive: 60,
      clean: true,
}

// WebSocket 连接字符串
const WebSocket_URL = 'ws://localhost:8083/mqtt'

// TCP/TLS 连接字符串，仅限 Node.js 环境
const TCP_URL = 'mqtt://localhost:1883'
const TCP_TLS_URL = 'mqtts://localhost:8883'

const client = mqtt.connect(WebSocket_URL, options)

client.on('connect', () => {
    console.log('连接成功')
})

client.on('reconnect', (error) => {
    console.log('正在重连:', error)
})

client.on('error', (error) => {
    console.log('连接失败:', error)
})

```

指定地址的时候请注意以下的内容：

- 连接地址没有指明协议：WebSocket 使用 `ws`(非加密)、`wss`(SSL 加密) 作为协议标识。MQTT.js 客户端支持多种协议，连接地址需指明协议类型；
- 连接地址没有指明端口：MQTT 协议并未对 WebSocket 接入端口做出规定，EMQ X 默认使用 `8083` `8084` 分别作为非加密连接、加密连接端口。而 WebSocket 协议默认端口同 HTTP 保持一致 (80/443)，不填写端口则表明使用 WebSocket 的默认端口连接；而使用标准 MQTT 连接时则无需指定端口，如 MQTT.js 在 Node.js 端可以使用 `mqtt://localhost` 连接至标准 MQTT 8083 端口，当连接地址是 `mqtts://localhost` 则连接到 8884 端口；
- 错误的路径：EMQ X 默认使用 `/mqtt` 作为 WebSocket 连接路径，连接时需指明；
- 协议与端口不符：使用了 `wss` 连接却连接到 `8083` 端口；
- 在 HTTPS 站点下使用非加密的 WebSocket 连接： Google Chrome 等浏览器在 HTTPS 站点下会自动禁止使用非加密的 `ws` 协议发起连接请求；
- 证书与连接地址不符：服务器端配置了错误的 SSL 证书。


## 发布消息

使用 `publish()` 函数发布消息到主题，发布的主题必须符合 MQTT 发布主题规则，否则客户端将断开连接。发布之前无需订阅该主题，但要确保客户端已成功连接：


```js
// 监听接收消息事件
client.on('message', (topic, message) => {
    console.log('收到来自', topic, '的消息', message.toString())
})

// 判断是否已成功连接
if (!client.connected) {
    console.log('客户端未连接')
    return
}

// publich(topic, payload, options/callback)
client.publish('hello', 'hello EMQ X', (error) => {
    console.log(error || '消息发布成功')
})
```

## 订阅消息

客户端连接成功之后才能订阅主题，订阅的主题必须符合 MQTT 订阅主题规则；

由于 JavaScript 异步非阻塞特性，只有在 connect 事件后才能确保客户端已成功连接，可通过 `client.connected` 属性判断是否连接成功：

** 错误示例 **

```js
import mqtt from 'mqtt'

client = mqtt.connect('ws://localhost:8083/mqtt')
client.on('connect', handleConnect)
client.subscribe('hello')
client.publish('hello', 'Hello EMQ X')
```

** 正确示例 **

```js
client.on('connect', () => {
    console.log('成功连接服务器')
    // 订阅一个主题
    client.subscribe('hello', { qos: 1 }, (error) => {
        if (!error) {
            cosnole.log('订阅成功')
            client.publish('hello', 'Hello EMQ X', { qos: 1, rein: false }, (error) => {
                console.log(error || '发布成功')
            })
        }
    })
    
    // 订阅多个主题
    client.subscribe(
        ['hello', 'one/two/three/#', '#'], 
        { qos: 1 },  
        (err) => {
          console.log(err || '订阅成功')
        },
    )
    
    // 订阅不同 qos 的不同主题
    client.subscribe(
        [
            { hello: 1 }, 
            { 'one/two/three': 2 }, 
            { '#': 0 }
        ], 
        (err) => {
          console.log(err || '订阅成功')
        },
    )
})

```

## 取消订阅

```js
client.unsubscribe(
    // topic, topic Array, topic Array-Onject
    'hello',
    (err) => {
      console.log(err || '取消订阅成功')
    },
)
```



## 完整示例

```js
// 导入 MQTT.js
import mqtt from 'mqtt'
// <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
// const mqtt = require('mqtt')

// WebSocket 连接字符串
const WebSocket_URL = 'ws://localhost:8083/mqtt'

// TCP/TLS 连接字符串，仅限 Node.js 环境
const TCP_URL = 'mqtt://localhost:1883'
const TCP_TLS_URL = 'mqtts://localhost:8883'


// 连接选项
const options = {
      // 超时时间
      connectTimeout: 4000,
      
      // 认证信息
      clientId: 'emqx',
      // username: 'emqx',
      // password: 'emqx',
      
      // 心跳时间
      keepalive: 60,
      clean: true,
}

const client = mqtt.connect(TCP_URL, options)

// 连接成功后初始化订阅
client.on('connect', () => {
  console.log('Connected to', TCP_URL)
  
  // 订阅主题
  client.subscribe('hello', (err) => {
    console.log(err || '订阅成功')
  })
  
  // 发布消息
  client.publish('hello', 'Hello EMQ X', (err) => {
    console.log(err || '发布成功')
  })
  
})

// 为 message 时间添加处理函数
client.on('message', (topic, message) => {
  console.log('收到来自', topic, '的消息:', message.toString())
  
  // 断开连接
  client.end()
})

```

运行结果：
```bash
Connected to mqtt://localhost:1883
发布成功
订阅成功
收到来自 hello 的消息: Hello EMQ X
```
