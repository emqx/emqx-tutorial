# Using JavaScript

EMQ X Broker supports communication with clients through WebSocket protocol.
WebSocket is a protocol for full duplex communication on a single TCP connection.
The WebSocket communication protocol was established by IETF as standard RFC 6455 in 2011 and supplemented by RFC 7936.
WebSocket API is also set standard by W3C. WebSocket makes data exchange between client and server easier, allowing the server to push data to the client on its own initiative. In the WebSocket API, browsers and servers only need to shake hands once, and a persistent connection can be created between the two directly, and two-way data transmission can be carried out.

## Library comparison

**Paho.mqtt.js**

[Paho](https://www.eclipse.org/paho/) is an MQTT client project for Eclipse. Paho JavaScript Client is its browser-based JavaScript runtime library that connects to an MQTT server using WebSockets. Compared with MQTT.js, it has fewer functions and is not recommended.

**MQTT.js**

[MQTT.js](https://www.npmjs.com/package/mqtt) can be used in Node.js environment and browser environment. On Node.js, you can use console connection through global installation, and MQTT.js also supports MQTT, MQTT TLS certificate connection. MQTT.js can be used in WeChat mini program.


## Installation

Installation using npm:

```bash
npm i mqtt

import mqtt from 'mqtt'
```


Installation using CDN:

```html
<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>

<script>
    // mqtt will be introduced as global variable
    console.log(mqtt)
</script>
```

## A simple client

MQTT.js supports WebSocket protocol connections in browser environments and TCP (SSL/TLS) protocol in Node.js environments. Choose the appropriate connection mode according to your usage scenario:
 - Use the connect() function to connect and return a client instance
 - Uses callback functions to handle related logic in client events：
   - connect：Connection success event
   - reconnect：Connection error, abnormal disconnection and reconnection events
   - error：Connection error and termination of connection events
   - message：Receive subscription message event
 - client has several basic functions:  
   - subscribe(): Subscribe to a topic or topics
   - publish(): Publish a message to a topic
   - end(): Close the client

_Here we'll just give a brief introduction to the MQTT.js client, you can see for more details by [MQTT.js](https://www.npmjs.com/package/mqtt)_


## Quick Start

EMQ X uses 8083 ports for WebSocket connections, and 8084 for WebSocket with SSL.

Local connect url is: `ws://localhost:8083/mqtt`

The connect url can be split like： `ws:` // `localhost` : `8083` `/mqtt`

`protocol` // `domain` : `port ` / `path`

Connection code:

```js
// <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
// const mqtt = require('mqtt')
import mqtt from 'mqtt'

// connect options
const options = {
      connectTimeout: 4000,

      // Authentication
      clientId: 'emqx',
      // username: 'emqx',
      // password: 'emqx',

      keepalive: 60,
      clean: true,
}

// WebSocket connect url
const WebSocket_URL = 'ws://localhost:8083/mqtt'

// TCP/TLS connect url
const TCP_URL = 'mqtt://localhost:1883'
const TCP_TLS_URL = 'mqtts://localhost:8883'

const client = mqtt.connect(WebSocket_URL, options)

client.on('connect', () => {
    console.log('Connect success')
})

client.on('reconnect', (error) => {
    console.log('reconnecting:', error)
})

client.on('error', (error) => {
    console.log('Connect Error:', error)
})

```

You may have the following errors:

- Connection url does not specify protocol：WebSocket use `ws`(normal)、`wss`(with SSL) as protocol identifier. MQTT.js supports multiple protocols. Connection url need to specify protocol types;
- Connection url not specified port：The MQTT protocol does not specify WebSocket access ports. EMQ X defaults to `8083`、`8084` as non-encrypted and encrypted connection ports, respectively. The default port of the WebSocket protocol is the same as HTTP (80/443), if you not filling in the port indicates that the default port connection of the WebSocket is used; while the standard MQTT connection is used without specifying the port. For example, MQTT.js can connect to the standard MQTT 8083 port using `mqtt://localhost`, when the connection url is `mqtts://localhost` is connected to the 8884 port;
- Wrong path：EMQ X uses `/mqtt` as the WebSocket connection path by default, and it needs to be specified when connecting;
- The protocol does not match the port: the `wss` protocol is used to connect to the `8083` port;
- Use unencrypted WebSocket connections over HTTPS sites: Browsers such as Google Chrome automatically prohibit the use of unencrypted `ws` protocols to initiate connection requests under HTTPS sites;
- The certificate is not compatible with the connection address: the server side has configured the wrong SSL certificate.


## Publish

Publish a message to a topic using the `publish ()` function. The published topic must conform to the MQTT publishing topic rule, otherwise, the client will disconnect.

There is no need to subscribe to the topic before publish, but make sure that the client has successfully connected:


```js
// handle message event
client.on('message', (topic, message) => {
    console.log('Received form', topic, ':', message.toString())
})

// connect status
if (!client.connected) {
    console.log('Client not connected')
    return
}

// publich(topic, payload, options/callback)
client.publish('hello', 'hello EMQ X', (error) => {
    console.log(error || 'Publish Success')
})
```

## Subscribe

Subscribe topic only after a successful client connection. Subscribed topics must conform to the MQTT Subscribe Theme Rules.



Because of JavaScript's asynchronous and non-blocking nature, it is only after the connect event that the client is successfully connected. The `client.connected` property determines whether the connection is successful:

**Wrong examples**

```js
import mqtt from 'mqtt'

client = mqtt.connect('ws://localhost:8083/mqtt')
client.on('connect', handleConnect)
client.subscribe('hello')
client.publish('hello', 'Hello EMQ X')
```

**Correct example**

```js
client.on('connect', () => {
    console.log('Connect Success')
    client.subscribe('hello', { qos: 1 }, (error) => {
        if (!error) {
            cosnole.log('Subscribe Success')
            client.publish('hello', 'Hello EMQ X', { qos: 1, rein: false }, (error) => {
                console.log(error || 'Publish Success')
            })
        }
    })

    // Multiple subscriptions
    client.subscribe(
        ['hello', 'one/two/three/#', '#'],
        { qos: 1 },  
        (err) => {
          console.log(err || 'Subscribe Success')
        },
    )

    // Multiple subscriptions
    client.subscribe(
        [
            { hello: 1 },
            { 'one/two/three': 2 },
            { '#': 0 }
        ],
        (err) => {
          console.log(err || 'Subscribe Success')
        },
    )
})

```

## Unsubscribe

```js
client.unsubscribe(
    // topic, topic Array, topic Array-Onject
    'hello',
    (err) => {
      console.log(err || 'Unsubscribe Success')
    },
)
```



## Example

```js
// import MQTT.js
import mqtt from 'mqtt'
// <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
// const mqtt = require('mqtt')

// WebSocket connect url
const WebSocket_URL = 'ws://localhost:8083/mqtt'

// TCP/TLS connect url
const TCP_URL = 'mqtt://localhost:1883'
const TCP_TLS_URL = 'mqtts://localhost:8883'


const options = {
      connectTimeout: 4000,

      // Authentication
      clientId: 'emqx',
      // username: 'emqx',
      // password: 'emqx',

      keepalive: 60,
      clean: true,
}

const client = mqtt.connect(TCP_URL, options)

// after connect
client.on('connect', () => {
  console.log('Connected to', TCP_URL)

  client.subscribe('hello', (err) => {
    console.log(err || 'Subscribe Success')
  })

  client.publish('hello', 'Hello EMQ X', (err) => {
    console.log(err || 'Publish Success')
  })

})

// handle message event
client.on('message', (topic, message) => {
  console.log('Received form', topic, ':', message.toString())

  // disconnect
  client.end()
})

```

## Running result:
```bash
Connected to mqtt://localhost:1883
Publish Success
Subscribe Success
Received form hello : Hello EMQ X
```
