# 使用Python开发MQTT客户端

Python是一种简单易学而又功能强大的解释性语言，它语法简介，拥有丰富的标准库和第三方库，使用户能够专注于解决问题而非语言本身，非常适合快速开发。

本章节以简单的例子讲解如何建立一个初步的python MQTT客户端。在这里，我们会用到paho-mqtt库。[Paho](https://www.eclipse.org/paho/)是eclipse的一个开源MQTT项目，包含多种语言实现，python是其中之一。

## 安装paho-mqtt

如果在您的系统中已经有了Python环境（大多数linux发布和MacOS中已经包含Python环境，在Windows下需要单独安装），使用一下命令即可安装paho-mqtt：

```
pip install paho-mqtt
```

或者使用python虚拟环境`virtualenv`建立一个和其他项目隔离的mqtt客户端项目环境，然后在此环境中安装paho-mqtt：

```
virtualenv mqtt-client
source mqtt-client/bin/active
pip install paho-mqtt
```

## 实现一个简单的客户端

paho-mqtt提供了3个类，Client、Publish和Subscribe。后两者仅提供了简单的方法用于一次性的发送和接受消息，但并不保持连接。Client包含了连接、订阅、发送和回调函数。编写一个MQTT客户端，一般会使用Client类，用Client的实例来建立并维持和Broker的连接、订阅和发送消息，并在需要时断开连接：
 - 建立一个Client实例
 - 使用Client实例的connect*()函数进行连接
 - 用loop*()函数保持和处理客户端和borker之间连接和数据流
 - 使用subscribe()函数订阅主题
 - 使用publish()函数发布消息
 - 使用disconnect()函数连断开和broker的连接
在应用程序需要处理事件的时候，回调函数会被调用。

_这里我们只对Paho客户端的Python实现做简单的介绍，关于该客户端的更详尽的说明请参阅[官方文档](https://www.eclipse.org/paho/clients/python/docs/)。_

### 初始化和建立连接
使用Client类的构造函数如下：
```python
Client(client_id="", clean_session=True, userdata=None, protocol=MQTTv311, transport="tcp")
```
构造函数的参数定义了Client的基本属性，并都有缺省值:
- client_id：MQTT协议的client ID；
- clean_session：MQTT协议的clean_session属性；
- userdata：用户定义的任何类型的数据。会在回调函数中以userdata参数传递给该回调函数；
- protocol：使用的MQTT协议版本；
- transport：使用的传输协议。

除了以上这些基本属性，paho客户端的Client类还提供了其他函数来配置客户端，如设置Inflight窗口大小，配置TLS连接，设置Will消息，配置Logger等。
```python
# 导入paho-mqtt的Client：
import paho.mqtt.client as mqtt

# 用于响应服务器端CONNACK的callback，如果连接正常建立，rc值为0
def on_connect(client, userdata, flags, rc):
    print("Connection returned with result code: " + str(rc))

# 用于响应服务器端PUBLISH消息的callback，打印消息主题和内容
def on_message(client, userdata, msg):
    print("Received message, topic: " + msg.topic + " payload: " + str(msg.payload))

# 在连接断开时的callback，打印result code
def on_disconnect(client, userdata, rc):
    print("Connection returned result: "+ str(rc))

# 构造一个Client实例
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect= on_disconnect
client.on_message = on_message

# 连接broker
# connect()函数是阻塞的，在连接成功或失败后返回。如果想使用异步非阻塞方式，可以使用connect_async()函数。
client.connect("192.168.1.165", 1883, 60)
```
### 网络循环

在连接到broker之后，需要网络循环函数来处理消息收发和保持和broker的连接。paho提供 loop(), loop_forever()，loop_start()和loop_stop()四个函数处理网络循环。
最基本的方式是使用loop()函数:
```python
loop(timeout = 1.0, max_packets = 1)
```
参数中的timeout单位为秒，设置不应超过keepalive值，否则可能会导致经常性的断线。max_packets参数现已废弃，不应再使用。loop()函数会阻塞到select()调用返回套接字可读/写或者发生timeout。

`loop_forever()`以阻塞的方式处理网络循环，直到客户端调用disconnect()之前都不会返回。它自动处理重连。

`loop_start()/loop_stop()`以实现线程接口的方式异步非阻塞的处理网络循环。`loop_start()`会在后台起一个线程自动调用loop()函数，这样主线程可以处理其他工作。`loop_start()`函数自动处理重连。调用loop_stop()会中止这个后台线程。

例程：
```python
client.loop_start()
```

### 发布消息
`publish()`函数发送一条消息至broker。
```python
publish(topic, payload=None, qos=0, retain=False)
```
参数`topic`为发送消息的主题，不可为空。payload长度和qos参数的设定需要符合MQTT协议标准，retain默认是False。

`publish()`函数返回一个MQTTMessageInfo对象，该对象的rc属性为result code，mid属性为message ID。其他属性和方法请参阅[官方文档](https://www.eclipse.org/paho/clients/python/docs/#publishing)。

当消息被发送到broker之后，`on_publish()`回调函数会被调用。

例程：
```python
client.publish("hello", payload = "Hello world!")
```

### 订阅消息

`subscribe()`函数为客户端订阅一个或多个主题。
```python
subscribe(topic, qos = 0)
```
使用`subscribe()`函数有3种形式：
- subscribe("my/topic", 2)  
**topic** 为字符串，指定需要订阅的主题。**qos** 为订阅的QoS级别，默认为0
- subscribe(("my/topic", 1))  
**topic** 为二元组，二元组的第一个元素为字符串，指定需要订阅的主题，第二个元素为订阅的QoS级别。这两个元素都必须出现在元组内。**qos** 未使用。
- subscribe([("my/topic", 0), ("another/topic", 2)])  
**topic** 为一个二元组列表，列表中的元素同第二种方法。**qos** 未使用。这种方法可以以一次函数调用完成多个订阅。

当broker确认订阅以后，`on_subscribe()`回调函数会被调用。

例程：
```python
client.subscribe([("temperature", 0), ("humidity", 0)])
```

### 退订消息

退订一个主题：
```python
unsubscribe(topic)
```
当broker确认退订以后，`on_unsubscribe()`回调函数会被调用。

### 完整例程

```python
#-*-coding:utf-8-*-

# 导入paho-mqtt的Client：
import paho.mqtt.client as mqtt
import time
unacked_sub = [] #未获得服务器响应的订阅消息id列表

# 用于响应服务器端CONNACK的callback，如果连接正常建立，rc值为0
def on_connect(client, userdata, flags, rc):
    print("Connection returned with result code: " + str(rc))


# 用于响应服务器端PUBLISH消息的callback，打印消息主题和内容
def on_message(client, userdata, msg):
    print("Received message, topic: " + msg.topic + " payload: " + str(msg.payload))

# 在连接断开时的callback，打印result code
def on_disconnect(client, userdata, rc):
    print("Disconnection returned result: "+ str(rc))

# 在订阅获得服务器响应后，从为响应列表中删除该消息id
def on_subscribe(client, userdata, mid, granted_qos):
    unacked_sub.remove(mid)


# 构造一个Client实例
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect= on_disconnect
client.on_message = on_message
client.on_subscribe = on_subscribe

# 连接broker
# connect()函数是阻塞的，在连接成功或失败后返回。如果想使用异步非阻塞方式，可以使用connect_async()函数。
client.connect("192.168.1.165", 1883, 60)

client.loop_start()

#订阅单个主题
result, mid = client.subscribe("hello", 0)
unacked_sub.append(mid)
#订阅多个主题
result, mid = client.subscribe([("temperature", 0), ("humidity", 0)])
unacked_sub.append(mid)

while len(unacked_sub) != 0:
    time.sleep(1)

client.publish("hello", payload = "Hello world!")
client.publish("temperature", payload = "24.0")
client.publish("humidity", payload = "65%")

#断开连接
time.sleep(5) #等待消息处理结束
client.loop_stop()
client.disconnect()
```
运行结果：
```bash
Connection returned with result code: 0
Received message, topic: hello payload: Hello world!
Received message, topic: temperature payload: 24.0
Received message, topic: humidity payload: 65%
Disconnection returned result: 0
```
