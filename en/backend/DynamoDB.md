# DynamoDB Data Storage



This section shows how to store related information through DynamoDB with a practical example in `CentOS 7.2`.

Amazon DynamoDB is a fully hosted proprietary NoSQL database service that supports key values and document data structures and is provided by Amazon as part of its AWS cloud portfolio. For the convenience of the demo, the DynamoDB downloadable version is used to complete the tutorial without accessing the DynamoDB web service. AWS related services are still recommended in the actual production environment.

## Install the DynamoDB server

Readers can refer to DynamoDB Official [Documentation](https://docs.aws.amazon.com/en_us/amazondynamodb/latest/developerguide/SettingUp.DynamoWebService.html) or [Docker](https://hub.docker.com/ r/amazon/dynamodb-local) To download and install DynamoDB, and DynamoDB version 1.11 is used in this article.



## Configure the EMQ X server

The configuration files related to EMQ DynamoDB installed by RPM are located in `/etc/emqx/plugins/emqx_backend_dynamo.conf`. Most configurations do not need to be changed if only the function of DynamoDB persistence is tested.

This example relies on the AWS CLI. For the installation method, please refer to [Installing the AWS CLI (Linux, macOS, or Unix) using the bundled installer](https://docs.aws.amazon.com/en_us/cli/latest/userguide/install- Bundle.html).

For local testing, just configure the `server` parameter. For the DynamoDB service, configure `region`, `access_key_id`, `secret_access_key` for AWS service authentication:

```bash
## DynamoDB region
backend.dynamo.region = us-west-2

## DynamoDB Server
backend.dynamo.pool1.server = http://localhost:8000

## DynamoDB Pool Size
backend.dynamo.pool1.pool_size = 8

## AWS ACCESS KEY ID
backend.dynamo.pool1.aws_access_key_id = AKIAU5IM2XOC7AQWG7HK

## AWS SECRET ACCESS KEY
backend.dynamo.pool1.aws_secret_access_key = TZt7XoRi+vtCJYQ9YsAinh19jR1rngm/hxZMWR2P

## For function configuration, on-demand annotation can shield related functions
## DynamoDB Backend Hooks
backend.dynamo.hook.client.connected.1    = {"action": {"function": "on_client_connected"}, "pool": "pool1"}
backend.dynamo.hook.session.created.1     = {"action": {"function": "on_subscribe_lookup"}, "pool": "pool1"}
backend.dynamo.hook.client.disconnected.1 = {"action": {"function": "on_client_disconnected"}, "pool": "pool1"}
backend.dynamo.hook.session.subscribed.1  = {"topic": "#", "action": {"function": "on_message_fetch_for_queue"}, "pool": "pool1"}
backend.dynamo.hook.session.subscribed.2  = {"topic": "#", "action": {"function": "on_retain_lookup"}, "pool": "pool1"}
backend.dynamo.hook.session.unsubscribed.1= {"topic": "#", "action": {"function": "on_acked_delete"}, "pool": "pool1"}
backend.dynamo.hook.message.publish.1     = {"topic": "#", "action": {"function": "on_message_publish"}, "pool": "pool1"}
backend.dynamo.hook.message.publish.2     = {"topic": "#", "action": {"function": "on_message_retain"}, "pool": "pool1"}
backend.dynamo.hook.message.publish.3     = {"topic": "#", "action": {"function": "on_retain_delete"}, "pool": "pool1"}
backend.dynamo.hook.message.acked.1       = {"topic": "#", "action": {"function": "on_message_acked_for_queue"}, "pool": "pool1"}

```

Leave the rest of the configuration file unchanged and then launch the plugin. There are two ways to start the plugin: `command line` and `console`. Readers can choose one of them.



## Client online state storage

When the client goes online and offline, the plugin will update the online status, online and offline time, and node client list to the DynamoDB database. Unlike MongoDB,  it is required to manually define the table structure in DynamoDB to specify the primary key as `clientid` as follows:

```bash
{
  "TableName": "mqtt_client",
  "KeySchema": [
    {
      "AttributeName": "clientid",
      "KeyType": "HASH"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "clientid",
      "AttributeType": "S"
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 5,
    "WriteCapacityUnits": 5
  }
}
```

Create a data table with the command line:

```bash
aws dynamodb create-table \
    --table-name mqtt_client \
    --attribute-definitions \
        AttributeName=clientid,AttributeType=S \
    --key-schema AttributeName=clientid,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--region us-west-2 --endpoint-url  http://localhost:8000
```



Using the WebSocket test tool, the plug-in writes/updates the online status of the device to the database when the device is online or offline, and inquires through the following commands:

```bash
aws dynamodb scan --table-name mqtt_client --region us-west-2 --endpoint-url  http://localhost:8000
```

The query results are as follows, the `connect_state` field is the status of online, 1 means online, 0 means offline:

```json
{
    "Count": 1,
    "Items": [
        {
            "node": {
                "S": "emqx@127.0.0.1"
            },
            "connect_state": {
                "N": "1"
            },
            "online_at": {
                "N": "1563765246"
            },
            "offline_at": {
                "N": "0"
            },
            "clientid": {
                "S": "mqttjs_34f653fdcc"
            }
        }
    ],
    "ScannedCount": 1,
    "ConsumedCapacity": null
}
```





## Client Retain message store

When the client publishes the Retain message, the Retain message is stored in the database. After the qualified Topic is subscribed, the Retain message will be automatically published to the client.

### Example

Initialize the `mqtt_retain` table to store the subscription relationship:

```bash
{
  "TableName": "mqtt_retain",
  "KeySchema": [
    { "AttributeName": "topic", "KeyType": "HASH" }
  ],
  "AttributeDefinitions": [
    { "AttributeName": "topic", "AttributeType": "S" }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 5,
    "WriteCapacityUnits": 5
  }
}
```



Create a data table with the command line:

```bash
aws dynamodb create-table \
    --table-name mqtt_retain \
    --attribute-definitions \
        AttributeName=topic,AttributeType=S \
    --key-schema \
    		AttributeName=topic,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--region us-west-2 --endpoint-url  http://localhost:8000
```



Using the WebSocket test tool, when a message is published, the option of `reserve'is checked. When the information  relevant with device publishing or subscribing changes, the plug-in writes/queries the Retain message from the database and publishes it to the subscription topic. The current Retain list is queried by the following commands:

```bash
aws dynamodb scan --table-name mqtt_retain --region us-west-2 --endpoint-url  http://localhost:8000
```

![image-20190722112649536](/emqx/emqx-tutorial/zh/backend/assets/image-20190722112649536.png)



Retain messages stored in the database  are  as follows:

```json
{
    "Count": 1,
    "Items": [
        {
            "qos": {
                "N": "0"
            },
            "sender": {
                "S": "mqttjs_17137f2af0"
            },
            "msgid": {
                "S": "Mjg4NDYzOTExMTcxNzQ5MTQwMjU1NzgyMDgxNzU1ODczMjJ"
            },
            "topic": {
                "S": "testtopic"
            },
            "arrived": {
                "N": "1563765995"
            },
            "retain": {
                "N": "1"
            },
            "payload": {
                "S": "{ \"msg\": \"Hello, World!\" }"
            }
        }
    ],
    "ScannedCount": 1,
    "ConsumedCapacity": null
}

```





## Client subscription relationship storage

When the client subscribes/unsubscribes, the current subscription relationship is inserted/deleted to the database.



### Example

Initialize the `mqtt_sub` table for storage device subscription relationships:

```bash
{
  "TableName": "mqtt_sub",
  "KeySchema": [
    {
      "AttributeName": "clientid",
      "KeyType": "HASH"
    },
    {
      "AttributeName": "topic",
      "KeyType": "RANGE"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "clientid",
      "AttributeType": "S"
    },
    {
      "AttributeName": "topic",
      "AttributeType": "S"
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 5,
    "WriteCapacityUnits": 5
  }
}

```



Create a data table with the command line:

```bash
aws dynamodb create-table \
    --table-name mqtt_sub \
    --attribute-definitions \
        AttributeName=clientid,AttributeType=S AttributeName=topic,AttributeType=S \
    --key-schema \
    		AttributeName=clientid,KeyType=HASH AttributeName=topic,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--region us-west-2 --endpoint-url  http://localhost:8000

```



Using WebSocket test tool, when the subscription information of the device changes, the plug-in will write/update the subscription relationship of the device to the database, and query it through the following commands:

```bash
aws dynamodb scan --table-name mqtt_sub --region us-west-2 --endpoint-url  http://localhost:8000

```

After subscribing to `testtopic`, the information stored in the query database is as follows:

```json
{
  "Items": [
    {
      "qos": {
        "N": "0"
      },
      "topic": {
        "S": "testtopic"
      },
      "clientid": {
        "S": "mqttjs_17137f2af0"
      }
    }
  ],
  "Count": 1,
  "ScannedCount": 1,
  "ConsumedCapacity": null
}

```





## Client published message storage

When a client publishes a message, it stores the message and its mapping relationship into the database.



### Example

Initialize the `mqtt_msg` table to store MQTT messages:

```bash
{
  "TableName": "mqtt_msg",
  "KeySchema": [
    { "AttributeName": "msgid", "KeyType": "HASH" }
  ],
  "AttributeDefinitions": [
    { "AttributeName": "msgid", "AttributeType": "S" }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 5,
    "WriteCapacityUnits": 5
  }
}

```

Create a data table with the command line:

```bash
aws dynamodb create-table \
    --table-name mqtt_msg \
    --attribute-definitions \
        AttributeName=msgid,AttributeType=S \
    --key-schema \
    		AttributeName=msgid,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--region us-west-2 --endpoint-url  http://localhost:8000

```



Initialize the `mqtt_topic_msg_map` table to store the mapping of topics and messages:

```bash
{
  "TableName": "mqtt_topic_msg_map",
  "KeySchema": [
    { "AttributeName": "topic", "KeyType": "HASH" }
  ],
  "AttributeDefinitions": [
    { "AttributeName": "topic", "AttributeType": "S" }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 5,
    "WriteCapacityUnits": 5
  }
}

```

Create a data table with the command line:

```bash
aws dynamodb create-table \
    --table-name mqtt_topic_msg_map \
    --attribute-definitions \
        AttributeName=topic,AttributeType=S \
    --key-schema \
    		AttributeName=topic,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--region us-west-2 --endpoint-url  http://localhost:8000

```



<hr>

Using the WebSocket test tool, the message will be written to the above two data sets when it is published. The query information is as follows:

```bash
aws dynamodb scan --table-name mqtt_msg --region us-west-2 --endpoint-url  http://localhost:8000

aws dynamodb scan --table-name mqtt_topic_msg_map --region us-west-2 --endpoint-url  http://localhost:8000

```



Message data  stored in the database is as follows:

```json
{
    "Count": 1,
    "Items": [
        {
            "qos": {
                "N": "1"
            },
            "sender": {
                "S": "mqttjs_17137f2af0"
            },
            "msgid": {
                "S": "Mjg4NDY0MDMyMDA2MzI0MjA4MTcxNDYwNjk0MjQ5MzA4MTJ"
            },
            "topic": {
                "S": "testtopic"
            },
            "arrived": {
                "N": "1563766650"
            },
            "retain": {
                "N": "0"
            },
            "payload": {
                "S": "{ \"msg\": \"Hello, World!\" }"
            }
        }
    ],
    "ScannedCount": 1,
    "ConsumedCapacity": null
}

```



Messages and subscriptions are stored in the database as follows (related topics through Message ID):

```json
{
    "Count": 1,
    "Items": [
        {
            "topic": {
                "S": "testtopic"
            },
            "MsgId": {
                "SS": [
                    "Mjg4NDY0MDMyMDA2MzI0MjA4MTcxNDYwNjk0MjQ5MzA4MTJ"
                ]
            }
        }
    ],
    "ScannedCount": 1,
    "ConsumedCapacity": null
}

```





## ACK Storage for Client Receiving Messages

When the client receives a message with QoS > 0, it stores the message in the database.



### Example

Initialize the `mqtt_acked` table to store the confirmed MQTT message:

```bash
{
  "TableName": "mqtt_acked",
  "KeySchema": [
    { "AttributeName": "topic", "KeyType": "HASH" },
    { "AttributeName": "clientid", "KeyType": "RANGE" }
  ],
  "AttributeDefinitions": [
    { "AttributeName": "topic", "AttributeType": "S" },
    { "AttributeName": "clientid", "AttributeType": "S" }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 5,
    "WriteCapacityUnits": 5
  }
}

```

Create a data table with the command line:

```bash
aws dynamodb create-table \
    --table-name mqtt_acked \
    --attribute-definitions \
        AttributeName=topic,AttributeType=S  AttributeName=clientid,AttributeType=S \
    --key-schema \
    		AttributeName=topic,KeyType=HASH AttributeName=clientid,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--region us-west-2 --endpoint-url  http://localhost:8000

```

Use the WebSocket test tool to test the subscription and send a QoS 1 message, which will be written to the database when the message is published. The query information is as follows:

```bash
aws dynamodb scan --table-name mqtt_acked --region us-west-2 --endpoint-url  http://localhost:8000

```



The message data stored in the database is as follows:

```json
{
    "Count": 1,
    "Items": [
        {
            "topic": {
                "S": "testtopic"
            },
            "msgid": {
                "S": "Mjg4NDY1NDAxMjczMzcyMjUwMjExOTc1MzY4MDY4MzAwODB"
            },
            "clientid": {
                "S": "mqttjs_673dd52f4f"
            }
        }
    ],
    "ScannedCount": 1,
    "ConsumedCapacity": null
}

```



## summary

After understanding the data structure stored in DynamoDB and the way of storing messages at various stages, readers can use DynamoDB to extend related applications.