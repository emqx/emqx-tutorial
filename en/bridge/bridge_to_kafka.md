# Bridge EMQ X to Kafka (EMQ X Enterprise Edition)

EMQ X can bridge data to streaming data processing. Apache Kafka is a high speed, high extensible and high throughput distributed log system.  combined with kafka Stream it is widely used in streaming data processing. In this section, we will demonstrate hao to bridge EMQ X to Kafka.

## Case Description
Assuming that we have one EMQ X broker, the 'emqx1', and one Kafka server. We will create a bridge from EMQ X to Kafka.
In the practice, Kafka is usually deployed in cluster. Here to simplify the demonstration, we use a single Kafka server (one-server cluster). To use the Kafka service, we also need zookeeper to manage the kafka cluster.  

For more information about Kafka, please refer to the [Kafka Document](https://kafka.apache.org/).

**EMQ X**  

| Node | Node Name | Listening Port |
| :---: | :---: | :---: |
| emqx1 | emqx1@192.168.1.100 | 1883 |

**Kafka**   

| Address | Listening Port |
| :---: | :---: |
| 192.168.1.101 | 9092 |

**Zookeeper**  

| Address | Listening Port |
| :---: | :---: |
| 192.168.1.101 | 2181 |

## Configure the Zookeeper
In this demonstration we just use zookeeper to manage one Kakfa server, we can use the Zookeeper comes with the Kafka installation and use its default setup.  
Open the `config/zookeeper.properties` file under Kafka isntallation folder and check the following configuration:
```
dataDir=/tmp/zookeeper  # Data file directory
clientPort=2181         # zookeeper listening port
maxClientCnxns=0        # Max connection between client and zookeeper, 0 for unlimited
```

Start zookeeper:
```
$ bin/zookeeper-server-start.sh config/zookeeper.properties
```

## Configure Kafka
Open the `config/server.properties` file and check the following configuration:
```
broker.id=0                           # Kafka server id, unique in cluster
listeners=PLAINTEXT://:9092           # Kafka listening port
log.dirs=/tmp/kafka-logs              # log file directory
zookeeper.connect=localhost:2181      # zookeeper address and port
zookeeper.connection.timeout.ms=6000  # zookeeper time out
````
Start Kafka:
```
$ bin/kafka-server-start.sh config/server.properties
```

## Creat a Topic on Kafka
Create a topic "message", this topic has one partition and one replication:
```
$ bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic message
```

Create a topic "session", this topic has one partition and one replication:
```
$ bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic session
```

Check the topics:
```
$ bin/kafka-topics.sh --list --zookeeper localhost:2181

message
session
```
## Configure the Kafka Bridge for EMQ X Enterprise Edition
In the EMQ X Enterprise, the Kafka bridge is implemented as a plugin. The config file is located at `etc/plugins/emqx_bridge_kafka`. Open this file and modify the following directives if necessary:
```
# Kafka server and port. If there are multiple kafka server, seperate them with ",".
bridge.kafka.servers = 192.168.1.101:9092   

# the Hook for kafka bridge
# 'filter' is for message on EQM X, it triggers the hook action.
# 'topic' is the topic defined in Kafka, it decide where the message shall be sent to.
bridge.kafka.hook.session.subscribed.1   = {"filter":"#", "topic":"session"}
bridge.kafka.hook.session.unsubscribed.1 = {"filter":"#", "topic":"session"}
bridge.kafka.hook.message.publish.1      = {"filter":"#", "topic":"message"}
bridge.kafka.hook.message.deliver.1    = {"filter":"#", "topic":"message"}
bridge.kafka.hook.message.acked.1        = {"filter":"#", "topic":"message"}
```

Load `emqx_bridge_kafka` plugin:
```
$ bin/emqx_ctl plugins load emqx_bridge_kafka

Start apps: [emqx_bridge_kafka]
Plugin emqx_bridge_kafka loaded successfully.
```

## Test
We use `mosquitto_pub` and `mosquitto_sub` to publish and subscribe，and use the `consumer` CLI tool of Kafka to observe the result:

### Test the 'message' Topic on kafka
Publish a message on EMQ X:
```
$ mosquitto_pub -h 192.168.1.100 -t sensor/1/temperature -m 37.5 -d -u user1 -P 123456

Client mosqpub|25082-Zeus- sending CONNECT
Client mosqpub|25082-Zeus- received CONNACK
Client mosqpub|25082-Zeus- sending PUBLISH (d0, q0, r0, m1, 'sensor/1/temperature', ... (4 bytes))
Client mosqpub|25082-Zeus- sending DISCONNECT
```

 On the kafka server run `consumer`:
```
$ bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 test --from-beginning --topic message

{"client_id":"mosqpub|25093-Zeus-","username":"user1","topic":"sensor/1/temperature","payload":"MzcuNQ==","qos":0,"node":"emqx1@192.168.1.100","ts":1542113746}
```
### Test the 'session' Topic on Kafka

Subscribe to a topic on EMQ X:

```
$ mosquitto_sub -h 192.168.1.100 -t control/1 -d -u user1 -P 123456

Client mosqsub|25095-Zeus- sending CONNECT
Client mosqsub|25095-Zeus- received CONNACK
Client mosqsub|25095-Zeus- sending SUBSCRIBE (Mid: 1, Topic: control/1, QoS: 0)
```
On the kafka server run `consumer`:
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 test --from-beginning --topic session

{"client_id":"mosqsub|25095-Zeus-","topic":"control/1","qos":0,"node":"emqx1@192.168.1.100","ts":1542113850}
```
