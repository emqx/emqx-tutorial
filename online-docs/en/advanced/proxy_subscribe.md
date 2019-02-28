## Proxy subscribe

Proxy subscriptions cloud specify topics for online device subscription/unsubscribe, and can set/change proxy subscription lists flexibly and in batches from the data level through configuration files, databases or REST APIs.


### Proxy subscriptions module

Open the EMQ X configuration file `etc/emqx.conf` find, the subscription module related configuration items, and configure multiple automatic subscription items after the device is connected:


```bash
## Subscription Module

## Enable
module.subscription = on

## Subscribe the Topics automatically when client connected.
module.subscription.1.topic = $client/%c
## Qos of the subscription: 0 | 1 | 2
module.subscription.1.qos = 0

module.subscription.2.topic = $user/%u/%c
module.subscription.2.qos = 0
```

> Using placeholder, %c means cliendId, %u means username，work in connection of equipment.




### Backend module

Refer to [Backend](./backend/whats_backend.md), work in connection of equipment.



### REST API

Using [EMQ X Management REST API](https://developer.emqx.io/docs/emq/v3/en/rest.html#create-a-subscription) set subscribe/unsubscribe，work in 


#### Subscribe

HTTP URL：
```
http://127.0.0.1:8080/api/v3/mqtt/subscribe
```

Payload：

```json
{
  "topic": "test_topic",
  "qos": 1,
  "client_id": "mqttjs_ab9069449e"
}
```

#### Unsubscribe

HTTP URL：
```
http://127.0.0.1:8080/api/v3/mqtt/unsubscribe
```

Payload:

```json
{
  "topic": "test_topic",
  "payload": "hello",
  "qos": 1,
  "retain": false,
  "client_id": "mqttjs_ab9069449e"
}
```