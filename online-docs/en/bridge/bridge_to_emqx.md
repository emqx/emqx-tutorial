# Bridge other MQTT broker to EMQ X

EMQ X fully support MQTT protocol, it can be bridged from other MQTT brokers. It is not necessary for other brokers to understand the implement details of EMQ X when bridging, EMQ X works as a standard MQTT broker.


```
             -------------             -----------------
Client ----> |   Broker  | --Bridge--> |               |
             -------------             |     EMQ X     |
             -------------             |    Cluster    |
Client ----> |   Broker  | --Bridge--> |               |
             -------------             -----------------

```
In the real world deployment, such bridges are often used to extend the system ability and keep the current deployed system to avoid great impact on the overall deployment, or to migrate from other protocol to MQTT.  
Also, EMQ X can be used as a central cluster to handle messages from the brokers on edge.



_In the next sections you will see how to setup bridge from other MQTT brokers to EMQ X._
