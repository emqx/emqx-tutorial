## Local subscribe


In local subscriptions, EMQ X does not create global routes for subscriptions, but distributes MQTT messages on the current node.

Usage: Add topic prefix such as `$local/:topic`

```bash
# sub topic
$local/my_topic

# pub topic
my_topic
```



### Use guide

1. When messages from producers and consumers need only be delivered to one EMQ X node, EMQ X's **local subscription** can be used.

2. When the message is expected to be load balanced among multiple clients on the subscriber side by EMQ X, EMQ X's **share subscription** can be used.

3. When multiple producers produce multiple messages, one consumer shares the huge pressure, or in other cases, needs to share subscriptions locally. Local share subscription is a combination of **local subscription** and **share subscription**.

>  Each consumer must subscribe to each EMQ X node locally so that each message is delivered to only one consumer. Here, sub refers to consumers, and pub refers to producers.



### Message flow

Each published message is sent from LB (load balancer) to different EMQ X nodes, such as the first EMQ X node receiving M1, M3 and M4 messages:

- Through local subscription, the message of this EMQ X node sends the received messages of M1, M3 and M4 not to other clusters, but only to the subscribed SUB from this EMQ X node.

- By sharing subscriptions, the EMQ X node sends the received messages of M1, M3 and M4 to different SUB terminals.

- Through the above local subscription + shared subscription, each message sent by multiple PUBs can arrive randomly and only one SUB end can be reached.


![image-20190211151232830](../assets/image-20190211151232830.png)



### Subscription

Each SUB uses a local shared subscription ($local/$share/A) to subscribe to each node in the EMQ X cluster.


![image-20190211151644927](../assets/image-20190211151644927.png)
