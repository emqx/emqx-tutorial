#  DynamoDB 数据存储


本章节以在 `CentOS 7.2` 中的实际例子来说明如何通过 DynamoDB 来存储相关的信息。

Amazon DynamoDB 是一个完全托管的 NoSQL 数据库服务，支持键值和文档数据结构，可以提供快速的、可预期的性能，并且可以实现无缝扩展。

Amazon DynamoDB 由亚马逊作为 AWS 云产品组合的一部分提供。本处为了方便演示，利用 DynamoDB 可下载版本，在不访问 AWS DynamoDB 服务的情况下完成教程，实际生产环境仍推荐使用 AWS 相关服务。


## 安装 DynamoDB 服务器

读者可以参考 DynamoDB [官方文档](https://docs.aws.amazon.com/zh_cn/amazondynamodb/latest/developerguide/SettingUp.DynamoWebService.html) 或 [Docker](https://hub.docker.com/r/amazon/dynamodb-local) 来下载安装 DynamoDB，本文章使用 DynamoDB 1.11 版本。



## 配置 EMQ X 服务器

通过 RPM 方式安装的 EMQ DynamoDB 相关的配置文件位于 `/etc/emqx/plugins/emqx_backend_dynamo.conf`，如果只是测 DynamoDB 持久化的功能，大部分配置不需要做更改。

本示例依赖 AWS CLI，安装方式请参照 [使用捆绑安装程序安装 AWS CLI (Linux, macOS, or Unix)](https://docs.aws.amazon.com/zh_cn/cli/latest/userguide/install-bundle.html)。

选用本地测试只需配置 `server` 参数，使用 DynamoDB 服务则需配置 `region`、`access_key_id`、`secret_access_key` 以进行 AWS 服务认证：

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

## 功能配置，按需注释即可屏蔽相关功能
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

保持剩下部分的配置文件不变，然后需要启动该插件。启动插件的方式有 `命令行`和 `控制台` 两种方式，读者可以任选其一。



## 客户端在线状态存储

客户端上下线时，插件将更新在线状态、上下线时间、节点客户端列表到 DynamoDB 数据库。与 MongoDB 不同，DynamoDB 需要手动定义表结构指定主键为 `clientid` 如下：

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

通过命令行创建数据表：

```bash
aws dynamodb create-table \
    --table-name mqtt_client \
    --attribute-definitions \
        AttributeName=clientid,AttributeType=S \
    --key-schema AttributeName=clientid,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
		--region us-west-2 --endpoint-url  http://localhost:8000
```



使用 WebSocket 测试工具测试，设备上、下线时插件会往数据库写入/更新设备在线状态，通过以下命令查询：

```bash
aws dynamodb scan --table-name mqtt_client --region us-west-2 --endpoint-url  http://localhost:8000
```

查询结果如下，`connect_state` 字段为在线状态，1 表示在线， 0 表示离线：

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





## 客户端 Retain 消息存储

客户端发布 Retain 消息时，将 Retain 消息存储到数据库，满足条件的 Topic 被订阅后， Retain 消息将自动发布到客户端。



### 使用示例

初始化 `mqtt_retain` 表，用于存储订阅关系：

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



通过命令行创建数据表：

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



使用 WebSocket 测试工具测试，消息发布时勾选 `保留` 选项， 设备发布消息、订阅信息变更时，插件会从数据库写入/查询 Retain 消息并发布到订阅主题，通过以下命令查询当前 Retain 列表：

```bash
aws dynamodb scan --table-name mqtt_retain --region us-west-2 --endpoint-url  http://localhost:8000
```

![image-20190722112649536](assets/image-20190722112649536.png)



数据库中存储 Retain 消息如下：

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





## 客户端订阅关系存储

客户端订阅/取消订阅时，向数据库插入/删除当前订阅关系。



### 使用示例

初始化 `mqtt_sub` 表，用于存储设备订阅关系：

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



通过命令行创建数据表：

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



使用 WebSocket 测试工具测试，设备订阅信息变更时，插件会往数据库写入/更新设备订阅关系，通过以下命令查询：

```bash
aws dynamodb scan --table-name mqtt_sub --region us-west-2 --endpoint-url  http://localhost:8000
```

订阅 `testtopic` 后，查询数据库中存储信息如下：

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





## 客户端发布消息存储

客户端发布消息时，将消息及消息映射关系存储到数据库。



### 使用示例

初始化 `mqtt_msg` 表，用于存储 MQTT 消息：

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

通过命令行创建数据表：

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



初始化 `mqtt_topic_msg_map` 表，用于存储主题和消息的映射关系：

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

通过命令行创建数据表：

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

使用 WebSocket 测试工具测试，消息发布时将写入到以上两个数据集合，查询信息如下：

```bash
aws dynamodb scan --table-name mqtt_msg --region us-west-2 --endpoint-url  http://localhost:8000

aws dynamodb scan --table-name mqtt_topic_msg_map --region us-west-2 --endpoint-url  http://localhost:8000
```



数据库中存储消息数据如下：

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



数据库中存储消息、订阅关系如下(通过 Message ID 关联主题)：

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





## 客户端接收消息 ACK 存储

客户端接收 QoS > 0 的消息时，将消息存储到数据库。



### 使用示例

初始化 `mqtt_acked` 表，用于存储确认的 MQTT 消息：

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

通过命令行创建数据表：

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



使用 WebSocket 测试工具测试订阅并发送 QoS 1 的消息，消息发布时将写入到数据库，查询信息如下：

```bash
aws dynamodb scan --table-name mqtt_acked --region us-west-2 --endpoint-url  http://localhost:8000
```



数据库中存储消息数据如下：

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



## 总结

读者在理解了 DynamoDB 中所存储的数据结构，各个阶段消息存储方式，可以结合 DynamoDB 拓展相关应用。

