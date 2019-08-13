# Using Python to Develop an MQTT Client

Python is an easy-to-learn but yet powerful interpreted language. A python program is usually more succinct comparing to other languages. It's rich standard and third-party libraries allow users to focus on solving problems rather than the language itself, making it ideal for radip development.

This section provides a simple example to demonstrate how to write a python mqtt client using [paho-mqtt](https://www.eclipse.org/paho/) library. Paho is an open source project for MQTT from Eclipse, it includes implementation of major programming languages, python client library is one implementation of this project.


## Install paho-mqtt

If python is already in your system (Python comes with msot Linux distributions and MacOS, If you are under Windows, you may need to install it first), running following command will install paho-mqtt for python:

```bash
pip install paho-mqtt
```

Or you can create a virtual environment for your mqtt client project and install paho-mqtt, and make it isolated to other projects:

```bash
virtualenv mqtt-client
source mqtt-client/bin/active
pip install paho-mqtt
```

## Implement a Simple Client

paho-mqtt provides 3 classes: `Client`, `Publish` and `Subscribe`. The later two provide simple ways to publish messages and subscribe to topics, but they don't maintain a connection to broker. `Client` includes connection, publish, subscribe and callbacks. To write an MQTT client, the `Client` is usually used. We use it an instance of `Client` to open and maintain the connection to broker, subscribe and publish messages, and close the connection when necessary:
- Create an instance of client
- Use the connect*() function of Client instance to connect to broker
- Use loop*() function to maintain and process the connection and data flow between client and broker
- Use subscribe() to subscribe to topics
- Use publish() to publish messages
- Use disconnect() to disconnect from the broker


If there is events to be handled, a callback will be called.

_Here we just introduce the paho-mqtt python client briefly, for more information about the paho-mqtt, please refer to its [document](https://www.eclipse.org/paho/clients/python/docs/)_

### Initiate and create connection
The constructor of `Client`:
```python
Client(client_id="", clean_session=True, userdata=None, protocol=MQTTv311, transport="tcp")
```
The constructor takes the following arguments. Every argument has its default value:
- client_id: Client ID defined in MQTT protocol;
- clean_session: clean_session flag in MQTT protocol;
- userdata: user defined data of any type that is passed as the userdata parameter to callbacks;
- protocol: MQTT Protocol version;
- transport：the transport protocol, can be `tcp` or `websocket`.

Besides listed above, paho-mqtt provides also other functions to modify its behaviour. You can set the inflight window size, configure the TLS connection, set will message, configure the Logger and so on.

```python
# Import paho-mqtt Client class:
import paho.mqtt.client as mqtt

# Define the callback to handle CONNACK from the broker, if the connection created normal, the value of rc is 0
def on_connect(client, userdata, flags, rc):
    print("Connection returned with result code:" + str(rc))

# Define the callback to hande publish from broker, here we simply print out the topic and payload of the received message
def on_message(client, userdata, msg):
    print("Received message, topic:" + msg.topic + "payload:" + str(msg.payload))

# Callback handles disconnection, print the rc value
def on_disconnect(client, userdata, rc):
    print("Connection returned result:"+ str(rc))

# Create an instance of `Client`
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect= on_disconnect
client.on_message = on_message

# Connect to broker
# connect() is blocking, it returns when the connection is successful or failed. If you want client connects in a non-blocking way, you may use connect_async() instead
client.connect("192.168.1.165", 1883, 60)
```
### Network Loop

After connected to a broker, you will need to handle the network loop. if a loop*()function is not called, the incoming data will not be processed and outgoing data may not be sent in a timely fashion. There aare four function for managing the network loop: loop(), loop_forever(), loop_start() and loop_stop().

loop() is the basic form to use network loop functions provided by paho:
```python
loop(timeout = 1.0, max_packets = 1)
```
Call regularly to process network events. This call waits in select() until the network socket is available for reading or writing, if appropriate, then handles the incoming/outgoing data. This function blocks for up to timeout seconds. timeout must not exceed the keepalive value for the client or your client will be regularly disconnected by the broker.

The max_packets argument is obsolete and should be left unset.

`loop_forever()` This is a blocking form of the network loop and will not return until the client calls `disconnect()`. It automatically handles reconnecting.

`loop_start()/loop_stop()` hese functions implement a threaded interface to the network loop. Calling `loop_start()` once, before or after `connect*()`, runs a thread in the background to call `loop()` automatically. This frees up the main thread for other work that may be blocking. This call also handles reconnecting to the broker. Call `loop_stop()` to stop the background thread.

Example:
```python
client.loop_start()
```

### Publish
`publish()` function publishes a message to broker.
```python
publish(topic, payload=None, qos=0, retain=False)
```
`topic` it the topic of message. the lenth of `payload` and `qos` accorind to the defination in MQTT standard. `retain` is false by default.

`publish()` returns an MQTTMessageInfo object, the `rc` attribute of this object is the result of the publishing.the `mid` attribute is the message ID, for the information about other attributes and methods of this object, please refer to the paho [document](https://www.eclipse.org/paho/clients/python/docs/#publishing).

When the message has been sent to the broker, an `on_publish()` callback will be generated.

Example:
```python
client.publish("hello", payload = "Hello world!")
```

### Subscribe

`subscribe()` subscribes to one or more topics
```python
subscribe(topic, qos = 0)
```
There are three ways to call `subscribe()`:
- subscribe("my/topic", 2)  
**topic** is a string and **qos** is an integer, defaults to 0
- subscribe(("my/topic", 1))  
**topic** is a tuple, the first element of this tuple is a string for topic, the second element is an integer for qos. topic and qos must be in this tuple. the **qos** parameter is not used.
- subscribe([("my/topic", 0), ("another/topic", 2)])  
**topic** is a list of tuple, the elements in the list have the same format as the tuple above. **qos** is not used. By this way, multiple subscribing can be done in one call.

When the broker acknowledged the subscription, an `on_subscribe()` callback will be generated.

Example:
```python
client.subscribe([("temperature", 0), ("humidity", 0)])
```

### Unsubscribe

Unsubscribe a topic:
```python
unsubscribe(topic)
```
When the broker acknowledged the unsubscription, an `on_unsubscribe()` will be generated.

### Complete Example Code List

```python
#-*-coding:utf-8-*-

# Import paho-mqtt Client class:
import paho.mqtt.client as mqtt
import time
unacked_sub = [] # a list for unacknowledged subscription

# Define the callback to handle CONNACK from the broker, if the connection created normal, the value of rc is 0
def on_connect(client, userdata, flags, rc):
    print("Connection returned with result code:" + str(rc))


# Define the callback to hande publish from broker, here we simply print out the topic and payload of the received message
def on_message(client, userdata, msg):
    print("Received message, topic:" + msg.topic + "payload:" + str(msg.payload))

# Callback handles disconnection, print the rc value
def on_disconnect(client, userdata, rc):
    print("Disconnection returned result:"+ str(rc))

# Remove the message id from the list for unacknowledged subscription
def on_subscribe(client, userdata, mid, granted_qos):
    unacked_sub.remove(mid)


# Create an instance of `Client`
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect= on_disconnect
client.on_message = on_message
client.on_subscribe = on_subscribe

# Connect to broker
# connect() is blocking, it returns when the connection is successful or failed. If you want client connects in a non-blocking way, you may use connect_async() instead
client.connect("192.168.1.165", 1883, 60)

client.loop_start()

# Subscribe to a single topic
result, mid = client.subscribe("hello", 0)
unacked_sub.append(mid)
# Subscribe to multiple topics
result, mid = client.subscribe([("temperature", 0), ("humidity", 0)])
unacked_sub.append(mid)

while len(unacked_sub) != 0:
    time.sleep(1)

client.publish("hello", payload = "Hello world!")
client.publish("temperature", payload = "24.0")
client.publish("humidity", payload = "65%")

# Disconnection
time.sleep(5) # wait till all messages are processed
client.loop_stop()
client.disconnect()
```

### Running Result:
```bash
Connection returned with result code: 0
Received message, topic: hello payload: Hello world!
Received message, topic: temperature payload: 24.0
Received message, topic: humidity payload: 65%
Disconnection returned result: 0
```
