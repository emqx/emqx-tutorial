# Bridge Mosquitto to EMQ X
Other MQTT broker can bridge to EMQ X node and exchange messages cross platforms. In this section we will demonstrate it by example.

Mosquitto is a small, lightweight open source MQTT Broker written in the C/C++ language. Mosquitto adopts a single-core single-threaded architecture to support deployment of embedded devices with limited resources, access to a small number of MQTT device terminals, and implements MQTT protocol of 5.0 and 3.1.1 versions.

Both EMQ X and Mosquitto fully support the MQTT protocol feature, but EMQ X supports more communication protocols with private protocol access. In terms of functional extension of the application layer, Mosquitto lacks out-of-the-box business-related functions such as authentication and certification, rule engine, data persistence and high-performance message bridging (EMQ X Enterprise Edition). In terms of  monitoring operation and visualization management, EMQ X has full existing features and extended solution support. Mosquitto clustering is weak on basic functions, and both official and third-party clustering solutions are difficult to support the performance requirements of large-scale massive connectivity of IoT.

Therefore, Mosquitto is not suitable to serve as the MQTT Broker for large-scale services. However, because it is lightweight enough and compact, it can run on any low-power microcontroller including embedded sensors, mobile devices, embedded microprocessors, and is a better technology selection for the IoT edge messaging. Combined with its bridging function, it can achieve local processing of messages and transparent transmission of clouds.

## Case Description
Assuming that we have one EMQ X broker, the 'emqx1' cluster, and one Mosquitto server. We will create a bridge on Mosquitto server and forward all messages of topic 'sensor' to 'emqx1' cluster  and subscribe to the 'control' topic on 'eqmx1'.


**EMQ X**  

| CLuster name | Cluster address | Listening Port |
| :---: | :---: | :---: |
| emqx1 | emqx1@192.168.1.100 | 1883 |

**Mosquitto**

| Address | Listening Port |
| :---: | :---: |
| 192.168.1.101 | 1883 |

## Configure Mosquitto Server
After installing the Mosquitto, we need to modify the `mosquitto.conf` file to enable and configure the bridge on mosquitto. For each bridge, the basic configuration are:

- The address and listening port of a remote EMQ X broker;
- MQTT protocol parameters, like protocol version, keepalive, cleansession and etc. (if not configured, the default values are applied.);
- Client identity information for EMQ X;
- Topics of a bridge;
- Topic mapping (by default no topic mapping).

### a Simple Configuration for Mosquitto Bridge

**Create a Bridge**  
Open the `mosquitto.conf` file and add a `connection` section for bridge. the string after `connection` directive is also the Client ID which is used to connect to EMQ X:

```
connection emqx1
```

**Configure the Address and Port of Remote EMQ X Node**
```
address 192.168.1.100:1883
```
**Configure the MQTT Protocol Version**  
By default, Mosquitto bridge uses MQTT version 3.1, to enable version 3.1.1, we need to specify it in configuration:
```
bridge_protocol_version mqttv311
```

**Configure the Username for Remote Node**  
```
remote_username user
```

**Configure the Password for Remote Node**
```
remote_password passwd
```

**Specify the Topic to Bridge**  
Mosquitto bridge uses a `topic` directive to configure the bridge topic. A `topic` directive has a format of `topic topic_pattern direction QoS local_prefix remote_prefix`:

- topic_pattern is the pattern of topic, it can include wildcards;
- direction can be `in`, `out` or `both`;
- QoS is the QoS level;
- local_prefix and remote_prefix are used for topic mapping.

We use following configuration to demonstrate the bridge in case description:
```
topic sensor/# out 1
topic control/# in 1
```

After configuration, restart the Mosquitto to make the change effective.

## Configure the EMQ X Broker
After installation of EMQ X, to make it able to receive the bridge connection from Mosquitto, we will need to create a user and create the ACL for this user as needed. To simplify the test, we can also allow anonymous connection and acl_nomatch to skip authentication and authorization in this demonstration.

## Test the Bridge
We use `mosquitto_pub` and `mosquitto_sub` to test if the above configuration works as expected.

### Test the `out` Direction of Bridge
On 'emqx1' subscribe to topic 'sensor/#', and the topic will receive data reported by Mosquitto:
```
$ mosquitto_sub -t "sensor/#" -p 1883 -d -q 1 -h 192.168.1.100

Client mosqsub|19324-Zeus- sending CONNECT
Client mosqsub|19324-Zeus- received CONNACK
Client mosqsub|19324-Zeus- sending SUBSCRIBE (Mid: 1, Topic: sensor/#, QoS: 1)
Client mosqsub|19324-Zeus- received SUBACK
Subscribed (mid: 1): 1
```
On Mosquitto publish:
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
On Mosquitto subscribe to topic 'control/#', and this topic will receive messages published by EMQ X:
```
$ mosquitto_sub -t "control/#" -p 1883 -d -q 1 -h 192.168.1.101
Client mosqsub|19338-Zeus- sending CONNECT
Client mosqsub|19338-Zeus- received CONNACK
Client mosqsub|19338-Zeus- sending SUBSCRIBE (Mid: 1, Topic: control/#, QoS: 1)
Client mosqsub|19338-Zeus- received SUBACK
Subscribed (mid: 1): 1
```

On 'emqx1' publish message, and the message will be passed in the 'emqx1' cluster and bridged to Mosquitto locally:
```
$ mosquitto_pub -t "control/1" -m "list_all" -d -h 192.168.1.100 -q 1
Client mosqpub|19343-Zeus- sending CONNECT
Client mosqpub|19343-Zeus- received CONNACK
Client mosqpub|19343-Zeus- sending PUBLISH (d0, q1, r0, m1, 'control/1', ... (8 bytes))
Client mosqpub|19343-Zeus- received PUBACK (Mid: 1)
Client mosqpub|19343-Zeus- sending DISCONNECT
```

After publishing, a message should be received on the Mosquitto server:
```
Client mosqsub|19338-Zeus- received PUBLISH (d0, q1, r0, m2, 'control/1', ... (8 bytes))
Client mosqsub|19338-Zeus- sending PUBACK (Mid: 2)
list_all
```
