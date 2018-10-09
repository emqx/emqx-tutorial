## Q: What's EMQ X?

A: EMQ X is an open-source, distributed MQTT messaging broker, it can support up to million level of concurrent MQTT connections.  It can be used for connecting to any devices that support MQTT protocol, and it can also be used for delivering message from server side to client.




## Q: How many products in EMQ X?

A: EMQ X totally has [3 products.](https://www.emqx.io/products) Different products support different level of connections, features and services etc.

- EMQ X Broker: EMQ X open source version, supports the popular IoT protocols, such as MQTT, CoAP and LwM2M. It supports 100k level concurrent MQTT connections.
- EMQ X Enterprise: EMQ X enterprise version.  It is based on the open source version, and adds data persistence (support Redis, MySQL, MongoDB or PostgreSQL), data bridge to Kafka, LoRaWAN support, EMQ X monitoring, Kubernetes deployment etc. It supports 1M level concurrent MQTT connections.
- EMQ X Platform: EMQ X Platform version is based on the Enterprise version，and support 10M level concurrent MQTT connections. We provide consulting service for complex IoT platforms, such as cross data center solutions. All kinds of services building an IoT platform can be provided, such as consulting, training, architect design, customized development, platform implementation, testing and operation.


## Q: What's the major difference between EMQ X enterprise and broker?

A: EMQ X Enterprise (enterprise version) is based on Broker (open source version), it includes all of the features of open source version.  Comparing to open source version, it has following difference:

- Concurrent connection level: the stable concurrent connection level for open source version is 100k, while enterprise version is 1M.
- Data persistence: Enterprise version supports to persist data to several kinds of databases, includes the popular relational database, such as MySQL, PostgreSQL; Memory database, such as Redis; Non-SQL DB, such as MongoDB.
- Kafka bridge: Forward MQTT message to Kafka clusters through internal bridge plugins, application can consume Kafka message to implement the streaming data process.
- RabbitMQ bridge: Support to forward MQTT message to RabbitMQ, application can consume RabbitMQ message to integrate with 3rd party system.
- System monitoring (EMQ X Control Center)

  - EMQ X cluster monitor: Include statistics of connections, topics, message & sessions.

  - Erlang VM monitor: Erlang process, threads, memory, distributed database & distributed locks etc.

  - Host monitor: Measurements of CPU, memory, disk, network and operating system.
- security: By configuration of TLS, DTLS connections and certifications to get higher secured connections.




## Q: How to use EMQ X?

A: EMQ X Broker is free and it can be download at [https://www.emqx.io/downloads/emq/broker](https://www.emqx.io/downloads/emq/broker?osType=Linux).

EMQ X Enterprise can be downloaded and evaluated for free.  You can download it from [https://www.emqx.io/downloads/emq/enterprise](https://www.emqx.io/downloads/emq/enterprise?osType=Linux), and then apply trial license at [https://www.emqx.io/account?tab=login](https://www.emqx.io/account?tab=login).

Also you can use the EMQ X enterprise version through public cloud service.

- [TODO AWS](https://www.emqx.io)




## Q: Does EMQ X provide consulting service?

A: Yes. We have rich experience at consulting of building IoT platforms, include practice of helping Internet companies and carriers to build IoT platform that supports 10M level concurrent connections. We can help by customizing solutions for creating load-balancing, clustering, security policies, data storage and analytics, and make the solution can satisfy future business evolvement.

## Q: What's EMQ X suggested OS?

A: EMQ X supports deployment on at Linux, Windows, MacOS, ARM system, and suggest to deploy product environment at issued Linux version, such as CentOS, Ubuntu and Debian.

## Q: Can EMQ X support customized protocols? How to implement?

A: TODO...

## Q: How to estimate resource usage of EMQ X?

A: Following factors will have an impact on EMQ X resource consumption, mainly on CPU and memory usage.

- Connection number: EMQ X creates 2 Erlang process for every MQTT connection, and every Erlang process consumes some resource. The more connections, the more resource is required.

- Average throughput: Throughput means (pub message number + sub message number) processed by EMQ X per second. With higher throughput value, more resource will be used for handling route and message delivery in EMQ X.

- Payload size: With bigger size of payload, more memory and CPU are required for message cache and processing.

- Topic number: With more topics, the route table in EMQ X will increase, and more resource is required.

- QoS：With higher message QoS level, more resource will be used for message handling.

If client devices connect to EMQ X through TLS, more CPU resource is required for encryption and decryption. Our suggested solution is to add a load balancer before EMQ X nodes, the TLS is offloaded at load balance node, connections between load balancer and backend EMQ X nodes use plain TCP connections.

You can use our online calculation tool [TODO](https://www.emqx.io) to estimate the resource consumption.

## Q: What's EMQ X authentication and it's use scenario?

A: When a client connects to EMQ X server,  EMQ X can authenticate it in different ways. It includes following 3 approaches,

- Username and password: Per every MQTT client connection, which can be configured at the server, only by passing with correct username and password, the client connection can be established.

- ClientID: Every MQTT client will have a unique ClientID,  and a list of ClientIds can be configured in server, and only ClientIds in the list can be authenticated successfully.

- Anonymous: Allows anonymous access.

Besides using the configuration file (to configure authentication), EMQ X can also use database and integration with external applications, such as MySQL, PostgreSQL, Redis, MongoDB, HTTP and LDAP.

## Q: Can I capture device online and offline events? How to use it?

A: EMQ X supports to capture device online and offline events through below 3 approaches,

- Web Hook

- Subscribe related $SYS topics

  - $SYS/brokers/${node}/clients/${clientid}/connected
  - $SYS/brokers/${node}/clients/${clientid}/disconnected

- Directly save events into database

  The final approach is only supported in enterprise version, and supported database includes Redis, MySQL, PostgreSQL, MongoDB and Cassandra. User can configure database, client.connected and client.disconnected events in the configuration file. When a device is online or offline, the information will be saved into database.

## Q: What's Hook? What's the use scenario?

A:  Hook is an interface provided by EMQ X, which will be triggered when a connection, session or message is established/delivered. EMQ X provides hooks listed in below, which allows user to save these triggered events to database, and user can conveniently query all kinds of information, such as client connect,  disconnect.  

- client.connected: client online
- client.disconnected: client offline
- client.subscribe: client subscribes topics
- client.unsubscribe: client unsubscribes topics
- session.created: session was created
- session.resumed: session is resumed
- session.subscribed: after session subscribe topic
- session.unsubscribed: after session unsubscribe topic
- session.terminated: session is terminated
- message.publish: MQTT message is publish
- message.delivered: MQTT message is delivered
- message.acked: MQTT message is acknowledged
- message.dropped: MQTT message is dropped

## Q: What's WebSocket? When to use Websocket to connect EMQ X?

A: WebSocket is a full-duplex communication protocol based on HTTP protocol, user can realize dual direction communications between browser and server. Through Websocket, server can push message to web browser. EMQ X provides support of WebSocket, user can realize pub to topics and sub to topic from browsers.

## Q: I want to control topics can be used for specific clients, how to configure it in EMQ X?

A: EMQ X can constrain clients used topics to realize device access controls. To use this feature, ACL (Access Control List) should be enabled, disable anonymous access and set `acl_nomatch` to 'deny' (For the convenience of debugging, the last 2 options are enabled by default, and please close them).

ACL can be configured in configuration file, or backend databases. Below is one of sample line for ACL control file, the meaning is user 'dashboard' can subscribe '$SYS/#' topic. ACL configuration in backend databases is similar, refer to EMQ X document for more detailed configurations.

```
{allow, {user, "dashboard"}, subscribe, ["$SYS/#"]}.
```


## Q: What's shared subscription, and it's use scenario?

A: Shared subscription is a new feature of MQTT 5.0 specification. Before the feature was introduced in MQTT 5.0 specification, EMQ 2.x already supported the feature as non-standard MQTT protocol. In general, all of subscribers will receive ALL message for the subscribed topics, while clients that subscribe the same topic will receive the message with round-robin way, so one message will not be delivered to different clients. By this way, the subscribers can be load-balanced.

Shared subscription is very useful in data collection and centralized data analysis applications. In such cases,  number of data producers is much larger than consumers, and one message is ONLY need to be consumed by once.

## Q: Can EMQ X support traffic control?

A：Yes. Currently EMQ X supports to control connection rate and message publish rate. Refer to below for sample configuration.

```
## Value: Number
listener.tcp.external.max_conn_rate = 1000

## Value: rate,burst
listener.tcp.external.rate_limit = 1024,4096
```

## Q: What is offf-line message?

A: Usually an MQTT client receivces messages only when it is connected to an EMQ X, if this client is off-line, it will not receive messages. But if a client has a fixed ClientID, and it connects to the broker with clean_seesion = false, the broker will store particular meesage for it when it is off-line, if the Pub/Sub is done at certain QoS level (broker configuration). These messages will be delivered when this client is conencted again.  

Off-line message is useful when the connection is not stable, or the application has special requirements on QoS.



## Q: What is Subscription by Broker? And its use scenario?

A: Usually an MQTT client has to subscribe to the topics expressly by itself, if it want to receive the messages unter these topics. Subscription by Broker means that the broker can subscribe to particular topics for a client without client's interaction. The relation of such clients and their topics to be subscribed to is stored at broker side.

Using of Subscription by Broker can ease the management of massive client, and save the computational resource and bandwidth on the client side.

*Note: Currently this feature is available in the EMQ X Enterprise edition. *



## Q: How does the EMQ X achieve high concurrency and high availability?

A: High concurrency and high availability are design goals of EMQ X. To achieve these goals, multiple technologies are applied:

- Making maximum use of the soft-realtime, high concurrent and fault-tolerant Erlang/OTP platform;
- Full asynchronous architecture；
- Layered design of connection, session, route and cluster;
- Separated messaging panel and control panel;
- Etc.

Well designed and implemented, a single EMQ X node can handle million level connections.

EMQ X supports clustering. In a cluster with multiple nodes, the performance is multiplied, and the MQTT service will not be interrupted when a single node is down.


## Q: Can EMQ X store messages to database?

A: The EMQ X Enterprise edition supports data persistence. Supproted databases are:

- Redis
- MongoDB
- MySQL
- PostgreSQL
- Cassandra


## Q: Can EMQ X forward messages to Kafka?

A: The EMQ X Enterprise edition integrates a Kafka bridge, it can bridge data to Kafka.

## Q: Does EMQ X support cluster auto discovery? What clustering methods are supported?

A: EMQ X supports cluster auto discovery. EMQ X clustering can be done manually or automatically.

Currently supported clustering methods:

- Manual clustering
- Static clustering
- Auto clustering using IP multi-cast
- Auto clustering using DNS
- Auto clustering using ETCD
- Auto clustering using K8S


## Q: Can I forward MQTT messages EMQ X to other MQTT broker, like RabbitMQ?

A: EMQ X support forward messages to other MQTT broker. Using MQTT bridge, EMQ X can forward messages of interested topics to other broker.


## Q: Can I forward messages from EMQ X to MQTT services hosted on public cloud?

A: EMQ X can forward messages to IoT Hub hosted on public cloud, this is a feature of EMQ X bridge.


## Q: Can other MQTT broker (for example Mosquitto) forward messages to EQM X?

A: EMQ X can receive messages from other broker, but it depends also on the implementation of other brokers, Mosquitto can forward messages to EMQ X, please refer to [TODO](https://www.emqx.io)。


## Q: What is the use of system topics? What system topics are available?

A: The system topics have a prefix of `$SYS/`. Periodically, EMQ X publishes system messages under system topics, these messages include system status, statistics of MQTT, client's online/offline status and so on.

Here are some examples of system topics, for a whole system topic list please refer to EMQ X document:

- $SYS/brokers:  List of nodes in cluster
- $SYS/brokers/${node}/clients/${clientid}/connected: this message is published when a client connects
- $SYS/broker/${node}/stats/connections/count: Number of connections on a node
- $SYS/broker/${node}/stats/sessions/count: Number of sessions on a node


## Q: What should I do if I want trace the subscription and publish of some particular message?

A: EMQ X support the tracing of messages from particular client or under particular topic. You can use the command line tool `emqx_ctl` for tracing. The example below shows how to trace messages under 'topic' and save the result in 'trace_topic.log'. For more details please refer to EMQ X document.

```
./bin/emqx_ctl trace topic "topic" "trace_topic.log"
```


## Q: When I was doing stress test, the connection number and throughput are lower than expected. How can I tune the system to make full use of it?

A: When doing a stress test, besides ensuring the necessary hardware resource, it is also necessary to tune the OS and the Erlang VM to make the maximum use of the resource. The most common tuning is to modify the global limitation of file handles, the user limitation of file handles, the TCP backlog and buffer, the limitation fo process number of Erlang VM and so on. In some case you will also need to tune the client to ensure it has the ability and resource to handle all the subs and pubs.

Different use scenario requires diferent tuning。 In the EQM X document there is a chapter about tuning the system for general purpose. [TODO](https://www.emqx.io)


## Q: My number of connections is small, do I still need to deploy multiple nodes in production?

A: Even when the number of connctions is small message rate is low, to deploy a cluster with multiple nodes in production is still very meaningful. A cluster improves the availability of system, when a single node is down, the rest nodes in cluster ensures the service is not interrupted.  


## Q: Dose EMQ X supports encrypted connection? What is the recommended deployment?

A: EMQ X Support SSL/TLS. In production, we recommend to terminate the TLS connection by Load Balancer.
