# 使用 Java 开发 MQTT 客户端

本章节以简单的例子讲解如何写一个 Java MQTT 客户端，社区中有几个 Java MQTT 库，包括有，

- Paho： [Paho](https://www.eclipse.org/paho/)是 Eclipse 的一个开源 MQTT 项目，包含多种语言实现，Java 是其中之一
- Fusesource：[Fusesource](https://github.com/fusesource/mqtt-client)是另外一个开源的 Java MQTT 库，但是该项目已经不活跃，大约有 2 年时间没有更新

此处以社区中比较活跃的 [java-paho](https://www.eclipse.org/paho/clients/java/) 为例来说明使用 Java 开发 MQTT 客户端的过程。

## 安装 java-paho

本例中使用 Maven 来管理依赖的库文件，打开 `pom.xml`，加入以下的 JAR 依赖，等待完成相关 JAR 包的下载。

```xml
<dependency>
	<groupId>org.eclipse.paho</groupId>
	<artifactId>org.eclipse.paho.client.mqttv3</artifactId>
	<version>1.2.0</version>
</dependency>
```



##  实现一个简单的客户端

这部分实现的例子比较简单，利用 paho 提供的 `MqttClient`，实现了以下的功能，

- EMQ X 服务器的连接
- 连接建立成功后，订阅主题 `demo/topics`，并且设置了回调的 Listener，当有消息转发到该主题的时候就调用此方法
- 调用 `publish` 方法来实现对主题 `demo/topics` 的消息发送



## 初始化和建立连接

构造 `MqttClient` 的构造函数如下，

```java
MqttClient(String serverURI, String clientId, MqttClientPersistence persistence)
```

- serverURI：EMQ X 的服务器地址，在此处为 `tcp://localhost:1883`
- clientId：标识该客户端的唯一 ID，此 ID 在同一个 EMQ X 服务器中必须保证唯一，否则在服务器端在处理 session 的时候会有问题
- MqttClientPersistence：本地消息的持久化实例，在本地消息处理过程在涉及到服务器端忙碌或者不可用等状态的时候，需要对消息进行持久化的处理，在这里可以传入持久化处理的类实例。

建立连接的代码如下所示，

```java
package paho_demo;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

public class Demo {
	public static void main(String[] args) {
		String broker = "tcp://localhost:1883";
		String clientId = "JavaSample";
         //Use the memory persistence
		MemoryPersistence persistence = new MemoryPersistence();

		try {
			MqttClient sampleClient = new MqttClient(broker, clientId, persistence);
			MqttConnectOptions connOpts = new MqttConnectOptions();
			connOpts.setCleanSession(true);
			System.out.println("Connecting to broker:" + broker);
			sampleClient.connect(connOpts);
			System.out.println("Connected");
		} catch (MqttException me) {
			System.out.println("reason" + me.getReasonCode());
			System.out.println("msg" + me.getMessage());
			System.out.println("loc" + me.getLocalizedMessage());
			System.out.println("cause" + me.getCause());
			System.out.println("excep" + me);
			me.printStackTrace();
		}
	}
}
```

执行该段代码后，如果能够成功连上服务器，在控制台中将打印出如下内容。如果发生异常，请根据异常信息来定位和修复问题。

```bash
Connecting to broker: tcp://localhost:1883
Connected
```



## 订阅消息

连接建立成功之后，可以进行主题订阅。`MqttClient` 提供了多个 `subscribe` 方法，可以实现不同方式的主题订阅。主题可以是明确的单个主题，也可以用通配符 `#` 或者 `+`。

```java
subscribe(java.lang.String topicFilter)
```

订阅主题后，设置一个回调实例 `MqttCallback`，在消息转发过来的时候将调用该实例的方法。消息订阅部分的代码如下所示。

```java
String topic = "demo/topics";
System.out.println("Subscribe to topic:" + topic);
sampleClient.subscribe(topic);

sampleClient.setCallback(new MqttCallback() {
	public void messageArrived(String topic, MqttMessage message) throws Exception {
		String theMsg = MessageFormat.format("{0} is arrived for topic {1}.", new String(message.getPayload()), topic);
		System.out.println(theMsg);
	}

	public void deliveryComplete(IMqttDeliveryToken token) {
	}
				
	public void connectionLost(Throwable throwable) {
	}
});
```

在消息转发成功后，控制台会打印转发的消息以及针对的主题。

## 发布消息

`MqttClient` 的 `publish` 方法用于发布消息

```java
publish(java.lang.String topic, MqttMessage message)
```

- topic：主题名称
- MqttMessage：消息内容

`MqttClient` 还提供了以下的方法，用户可以在发布消息的时候指定 QoS，以及消息是否需要保持。

```java
publish(java.lang.String topic, byte[] payload, int qos, boolean retained)
```

发布消息的代码如下所示，

```java
String topic = "demo/topics";
String content = "Message from MqttPublishSample";
int qos = 2;
System.out.println("Publishing message:" + content);
MqttMessage message = new MqttMessage(content.getBytes());
message.setQos(qos);
sampleClient.publish(topic, message);
System.out.println("Message published");
```



## 完整例程



```java
package paho_demo;

import java.text.MessageFormat;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

public class Demo {
	public static void main(String[] args) {
		String broker = "tcp://localhost:1883";
		String clientId = "JavaSample";
        //Use the memory persistence
		MemoryPersistence persistence = new MemoryPersistence();

		try {
			MqttClient sampleClient = new MqttClient(broker, clientId, persistence);
			MqttConnectOptions connOpts = new MqttConnectOptions();
			connOpts.setCleanSession(true);
			System.out.println("Connecting to broker:" + broker);
			sampleClient.connect(connOpts);
			System.out.println("Connected");
			
			String topic = "demo/topics";
			System.out.println("Subscribe to topic:" + topic);
			sampleClient.subscribe(topic);
			sampleClient.setCallback(new MqttCallback() {
				public void messageArrived(String topic, MqttMessage message) throws Exception {
					String theMsg = MessageFormat.format("{0} is arrived for topic {1}.", new String(message.getPayload()), topic);
					System.out.println(theMsg);
				}
				
				public void deliveryComplete(IMqttDeliveryToken token) {
				}
				
				public void connectionLost(Throwable throwable) {
				}
			});

			
			String content = "Message from MqttPublishSample";
			int qos = 2;
			System.out.println("Publishing message:" + content);
			MqttMessage message = new MqttMessage(content.getBytes());
			message.setQos(qos);
			sampleClient.publish(topic, message);
			System.out.println("Message published");

		} catch (MqttException me) {
			System.out.println("reason" + me.getReasonCode());
			System.out.println("msg" + me.getMessage());
			System.out.println("loc" + me.getLocalizedMessage());
			System.out.println("cause" + me.getCause());
			System.out.println("excep" + me);
			me.printStackTrace();
		}
	}
}
```



### 运行结果

```bash
Connecting to broker: tcp://localhost:1883
Connected
Subscribe to topic: demo/topics
Publishing message: Message from MqttPublishSample
Message published
Message from MqttPublishSample is arrived for topic demo/topics.
```

