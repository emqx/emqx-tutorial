# Bridge EMQ X to HiveMQ
EMQ X node can connect to other MQTT brokers using bridge and exchange messages cross platforms. In this section we will demonstrate it by example.

## Case Description
Assuming that we have one EMQ X broker, the 'emqx1', and one HiveMQ server. We will create a bridge on 'emqx1' and forward all messages of topic 'sensor' to HiveMQ server and subscribe to the 'control' topic on HiveMQ server.

**EMQ X**  

| Node | Node Name | Listening Port |
| :---: | :---: | :---: |
| emqx1 | emqx1@192.168.1.100 | 1883 |

**HiveMQ**

| Address | Listening Port |
| :---: | :---: |
| 192.168.1.101 | 1883 |

## Configure the HiveMQ Server
Using the default HiveMQ configuration after installation should be sufficient to finish the text in this section. For more details about HiveMQ please refer to the [HiveMQ document](https://www.hivemq.com/).

## Setup a Bridge on 'emqx1'
Note: The configuration of this part has changed since version 3.2.0. See [Upgrade Guide](./bridge.md#升级指南) for details.

To bridge an EMQ X node to HiveMQ, we need to configure it first.

On the 'emqx1', open the config file `emqx.conf`, find 'Bridges' and add a new section below it for our bridge.  
the format of a bridge configuration directive looks like `bridge.bridge_name.directive1[.sub_directives]`, it starts with `bridge`, followed by bridge name and directive. If a directive has subitems, it will be added at the end.


### Add a New Bridge

The following configuration adds a new bridge on EMQ X:

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

Above, we defined the bridge name ('example'), the way it starts (manual start), reconnection interval (30 seconds) and IP address and listening port of remote node (192.168.1.101:1883).


### Configure the MQTT Protocol Version
The directive of MQTT version is:
```
bridge.example.proto_ver = mqttv4
```
Here we can choose the protocol version among `mqttv3`, `mqttv4` and `mqttv5`, they mean MQTT version 3.1, 3.1.1 and 5.0 respectively.

### Configure a Client for the Remote Node
When emq X node connecting to a remote node, it needs to provide its identity to the remote node and passes the authentication and authorization on the remote node. Usually it needs to provide `clientid`, `username` and `password`.
```
bridge.example.client_id = bridge_example
bridge.example.username = user
bridge.example.password = passwd
```

### Configure the Bridge Connection Properties

Configure the connection properties of a bridge:

```
bridge.example.clean_start = false
bridge.example.keepalive = 60s
bridge.example.mountpoint = bridge/example/${node}/
```
Above we configured the `clean_start`, the `keepalive` and the `mountpoint` of a bridge connection.  
In practice, we usually that if a bridge connection to remote is lost, the queued messages will not go lost. Thus, it is a good practice here to set `clean_start` to `false`.  
`keepalive` can be configured according the network stability and application requirement.  
A `mountpoint` is a point on which the topic of forwarded message will be mounted. You can treat it as a prefix added to the topic of forwarded message. In our example, a topic 'sensor/001' will be 'bridge/example/emqx1@192.168.1.100/sensor/001' after forwarded.


### Configure the Bridge forwarding and Subscription
To forward messages to a remote node or receive messages from remote node, we need to specify in which topics we are interested.

**Configure the Forward Topic**
```
bridge.example.forwards = sensor/#
```
Using the `forward` directive, we can specify one or more topics to forward, multiple topics can be separated by ','. This directive supports wildcard.

To ensure the messages are received by the remote node, the forwarded messages are published at QoS level 1.

**Subscription of Topic on Remote Node**
Multiple subscription can be configured for a bridge, each subscription can has its own configuration.
```
bridge.example.subscription.1.topic = control/#
bridge.example.subscription.1.qos = 1
```
The above directives subscribe to `control/#` on the remote node at QoS level 1. The subscription topic supports wildcard.  
For multiple subscription, add more directives like `bridge.example.subscription.2.topic` and `bridge.example.subscription.2.qos` to the configuration.

### Configure the Message Queue for a Bridge

We can configure a message queue for a bridge to cache the not delivered message.

```
bridge.example.mqueue_type = memory  ##memory | disk

bridge.example.max_pending_messages = 10000
```
The above directives setup a message queue in memory for bridge `example`, the queue length is 10000.

### Configure the Secure Link for Bridge
EMQ X supports TLS/SSL to secure the transmission between local and remote nodes. If not specified, the messages exchanged will be in plain text.
```
bridge.example.cacertfile = cacert.pem
bridge.example.certfile = cert.pem
bridge.example.keyfile = key.pem
bridge.example.ciphers = ECDHE-ECDSA-AES256-GCM-SHA384,ECDHE-RSA-AES256-GCM-SHA384
bridge.example.tls_versions = tlsv1.2,tlsv1.1,tlsv1
```
The above directives specified the CA certificate of the remote node, the certificate and its private key of the local node. It enabled the bi- direction certificate authentication. If the `bridge.example.certfile` and `bridge.example.keyfile` are not specified, then only the server side certificate authentication is used.  


## Manage the Bridge
EMQX's command line tool `emqx_ctl` can be used to manage the EMQ X bridge. It can show the bridge status, start and stop a bridge, add or remove forward configuration, add or remove subscription configuration.

After the configuration, we execute following on `emqx1` to start the bridge and check the forwarding and subscriptions of the bridge:
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

## Test the Bridge
We use `mosquitto_pub` and `mosquitto_sub` to test if the above configuration works as expected.

Subscribe to topic ' sensor/#' on HiveMQ:

```
$ mosquitto_sub -t sensor/# -p 1883 -d
```
Publish to topic 'sensor/1/temperature' on 'emqx1':
```
$ mosquitto_pub -t sensor/1/temperature -m "37.5" -d
```
After publishing, a message should be received on the HiveMQ:
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

Subscribe to topic 'control/#' on 'emqx1':
```
$ mosquitto_sub -t control/# -p 1883 -d
```
Publish to topic 'control/device1/restart' on HiveMQ:
```
mosquitto_pub -t control/device1 -m "list_all" -d -h 192.168.1.101
```
After publishing, a message should be received on 'emqx1':
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
