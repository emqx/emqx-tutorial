# What is MQTT

MQTT stands for Message Queuing Telemetry Transport. Initially it is a instant message exchange protocol developed by IBM to serve on low-bandwith and unstable links for Telemetry applications, now it is more and more popular in IoT applications for different use cases and became an important of the IoT world.

- Low weight message transmitting protocol based on Publish-Subscribe Pattern, only two bytes in message head.
- Designed for resource limited low bandwith or unstable networks, suitable for IoT and M2M scenarios.
- Based on TCP/IP protocal stack.
- De facto standard in IoT applications.

The protocal is initialed by Dr Andy Stanford-Clark from IBM and Arlen Nipper from Arcom (now Eurotech), after several upgrade and improvement, it bacame a standard of OASIS in 2013.

- In 2015, MQTT3.1.1 is released
- In 2018, MQTT5.0 is released

Currently the widely used protocol version is 3.1.1. Some active broker providers introduced their MQTT 5.0 products into the market, EMQ released the EMQ X Version 3.0 in September 2018, it is the first open source MQTT broker in the open source community.

## Main characters of MQTT Protocol

- MQTT Protocol uses Publish-Subscribe Pattern to do one-to-many message delivery and decouple the data transmit and the application program.
- QoS, MQTT Protocol provides three levels of QoS
  - QoS 0: deliver message at most once
  - QoS 1: deliver message at least once(ensure the message is delivered)
  - QoS 2: deliver message exactly once(ensure the message is delivered without duplication)
- Small transmitting overhead, less messages exchanged in protocol  
- Communication parties are aware of error/disconnection on network occurred

## MQTT Pub/Sub

![订阅与发布](../assets/image-20180927222728201.png)

As showed in the figure above,

- Publisher: A temperature sensor publishes a message about the temperature (37.5) using the topic 'sensor/1/temperature'
- 3 different Subscribers subscribe in different ways and receive this message
  - Mobile device: subscribe to 'sensor/1/#''
  - Destop App: subscribe to 'sensor/+/temperature'
  - Server: subscribe to 'sensor/1/temperature'

## MQTT Broker

MQTT Broker brokers the message exchage between the publishers and the subscribers, it provides services in following way:

- Decouple the subscribers and publishers using Pub-Sub pattern.
- To the broker, both publishers and subscribers are clients.
- Broker maintains the connections from clients using TCP, TLS or WebSocket.
- Client (publisher) publishes message to broker.
- One or more clients (subscribers) receive message from broker.

According to the QMTT standard, three connection protocols are supported:

- TCP: default port 1883
- TLS: default port 8883
- WebSocket: default port 8083
