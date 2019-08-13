# 在 VerneMQ 上建立到 EMQ X 的桥接
EMQ X 节点可以被其他类型的 MQTT 消息中间件桥接，实现跨平台的消息订阅和发送。在这个章节我们以一个配置例来说明如何配置 VerneMQ 到 EMQ X 的桥接。

## 场景描述
假设我们有一台 EMQ X 服务器'emqx1'，和一台 VerneMQ 服务器，我们需要在 VerneMQ 上创建一条桥接，把所有"传感器(sensor)"主题消息转发至 'emqx1'  服务器，并从 EMQ X 订阅所有"控制(control)"主题。

**EMQ X**  

| 节点 | 节点名 | 监听端口 |
| :---: | :---: | :---: |
| emqx1 | emqx1@192.168.1.100 | 1883 |

**VerneMQ**

| 地址 | 监听端口 |
| :---: | :---: |
| 192.168.1.101 | 1883 |

## 配置 VerneMQ 服务器
配置 VerneMQ 的桥接需要在安装后修改 `vernemq.conf` 文件。对于每一个桥接，需要配置的基本内容有：
- 远端的 EMQ X 服务器的地址和端口；
- MQTT 协议参数，如协议版本，keepalive, clean_session等（如不配置则使用默认值）；
- EMQ X 需要的客户端登录信息；
- 需要桥接的消息的主题；
- 配置桥接主题映射（默认无映射）。

### 一个简单的配置例

**启用VerneMQ的桥接插件**
VerneMQ的桥接以插件方式实现，在启用该功能时需要先在配置中启用桥接插件。打开 `vernemq.conf` 文件，修改 `plugins.vmq_bridge`配置的值为`on` ：
```
plugins.vmq_bridge = on
```

**配置桥接远端节点的地址和端口**
```
vmq_bridge.tcp.br0 = 192.168.1.100:1883
```

**配置远端节点用户名**  
```
vmq_bridge.tcp.br0.username = user
```

**配置远端节点密码**
```
vmq_bridge.tcp.br0.password = passwd
```

**指定需要桥接的主题**  
桥接主题的配置格式为 `vmq_bridge.tcp.br0.topic.1 = 主题模式 方向 QoS 本地前缀 远端前缀`，它定义了桥接转发和接收的规则。其中：
- 主题模式指定了需要桥接的主题，支持通配符。需要注意的是，在VerneMQ的配置中"#"通配符会被作为注释处理，需要用"\*"代替;
- 方向可以是in, out 或者 both
- QoS 为桥接的QoS级别， 默认QoS级别为"0"
- 本地和远程前缀用于主题映射，在转发和接收的消息主题上加上相应前缀，以便应用可以识别消息来源。

以下配置例添加了两条桥接规则：
```
vmq_bridge.tcp.br0.topic.1 = sensor/* out 1
vmq_bridge.tcp.br0.topic.2 = control/* in 1
```

在配置完成后，需要重新启动VerneMQ使桥接配置生效。

## 配置 EMQ X 服务器
在安装 EMQ X 服务器后，为了使 VerneMQ 桥接可以接入，需要配置相应的用户认证和鉴权信息，具体请参阅 EMQ X 的[认证](../security/auth.md)和[鉴权](../security/acl.md)文档。或者在实验阶段为了简化测试，可以使用允许匿名登录和acl_nomatch跳过认证和鉴权。

## 测试配置
我们使用 `mosquitto_sub` 和 `mosquitto_pub`工具来测试桥接的配置是否成功。
### 测试桥接的 out 方向
在'emqx1'上订阅订阅'sensor/#'主题：
```
$ mosquitto_sub -t "sensor/#" -p 1883 -d -q 1 -h 192.168.1.100

Client mosqsub|19324-Zeus- sending CONNECT
Client mosqsub|19324-Zeus- received CONNACK
Client mosqsub|19324-Zeus- sending SUBSCRIBE (Mid: 1, Topic: sensor/#, QoS: 1)
Client mosqsub|19324-Zeus- received SUBACK
Subscribed (mid: 1): 1
```
在VerneMQ上发布消息：
```
mosquitto_pub -t "sensor/1/temperature" -m "37.5" -d -h 192.168.1.101 -q 1 -u user -P passwd
Client mosqpub|19325-Zeus- sending CONNECT
Client mosqpub|19325-Zeus- received CONNACK
Client mosqpub|19325-Zeus- sending PUBLISH (d0, q1, r0, m1, 'sensor/1/temperature', ... (4 bytes))
Client mosqpub|19325-Zeus- received PUBACK (Mid: 1)
Client mosqpub|19325-Zeus- sending DISCONNECT
```
在'emqx1'上应能收到该消息：
```
Client mosqsub|19324-Zeus- received PUBLISH (d0, q1, r0, m1, 'sensor/1/temperature', ... (4 bytes))
Client mosqsub|19324-Zeus- sending PUBACK (Mid: 1)
37.5
```

### 测试桥接的 in 方向
在VerneMQ上订阅 'control/#'主题：
```
$ mosquitto_sub -t "control/#" -p 1883 -d -q 1 -h 192.168.1.101 -u user -P passwd
Client mosqsub|19338-Zeus- sending CONNECT
Client mosqsub|19338-Zeus- received CONNACK
Client mosqsub|19338-Zeus- sending SUBSCRIBE (Mid: 1, Topic: control/#, QoS: 1)
Client mosqsub|19338-Zeus- received SUBACK
Subscribed (mid: 1): 1
```

在'emqx1'上发布消息：
```
$ mosquitto_pub -t "control/1" -m "list_all" -d -h 192.168.1.100 -q 1
Client mosqpub|19343-Zeus- sending CONNECT
Client mosqpub|19343-Zeus- received CONNACK
Client mosqpub|19343-Zeus- sending PUBLISH (d0, q1, r0, m1, 'control/1', ... (8 bytes))
Client mosqpub|19343-Zeus- received PUBACK (Mid: 1)
Client mosqpub|19343-Zeus- sending DISCONNECT
```

在VerneMQ上应能收到该消息：
```
Client mosqsub|19338-Zeus- received PUBLISH (d0, q1, r0, m2, 'control/1', ... (8 bytes))
Client mosqsub|19338-Zeus- sending PUBACK (Mid: 2)
list_all
```
