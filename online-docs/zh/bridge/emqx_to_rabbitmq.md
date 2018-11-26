# EMQ X 到 RabbitMQ 的桥接
EMQ X 节点可以桥接到其他类型的 MQTT 消息中间件，实现跨平台的消息订阅和发送。在这个章节我们以一个配置例来说明如何配置 EMQ X 到 RabbitMQ 的桥接。

RabbitMQ是一个 AMQP 协议消息中间件，它通过插件方式的协议适配来实现对其他协议的支持，MQTT 协议的支持也是通过这种方式实现的。由于协议间的差异，一些 MQTT 特性并不能够100%的平移至 AMQP，由此，在消息处理行为上也会有些差异，比如不支持 QoS2 的消息订阅，QoS2 的消息发布会被降级至 QoS1 等。  
在项目可行性验证和实际应用时应该知道这些差异，并对其影响有所了解，保证设计意图可以正确实现。

## 场景描述
假设我们有一台 EMQ X 服务器'emqx1'，和一台 RabbitMQ 服务器，我们需要在'emqx1'上创建一条桥接把所有"传感器(sensor)"主题消息转发至 RabbitMQ 服务器，并订阅所有"控制(control)"主题。

**EMQ X**  

| 节点 | 节点名 | 监听端口 |
| :---: | :---: | :---: |
| emqx1 | emqx1@192.168.1.100 | 1883 |

**RabbitMQ**

| 地址 | 监听端口 |
| :---: | :---: |
| 192.168.1.101 | 1883 |

## 配置 RabbitMQ 服务器

RabbitMQ是AMQP协议消息中间件，它通过插件来实现对其他协议的支持。在安装 RabbitMQ 以后，我们需要启动 MQTT 插件来支持 MQTT 协议：

```
$ rabbitmq-plugins enable rabbitmq_mqtt

The following plugins have been configured:
  rabbitmq_mqtt
Applying plugin configuration to rabbit@ubuntu18...
The following plugins have been enabled:
  rabbitmq_mqtt
```  
建立用户：
```
$ rabbitmqctl add_user user passwd

Adding user "user" ...
```
设置用户资源权限。下例中的设置中，为了简化演示，我们简单地对 'user' 用户开放了所有主题的读写权限（即 MQTT 协议中的订阅和发布权限），在实际应用中并不应该这么粗放地配置权限：
```
$ rabbitmqctl set_permissions user ".*" ".*" ".*"

Setting permissions for user "user" in vhost "/" ...
```

在应用以上配置之后，应该可以完成本节中的桥接示例了。更详细的RabbitMQ配置超出了本文的范围，如有疑问请参考RabbitMQ的[官方文档](https://www.rabbitmq.com)。

## 配置 EMQ X 桥接
为了使 EMQ X 节点可以桥接其他节点，我们需要在配置文件`emqx.conf`做相应的配置。

在emqx1上，打开`emqx.conf`, 找到`Bridges`部分，在其中添加一个新的桥接配置。
EMQ X 的桥接配置项的格式为`bridge.bridge_name.directive1[.sub_directives]`，是一个以`.`分隔的字符串。桥接配置项总是以`bridge`开头，然后是自定义的桥接名，然后是配置项内容，如果配置项内容有子配置项，可以在后面继续以这种方式添加。

### 添加一个新桥接配置

通过以下配置我们可以添加一个新的 EMQ X 桥接

```
##--------------------------------------------------------------------
## Bridge example
##--------------------------------------------------------------------
## Start type of the bridge.
##
## Value: enum
## manual
## auto
bridge.example.start_type = manual

## Bridge reconnect time.
##
## Value: Duration
## Default: 30 seconds
bridge.example.reconnect_interval = 30s

## Bridge address: node name for local bridge, host:port for remote.
##
## Value: String
## Example: emqx2@192.168.1.101, or  192.168.1.101:1883
bridge.example.address = 192.168.1.101:1883
```

在上面的配置指令中，我们定义了桥接的名字，启动方式，重连间隔，以及远端节点的地址。一个名字为`example`的桥接，这个桥接以手动的方式启动，在桥接断线时，以30秒的间隔重新连接远端的节点。
`bridge.example.address = 192.168.1.101:1883` 为桥接指定了远端Broker的地址和监听端口。

### 配置桥接 MQTT 协议版本
配置 MQTT 协议版本的配置指令为：
```
bridge.example.proto_ver = mqttv4
```
在这里配置值有三个可选项，为`mqttv3`, `mqttv4`和`mqttv5`，分别对应 MQTT 协议的 `3.1`, `3.1.1`和`5.0`版本。配置例以MQTT 3.1.1协议版本完成桥接节点间的通讯。

### 配置桥接时使用的客户端
在连接远端节点时，EMQ X 需要向对方提供自己的身份识别，通过对端的身份认证和鉴权。根据具体情况，一般需要配置`clientid`, `username`和`password`等信息。
```
bridge.example.client_id = bridge_example
bridge.example.username = user
bridge.example.password = passwd
```

### 配置桥接的连接属性
在配置中指定连接相关的属性。如clean_start，keepalive， mountpoint等。
```
bridge.example.clean_start = false
bridge.example.keepalive = 60s
bridge.example.mountpoint = bridge/example/${node}/
```

在桥接断线重连时，我们一般会需要重用既有会话的特性来保证断线时缓存的消息不被丢弃，所以`clean_start`一般可以设置为`false`。`keepalive`则可以按照网络情况和应用的具体需求设置。`mountpoint`是 topic 的安装点，由桥接转发的消息的主题将被加上`mountpoint`中指定的前缀然后发送给各个订阅该主题的节点。

### 配置桥接的转发和订阅
桥接以转发消息到远端节点，从远端节点订阅主题并发送到本地订阅的客户端上。所有我们需要指定用于转发和订阅的主题。

**设置转发主题**
```
bridge.example.forwards = sensor/#
```
通过`forwards`配置项，可以为一个桥接设置一个或多个转发主题。如果有多个主题需要转发的话，主题之间用逗号(`,`)分隔。在主题中可以使用通配符。
转发的消息以`qos = 1`的级别发送给远端节点。

**设置订阅主题**
可以为一个桥接设置多个订阅，每个订阅都有自己独立的配置项。
```
bridge.example.subscription.1.topic = control/#
bridge.example.subscription.1.qos = 1
```
上面的配置例为`example`桥接以`qos = 1`的服务级别订阅了`control/#`主题。主题中可以使用通配符。
如果需要订阅多个主题，可以继续添加`bridge.example.subscription.2.topic`和`bridge.example.subscription.2.qos` 配置项。

### 配置桥接的消息队列

可以为桥接配置消息队列来缓存待转发的消息。

```
bridge.example.mqueue_type = memory  ##memory | disk

bridge.example.max_pending_messages = 10000
```
以上配置例为`example`桥接设置了一个队列长度为10000的内存队列。EMQ X 也可以以磁盘文件的方式处理桥接的缓存消息队列。

### 配置安全连接
EMQ X 支持TLS/SSL方式的桥接以提高传输安全性。如果不需要开启这个特性，则不用配置下面的项。
```
bridge.example.cacertfile = cacert.pem
bridge.example.certfile = cert.pem
bridge.example.keyfile = key.pem
bridge.example.ciphers = ECDHE-ECDSA-AES256-GCM-SHA384,ECDHE-RSA-AES256-GCM-SHA384
bridge.example.tls_versions = tlsv1.2,tlsv1.1,tlsv1
```
上面的配置例为example桥接指定了远程节点所持有的证书的CA证书，本地节点的证书文件和私钥，支持的安全套件选项和允许使用的TLS版本。这个配置在TLS开启了双向的证书认证，如果不需要客户端证书认证，则无需配置`bridge.example.certfile`和`bridge.example.keyfile`这两项。

## 管理桥接
EMQ X 的`emqx_ctl`命令行工具提供了桥接管理的功能，它可以显示桥接状态，启停桥接，显示/增加/删除转发项，显示/增加/删除订阅项。

在完成上述配置后，我们执行以下命令来查看桥接状态, 启动桥接和转发/订阅的配置：
```
$ ./emqx_ctl bridges list
name: example     status: Stopped

$ ./emqx_ctl bridges start example
start bridge successfully.

$ ./emqx_ctl bridges list
name: example     status: Running

$ ./emqx_ctl bridges forwards example
topic:   sensor/#

$ ./emqx_ctl bridges subscriptions example
topic: control/#, qos: 1
```

## 测试桥接
我们使用 `mosquitto_pub` 和 `mosquitto_sub` 工具来测试上面的配置是否生效。

在 RqbbitMQ 上订阅'sensor/#'主题：
```
$ mosquitto_sub -t sensor/# -p 1883 -d
```
在'emqx1'上对主题'sensor/1/temperature'发布消息：
```
$ mosquitto_pub -t sensor/1/temperature -m "37.5" -d
```
发布之后，在 RqbbitMQ 上应能正常收到消息。
```
$ mosquitto_sub -t "bridge/example/#" -p 1883 -d -h 192.168.1.101
Client mosqsub|11612-Zeus- sending CONNECT
Client mosqsub|11612-Zeus- received CONNACK
Client mosqsub|11612-Zeus- sending SUBSCRIBE (Mid: 1, Topic: bridge/example/#, QoS: 0)
Client mosqsub|11612-Zeus- received SUBACK
Subscribed (mid: 1): 0
Client mosqsub|11612-Zeus- received PUBLISH (d0, q0, r0, m0, 'bridge/example/emqx1@192.168.1.100/sensor/1/temperature', ... (4 bytes))
37.5
```

在 'emqx1' 上订阅'control/#'主题：
```
$ mosquitto_sub -t control/# -p 1883 -d
```
在 RqbbitMQ 上对主题'control/device1/restart'发布消息：
```
mosquitto_pub -t control/device1 -m "list_all" -d -h 192.168.1.101
```
发布之后，在'emqx1'上应能正常收到消息。
```
$ mosquitto_sub -t "control/#" -p 1883 -d -h 192.168.1.100
Client mosqsub|11625-Zeus- sending CONNECT
Client mosqsub|11625-Zeus- received CONNACK
Client mosqsub|11625-Zeus- sending SUBSCRIBE (Mid: 1, Topic: control/#, QoS: 0)
Client mosqsub|11625-Zeus- received SUBACK
Subscribed (mid: 1): 0
Client mosqsub|11625-Zeus- received PUBLISH (d0, q0, r0, m0, 'control/device1', ... (8 bytes))
list_all
```
