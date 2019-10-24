# EMQ X 到 Kafka 的桥接（企业版）
EMQ X 节点可以桥接到流式数据处理。Apache Kafka是一个快速、高可扩展、高吞吐的分布式日志系统，配合kafka Stream，在流式数据处理中非常常用。在这个章节我们以一个配置例来说明如何配置 EMQ X 到 Kafka 的桥接。

## 场景描述
假设我们有一台 EMQ X 服务器'emqx1'，和一台 Kafka 服务器，我们需要在'emqx1'上创建一条桥接把一些主题消息转发至 Kafka 服务器。  
在实际应用中，考虑到容错、扩展性和性能等方面，Kafka经常作为集群出现，但是在本例中Kafka的配置不是我们关注的重点，为了演示方便，我们只使用一台kafka服务器。为了使用Kafka服务，我们还需要Zookeeper服务器来管理Kafka的动态集群。  
关于Kafka的更多信息，请参阅官方[文档](https://kafka.apache.org/)。

**EMQ X**  

| 节点 | 节点名 | 监听端口 |
| :---: | :---: | :---: |
| emqx1 | emqx1@192.168.1.100 | 1883 |

**Kafka**   

| 地址 | 监听端口 |
| :---: | :---: |
| 192.168.1.101 | 9092 |

**Zookeeper**  

| 地址 | 监听端口 |
| :---: | :---: |
| 192.168.1.101 | 2181 |

## 配置 Zookeeper
因为仅使用一台本地zookeeper服务器，我们可以使用Kafka安装自带的zookeeper和它的默认配置。Kafka的安装目录下的`config/zookeeper.properties`为配置文件。打开配置文件，确认一下配置项：
```
dataDir=/tmp/zookeeper  # 数据文件保存路径
clientPort=2181         # zookeeper客户端监听端口
maxClientCnxns=0        # 客户端和zookeeper的最大连接数
```

启动 zookeeper：
```
$ bin/zookeeper-server-start.sh config/zookeeper.properties
```

## 配置Kafka
打开Kafka配置文件`config/server.properties`，确认以下各项：
```
broker.id=0                           # Kafka服务器id，集群范围内唯一
listeners=PLAINTEXT://:9092           # Kafka监听地址
log.dirs=/tmp/kafka-logs              # 日志文件保存路径
zookeeper.connect=localhost:2181      # zookeeper地址和端口
zookeeper.connection.timeout.ms=6000  # zookeeper连接超时
````
启动 Kafka：
```
$ bin/kafka-server-start.sh config/server.properties
```

## 创建topic
创建一个名为"message"的topic。该topic有一个分区和一个副本：
```
$ bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic message
```

创建一个名为"session"的topic。该topic有一个分区和一个副本：
```
$ bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic session
```

检查刚才创建的topic：
```
$ bin/kafka-topics.sh --list --zookeeper localhost:2181

message
session
```
## 配置 EMQ X 企业版的Kafka Bridge
在 EMQ X 企业版中，Kafka桥接以插件的方式实现。配置文件为`etc/plugins/emqx_bridge_kafka`。打开该文件并配置以下行：
```
# Kafka服务器的地址和端口。如果有多个kafka服务器，中间以逗号隔开（","）。
bridge.kafka.servers = 192.168.1.101:9092   

# 配置kafka桥接的hook
# filter 是EMQ X 上消息的过滤器，满足filter定于的消息会触发相应的动作。
# topic是定义在kafka上的主题，它决定了消息将被送往哪个主题。
bridge.kafka.hook.session.subscribed.1   = {"filter":"#", "topic":"session"}
bridge.kafka.hook.session.unsubscribed.1 = {"filter":"#", "topic":"session"}
bridge.kafka.hook.message.publish.1      = {"filter":"#", "topic":"message"}
bridge.kafka.hook.message.deliver.1    = {"filter":"#", "topic":"message"}
bridge.kafka.hook.message.acked.1        = {"filter":"#", "topic":"message"}
```

加载`emqx_bridge_kafka`插件：
```
$ bin/emqx_ctl plugins load emqx_bridge_kafka

Start apps: [emqx_bridge_kafka]
Plugin emqx_bridge_kafka loaded successfully.
```

## 测试
我们使用`mosquitto_pub` 和 `mosquitto_sub` 订阅消息，并在kafka服务器上使用自带的命令行consumer来观察收到的消息：

### 测试kafka的message主题
对 EMQ X 发布一条消息：
```
$ mosquitto_pub -h 192.168.1.100 -t sensor/1/temperature -m 37.5 -d -u user1 -P 123456

Client mosqpub|25082-Zeus- sending CONNECT
Client mosqpub|25082-Zeus- received CONNACK
Client mosqpub|25082-Zeus- sending PUBLISH (d0, q0, r0, m1, 'sensor/1/temperature', ... (4 bytes))
Client mosqpub|25082-Zeus- sending DISCONNECT
```

在kafka上使用命令行comsumer:
```
$ bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 test --from-beginning --topic message

{"client_id":"mosqpub|25093-Zeus-","username":"user1","topic":"sensor/1/temperature","payload":"MzcuNQ==","qos":0,"node":"emqx1@192.168.1.100","ts":1542113746}
```
### 测试kafka的session主题

在EMQ X 上订阅一条主题：

```
$ mosquitto_sub -h 192.168.1.100 -t control/1 -d -u user1 -P 123456

Client mosqsub|25095-Zeus- sending CONNECT
Client mosqsub|25095-Zeus- received CONNACK
Client mosqsub|25095-Zeus- sending SUBSCRIBE (Mid: 1, Topic: control/1, QoS: 0)
```
在kafka上使用命令行comsumer:

```
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 test --from-beginning --topic session

{"client_id":"mosqsub|25095-Zeus-","topic":"control/1","qos":0,"node":"emqx1@192.168.1.100","ts":1542113850}
```