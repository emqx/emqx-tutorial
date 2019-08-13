## Share subscribe

MQTT is based on the pub / sub principle,the same message can be distributed to multiple clients. When it is difficult for a single client to process a large number of messages, a more advanced message pattern with client load balancing mechanism is needed：shared subscription.

Shared subscription is a mechanism that allows message distribution of subscription groups to be distributed evenly to subscription group members.

In shared subscription, clients subscribing to the same topic receive messages under this topic in turn. The same message is not sent to multiple subscribers, thus achieving load balancing between multiple nodes on the subscriber side.

![mode1](../assets/mode1.gif)


### Use guide

You can use any MQTT client to enable shared subscriptions on EMQ.

Two ways to create a shared subscription:


| Topic Prefix             | Examples                       |
| -------------------- | -------------------------- |
| $queue/:topic        | sub `$queue/up/data`       |
| $share/:group/:topic | sub `$share/group/up/data` |


**The theme structure of shared subscriptions such as:**

`$share/:group_id/:topic`


**The shared subscription consists of 3 parts:**

- A static shared subscription identifier (**$share**)

- A group identifier

- Specific standard MQTT topic


  

**The difference between \$queue and $share：**

After \$share, you can add different groups, such as \$share/group1/topic, \$share/group2/topic,$share/group3/topic.

When EMQ sends a message to topic, each group receives the message and sends it to the device in turn in the group.



### Example

MQTT clients can easily implement shared subscriptions. The following Node.js code shows two client subscription subscriptions unified subscription group：

```js
const mqtt = require('mqtt')

const clientOne = mqtt.connect('mqtt://q.emqx.io:1883')
const clientTwo = mqtt.connect('mqtt://q.emqx.io:1883')
const clientThree = mqtt.connect('mqtt://q.emqx.io:1883')

// client One sub
clientOne.on('connect', () => {
    console.log('clientOne connected')
    clientOne.subscribe('$share/group_one/up/data')
})
clientOne.on('message', (topic, message) => {
    console.log('clientOne received message from', topic, ':', message.toString())
})


// clientTwo sub
clientTwo.on('connect', () => {
    console.log('clientTwo connected')
    clientTwo.subscribe('$share/group_one/up/+')
})
clientTwo.on('message', (topic, message) => {
    console.log('clientTwo received message from', topic, ':', message.toString())
})


// pub test
clientThree.on('connect', () => {
    let i = 0
    setInterval(() => {
        clientThree.publish('up/data', i)
        i++
    }, 1000)
})

```

The clientOne and clientTwo will receive messages in turn after startup:

```bash
// result
clientOne received message from up/data : 0
clientTwo received message from up/data : 1
clientOne received message from up/data : 2
....
```

The clients can subscribe or unsubscribe the subscription group any time. If another client would join the group, each client would receive 1/3 of all MQTT messages.
