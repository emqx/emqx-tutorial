# Bridge VerneMQ to EMQ X
Other MQTT broker can bridge to EMQ X node and exchange messages cross platforms. In this section we will demonstrate it by example.

## Case Description
Assuming that we have one EMQ X broker, the 'emqx1', and one VerneMQ server. We will create a bridge on VerneMQ server and forward all messages of topic 'sensor' to 'emqx1'  and subscribe to the 'control' topic on 'eqmx1'.

**EMQ X**  

| Node | Node Name | Listening Port |
| :---: | :---: | :---: |
| emqx1 | emqx1@192.168.1.100 | 1883 |

**VerneMQ**

| Address | Listening Port |
| :---: | :---: |
| 192.168.1.101 | 1883 |

## Configure VerneMQ
After installing the VerneMQ, we need to modify the `vernemq.conf` file to enable and configure the bridge on VerneMQ. For each bridge, the basic configuration are:

- The address and listening port of a remote EMQ X broker;
- MQTT protocol parameters, like protocol version, keepalive, cleansession and etc. (if not configured, the default values are applied.);
- Client identity information for EMQ X;
- Topics of a bridge;
- Topic mapping (by default no topic mapping).

### a Simple Configuration for VerneMQ Bridge

**Enable VerneMQ Bridge Plugin**
VerneMQ uses plugin for MQTT bridge. to enable this plugin, we need to modify the  `vernemq.conf` file and change `plugins.vmq_bridge` to `on`:
```
plugins.vmq_bridge = on
```

**Configure the Address and Port of Remote Node**
```
vmq_bridge.tcp.br0 = 192.168.1.100:1883
```

**Configure the User Name for a Remote Node**  
```
vmq_bridge.tcp.br0.username = user
```

**Configure the Password for the User**
```
vmq_bridge.tcp.br0.password = passwd
```

**Specify the Topics to Bridge**  
The topic configuration format is `vmq_bridge.tcp.br0.topic.1 = topic_pattern direction QoS local_prefix remote_prefix`:
- topic_pattern is the pattern of topic, it can include wildcards. To be noticed: "#" is treated as comment, use "\*" instead;
- direction can be `in`, `out` or `both`;
- QoS is the QoS level;
- local_prefix and remote_prefix are used for topic mapping.

We use following configuration to demonstrate the bridge in case description:
```
vmq_bridge.tcp.br0.topic.1 = sensor/* out 1
vmq_bridge.tcp.br0.topic.2 = control/* in 1
```

After configuration, restart the VerneMQ to make the change effective.

## Configure the EMQ X Broker
After installation of EMQ X, to make it able to receive the bridge connection from Mosquitto, we will need to create a user and create the ACL for this user, for more details please refer to [Authentication](../security/auth.md) and [Authorization](../security/acl.md) parts of EQM X document. To simplify the test, we can also allow anonymous connection and acl_nomatch to skip authentication and authorization in this demonstration.

## Test the Bridge
We use `mosquitto_pub` and `mosquitto_sub` to test if the above configuration works as expected.

### Test the `out` Direction of Bridge
On 'emqx1' subscribe to topic 'sensor/#':
```
$ mosquitto_sub -t "sensor/#" -p 1883 -d -q 1 -h 192.168.1.100

Client mosqsub|19324-Zeus- sending CONNECT
Client mosqsub|19324-Zeus- received CONNACK
Client mosqsub|19324-Zeus- sending SUBSCRIBE (Mid: 1, Topic: sensor/#, QoS: 1)
Client mosqsub|19324-Zeus- received SUBACK
Subscribed (mid: 1): 1
```
On VerneMQ publish:
```
mosquitto_pub -t "sensor/1/temperature" -m "37.5" -d -h 192.168.1.101 -q 1
Client mosqpub|19325-Zeus- sending CONNECT
Client mosqpub|19325-Zeus- received CONNACK
Client mosqpub|19325-Zeus- sending PUBLISH (d0, q1, r0, m1, 'sensor/1/temperature', ... (4 bytes))
Client mosqpub|19325-Zeus- received PUBACK (Mid: 1)
Client mosqpub|19325-Zeus- sending DISCONNECT
```
After publishing, a message should be received on the 'emqx1':
```
Client mosqsub|19324-Zeus- received PUBLISH (d0, q1, r0, m1, 'sensor/1/temperature', ... (4 bytes))
Client mosqsub|19324-Zeus- sending PUBACK (Mid: 1)
37.5
```

### Test the `in` Direction of Bridge
On VerneMQ subscribe to topic 'control/#':
```
$ mosquitto_sub -t "control/#" -p 1883 -d -q 1 -h 192.168.1.101
Client mosqsub|19338-Zeus- sending CONNECT
Client mosqsub|19338-Zeus- received CONNACK
Client mosqsub|19338-Zeus- sending SUBSCRIBE (Mid: 1, Topic: control/#, QoS: 1)
Client mosqsub|19338-Zeus- received SUBACK
Subscribed (mid: 1): 1
```

On 'emqx1' publish:
```
$ mosquitto_pub -t "control/1" -m "list_all" -d -h 192.168.1.100 -q 1
Client mosqpub|19343-Zeus- sending CONNECT
Client mosqpub|19343-Zeus- received CONNACK
Client mosqpub|19343-Zeus- sending PUBLISH (d0, q1, r0, m1, 'control/1', ... (8 bytes))
Client mosqpub|19343-Zeus- received PUBACK (Mid: 1)
Client mosqpub|19343-Zeus- sending DISCONNECT
```

After publishing, a message should be received on the VerneMQ server:
```
Client mosqsub|19338-Zeus- received PUBLISH (d0, q1, r0, m2, 'control/1', ... (8 bytes))
Client mosqsub|19338-Zeus- sending PUBACK (Mid: 2)
list_all
```
