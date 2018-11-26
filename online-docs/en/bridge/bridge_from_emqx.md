# EMQ X and Bridge

## What is Bridge
Bridge is a mechanism to connect multiple EMQ X nodes, or other MQTT broker nodes. Unlike the cluster mode, a bridge doesn't synchronize topic trie or route table between node, it simply forwards messages to other nodes and / or subscribes to topics from nodes. What a bridge does are:
- to forward messages from local clients to remote nodes according bridge rules; and
- to subscribe to topics on remote nodes and dispatch this messages  in local cluster as if these messages are from local clients.

```
              ---------                     ---------                     ---------
Publisher --> | Node1 | --Bridge Forward--> | Node2 | --Bridge Forward--> | Node3 | --> Subscriber
              ---------                     ---------                     ---------
```
Bridge and cluster can be used for different scenarios, bridge has some advantages comparing to cluster:
- Bridge can work cross VPC. A bridge doesn't replicate topic trie and route table among the nodes, thus it has more tolerance on the network stability and latency. Clusters deployed in different VPCs can be bridged together to enhance the coverage of an application.
- Bridges can connect heterogeneous nodes. The essence of a bridge is subscription and publishing of messages between brokers, theoretically the brokers that support MQTT protocol can be bridged together. Even brokers using protocols other than MQTT can be bridged together, when there is a suitable adaptor in place.  
- Enhance the total performance of an MQTT application. Due to the communication overhead in a cluster (control flow, route table synchronization, etc), there will be a up-limit of node number for a cluster. A bridge forwards only messages that are defined by rules, the total communication among nodes can be reduced and thus the overall scalability of an application can be higher.

In practice, a bridge can be roughly treated as a client of a remote cluster or node.

_In the next sections you will see how to setup bridge from EQM X to other MQTT brokers._
