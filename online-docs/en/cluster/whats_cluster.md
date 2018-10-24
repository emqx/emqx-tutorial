# EMQ X clusters

Clustering means a group of hardware/software finishes a task cooperatively, this group of components communicate with each other through a computer network. Observed from outside, a cluster is treated as a whole and provide certain services, it is not necessary for the users of these services to know the details about how the cluster components interact with each other.  
Usually a cluster provide higher performance, throughput and availability that a single component in the cluster can do.

We call a smallest set of hardware/software which can provide service alone in the cluster a node.

EMQ X supports clustering, multiple EMQ X broker can work under cluster mode and provide service as a whole, they are connected through TCP network. Here each EMQ X broker is a node.

Comparing to a single-server broker, clustering of EMQ X brings following advantages:
- High availability: when EMQ X works in a single node mode, if this node is down, the service is gone too. This may break the how application behind it. A cluster provides redundancy, when a node in cluster is down, the other nodes are still working and thus the service will not break.

- Load balancing: by introducing load balancing mechanism, each node in cluster can be loaded according to its ability, there will be no server is overloaded while the others are still not busy.

- Higher performance: A cluster provides higher performance than a single node by its nature.

- Extensibility: it is easy to extend a cluster by adding new nodes into it, without stopping the service.

##  EMQ X Cluster Based on Erlang/OTP
EMQ X is based on Erlang/OTP platform. The Erlang/OTP platform is originally designed for developing telecommunication systems, high performance and easy-to-manage clustering is one of the designing philosophy of Erlang/OTP. EMQ X takes full advantage of Erlang/OTP and provide an easy yet reliable cluster mechanism.


```
---------         ---------
| Node1 | --------| Node2 |
---------         ---------
    |     \     /    |
    |       \ /      |
    |       / \      |
    |     /     \    |
---------         ---------
| Node3 | --------| Node4 |
---------         ---------
```
When a client is connected to an EMQ X cluster, the clients subscription will be known by all nodes in cluster, and the publishing to topics from this client will be routed to all nodes with clients has subscription to the same topic. This procedure is automatic and transparent to users, they don't need to know the details of how it is done.

### Node
Each EMQ X broker in cluster is a node. In the internal communication of cluster, every node is identified by a unique **node name**,  the node name has a form of `name@node`. The `name` part is assigned by user, the `host` part is the IP address of Full Qualified Domain Name(FQDN) of this node.  
For example:
```
emqx1@192.168.1.165
emqx2@broker1.emqx.io
```
### Communication among Nodes
EMQ X cluster uses `epmd` to map the node name to TCP port. If there is firewall on the network please make sure the communication among nodes is allowed.

EMQ X uses `magic cookie` of Erlang/OTP to verify if the nodes belong to a same cluster. Nodes of a cluster should have same cookie.

The cluster internal connection can be TCPv4 or TCPv6, TLS is supported.


## Processing MQTT Messages in Cluster
Each MQTT client connects to one node in the cluster. The principle of EMQ X cluster processing MQTT messages can be summed up in two points:
- When an MQTT client successfully subscribed to a topic on a node, all other nodes will be notified about this subscription.
- When an MQTT client published a message to a certain topic, this message will be routed to all nodes which have subscription to this topic.

All the EMQ X nodes on a cluster will have a replication of route table, entries in a route table are mappings of topic and nodes. Thus, when a message comes in, the cluster knows where it should be routed to. A simple routing table looks like:
```
topic1 -> node1, node2
topic2 -> node3
topic3 -> node2, node4
```
### Topic Trie and Route Table
Besides the route table, each EMQ X nodes maintains also a topic trie.

For following relationship of clients and topic subscription in a cluster:

| Client   | Node    | Subscription |
|----------|---------|--------------|
| client1  | node1   | t/+/x, t/+/y |
| client2  | node2   | t/#          |
| client3  | node3   | t/+/x, t/a   |

the following topic trie and route table are generated:
```
--------------------------
|             t          |
|            / \         |
|           +   #        |
|         /  \           |
|       x      y         |
--------------------------
| t/+/x -> node1, node3  |
| t/+/y -> node1         |
| t/#   -> node2         |
| t/a   -> node3         |
--------------------------
```

### Subscription and Message Delivery
The subscription of a client is stored on the node it connects to, it is used deliver the message to the right client on this node.

For example, client1 publishes message to topic 't/a', the message routing among nodes and the message delivery to subscribing client will be like following:
```
client1->node1: Publish[t/a]
node1-->node2: Route[t/#]
node1-->node3: Route[t/a]
node2-->client2: Deliver[t/#]
node3-->client3: Deliver[t/a]
```
![Message Route and Deliver](../assets/whats_cluster_1.png)
