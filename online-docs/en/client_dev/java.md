# Using Java

This section provides a simple example of how to code a Java MQTT client with several Java MQTT libraries in the community, including

- Paho： [Paho](https://www.eclipse.org/paho/) is an open source MQTT project of Eclipse, including multi-language implementation, Java is one of them.
- Fusesource：[Fusesource](https://github.com/fusesource/mqtt-client) is another open source Java MQTT library, but the project is not active and has not been updated for about two years.

This article takes the more populate [java-paho](https://www.eclipse.org/paho/clients/java/) in the community as an example to illustrate the process of developing MQTT client using Java.

## Installation

In this example, Maven is used to manage the dependent library files, open `pom.xml' file to add the following JAR dependencies. Wait for the relevant JAR packages to be downloaded.

```xml
<dependency>
	<groupId>org.eclipse.paho</groupId>
	<artifactId>org.eclipse.paho.client.mqttv3</artifactId>
	<version>1.2.0</version>
</dependency>
```



## A simple client

The example of this part is relatively simple, and the following functions are realized by using `MqttClient` provided by Paho.

- Connect to EMQ X
- Subscribe topic `demo/topics`. Set a callback listener, which is called when a message is forwarded to the topic.
- Invoke the `publish` method to send messages to the topic `demo/topics`.



## Quick Start

The constructor for `MqttClient`:

```java
MqttClient(String serverURI, String clientId, MqttClientPersistence persistence)
```

- serverURI: EMQ X's connect url, like `tcp://localhost:1883`
- clientId: Identify the unique ID of the client, which must be guaranteed to be unique in the same EMQ X server, otherwise the server will have problems processing sessions
- MqttClientPersistence: A persistent instance of a local message needs to be persisted when the local message processing involves busy or unavailable state on the server side, where a persistent class instance can be passed in

Code examples

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

Executing this code, if you can successfully connect to the server, the following will be printed out in the console. If an exception occurs, locate and fix the problem according to the exception information.

```bash
Connecting to broker: tcp://localhost:1883
Connected
```



## Subscribe

Subscriptions can only be made after a successful connection establishment. `MqttClient` provides multiple `subscribe` methods that enable different ways of subscribing to topics. The theme can be a clear single topic or a wildcard character.

```java
subscribe(java.lang.String topicFilter)
```

Set up a callback instance `MqttCallback` on subscribe success. The function of calling the instance is called when receive message. The code for the message subscription section is:

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

The console will print and forward messages as well as the targeted topic when the message is sent successfully.


## Publish

The `publish` method of `MqttClient` is used to publish messages.

```java
publish(java.lang.String topic, MqttMessage message)
```

- topic：target topic
- MqttMessage：payload

`MqttClient` also provides a way for users to specify QoS at the time of publishing a message and whether the message needs to be maintained:

```java
publish(java.lang.String topic, byte[] payload, int qos, boolean retained)
```

Code for publish:

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



## Example



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



### Running result:

```bash
Connecting to broker: tcp://localhost:1883
Connected
Subscribe to topic: demo/topics
Publishing message: Message from MqttPublishSample
Message published
Message from MqttPublishSample is arrived for topic demo/topics.
```
