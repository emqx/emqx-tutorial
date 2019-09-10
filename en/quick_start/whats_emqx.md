# EMQ X introduction

EMQ X is an MQTT broker based on Erlang/OTP platform, which is the most popular MQTT broker in open source community. EMQ X has following characteristic.

- Based on Apache 2.0 license, totally open source. All of EMQ X source code is maintained in [github](https://github.com/emqx/emqx), and anybody can access the code.
- EMQ X 3.0 support MQTT 5.0 protocol, and EMQ X Broker is the *first MQTT broker supports MQTT 5.0  in open source community*, it's also compatible with MQTT V3.1 and 3.1.1 protocol. Besides MQTT protocol, EMQ X also support other IoT protocols (Refer to below EMQ X Broker product introduction for more detailed information).
- Support million level MQTT connections for single node, and up to 10 million level connection for a cluster. EMQ X leverages several technologies to realize such big scale connections.
  - Making maximum use of the soft-realtime, high concurrent and fault-tolerant Erlang/OTP platform;
  - Full asynchronous architecture;
  - Layered design of connection, session, route and cluster;
  - Separated messaging and control panel;
- Extension  module and plugins, user can realize extension of private protocol, authentication, persistence, bridge and administration console by leveraging flexible extension mechanism provided by EMQ X.
- Bridge: EMQ X can bridge with other message systems. For example, EMQ X Enterprise supports to bridge message to Kafka, RabbitMQ or other EMQ nodes.
- Shared subscriptions: Shared subscription supports to distribute MQTT message between several subscriptions with load balance approach. Take IoT data collection scenario, there are lots of devices publish message, and several subscribers are required to consume the message with load balance.

# EMQ X versions

EMQ X currently has three editions, user can choose corresponding version with different requirements.

## EMQ X Broker

EMQ X open source version, user can download and use it for free, it provides following features.

- 100k concurrent connections level
- Popular IoT protocols support
  - MQTT
  - MQTT-SN
  - CoAP
  - LwM2M
  - WebSocket
  - STOMP
  - TCP
- Authentication
- Cluster, HA
- Docker deployment
- Community support

## EMQ X Enterprise

EMQ X commercial version, user can [download evaluation version](https://www.emqx.io/downloads) to make a trial.

- All features in open source version
- Million concurrent connections level
- Data persistence : support data persistence, following databases are supported,
  - Redis
  - MongoDB
  - MySQL
  - PostgreSQL
  - Cassandra
- Data bridge, support to forward message to Kafka, RabbitMQ or other EMQ nodes.
- LoRaWAN support
- Kubernates deployment
- Security - provide end-to-end secured connection solution
- Monitoring, provides OS, EMQ X and Erlang VM monitoring
- Commercial technical support

## EMQ X Platform

EMQ X platform version, support large scale IoT connection platform solutions.

- All features in enterprise version
- 10 million concurrent connections level
- Large scale, cross data center consulting and implementation
- Provide all kinds of service required for building IoT platform (consulting, training, architect design, customized development, platform development, functional test and operation service).

