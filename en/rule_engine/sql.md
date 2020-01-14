# SQL Manual

> Compatibility tip: The EMQ X v4.0 makes great adjustments to the SQL syntax of the Rule Engine. For v3.x upgrade users, please refer to the [Migration Guide](./ rule_engine.md#migration-guide) for adaptation.

## SQL Statement

The SQL statement is used to filter out the fields from the original data according to the conditions and perform preprocessing and conversion. The basic format is as follows:

```
SELECT <field name> FROM <Topic> [WHERE <condition>]
```

1. Precautions
- The topic name after the FROM clause needs to be enclosed in double quotation marks ("").
- The WHERE clause is followed by a filter condition, which is enclosed in single quotes ('') if the string is used.
- In the SELECT clause, if you use the "." symbol to make nested selections of the payload, you must ensure that the payload is in JSON format.


## SQL Statement Example

1. Extract all fields from the messages with  a topic of "t/a":

    ```sql
    SELECT * FROM "t/a"
    ```


2. Extract all fields from the message with a topic that can match 't/#'. Note that the '=~' operator is used here for topic matching with wildcards.

    ```sql
    SELECT * FROM "t/#"
    ```

3. Extract the qos, username, and clientid fields from the message with a topic that can match 't/#'

    ```sql
    SELECT qos, username, clientid FROM "t/#"
    ```

4.  Extract the username field from any topic message with the filter criteria of username = 'u_emqx'

    ```sql
    SELECT username FROM "#" WHERE username='u_emqx'
    ```

5. Extract the x field from the payload of  message with any topic and create the alias x for use in the WHERE clause. The WHERE clause is restricted as x = 1. Note that the payload must be in JSON format. Example: This SQL statement can match the payload `{"x": 1}`, but can not match to the payload `{"x": 2}`

    ```sql
    SELECT payload as p, p.x as x FROM "#" WHERE x=1
    ```

6. Similar to the SQL statement above, but nested extract the data in the payload, this SQL statement can match the payload{"x": {"y": 1}}`

    ```sql
    SELECT payload as p, p.x.y as a FROM "#" WHERE a=1
    ```

7.  Try to connect when clientid = 'c1', extract its source IP address and port number

    ```sql
    SELECT peername as ip_port FROM "$events/client_connected" WHERE clientid = 'c1'
    ```

8. Filter all clientids that subscribe to the 't/#' topic and subscription level is QoS1. Note that the strict equality operator '=' is used here, so it does not match subscription requests with the topic 't' or 't/+/a'

    ```sql
    SELECT  clientid FROM "$events/session_subscribed" WHERE topic = 't/#' and qos = 1
    ```

## Event Topics

### Message Publish ($events/message_publish)

| Filed     | Data Type | Sample           | description                                                                                                                                                                                                         |
| --------- | --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | string    | --               | MQTT message id                                                                                                                                                                                                     |
| clientid  | string    |                  | clientid                                                                                                                                                                                                            |
| username  | string    | u_emqx           | Current MQTT username                                                                                                                                                                                               |
| payload   | string    | {"msg": "hello"} | The payload, if in JSON format, will be automatically decoded, and the object information will be obtained by using payload.x in SQL                                                                                |
| peerhost  | string    |                  | peerhost                                                                                                                                                                                                            |
| topic     | string    | t/a              | Currently MQTT topic can be filtered by wildcards in SQL.  When multiple topics are included in subscribe and unsubscribe, only the first one will be obtained here. To obtain all topics, please use topic_filters |
| qos       | integer   | 1                | Enumeration of message QoS 0,1,2                                                                                                                                                                                    |
| flags     | string    |                  | flags                                                                                                                                                                                                               |
| headers   | string    |                  | headers                                                                                                                                                                                                             |
| timestamp | integer   | 1576549961086    | Timestamp(millisecond)                                                                                                                                                                                              |
| node      | string    | emqx@127.0.0.1   | Node name of the trigger event                                                                                                                                                                                      |




### Message Delivered ($events/message_delivered)

| Filed         | Data Type | Sample           | description                                                                                                                                                                                                         |
| ------------- | --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| event         | string    | disconnect       | Trigger event name                                                                                                                                                                                                  |
| id            | string    | --               | MQTT message id                                                                                                                                                                                                     |
| from_clientid | string    |                  | from_clientid                                                                                                                                                                                                       |
| from_username | string    |                  | from_username                                                                                                                                                                                                       |
| clientid      | string    |                  | clientid                                                                                                                                                                                                            |
| username      | string    | u_emqx           | Current MQTT username                                                                                                                                                                                               |
| payload       | string    | {"msg": "hello"} | The payload, if in JSON format, will be automatically decoded, and the object information will be obtained by using payload.x in SQL                                                                                |
| peerhost      | string    |                  | peerhost                                                                                                                                                                                                            |
| topic         | string    | t/a              | Currently MQTT topic can be filtered by wildcards in SQL.  When multiple topics are included in subscribe and unsubscribe, only the first one will be obtained here. To obtain all topics, please use topic_filters |
| qos           | integer   | 1                | Enumeration of message QoS 0,1,2                                                                                                                                                                                    |
| flags         | string    |                  | flags                                                                                                                                                                                                               |
| timestamp     | integer   | 1576549961086    | Timestamp(millisecond)                                                                                                                                                                                              |
| node          | string    | emqx@127.0.0.1   | Node name of the trigger event                                                                                                                                                                                      |




### Message Acked ($events/message_acked)

| Filed         | Data Type | Sample           | description                                                                                                                                                                                                         |
| ------------- | --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| event         | string    | disconnect       | Trigger event name                                                                                                                                                                                                  |
| id            | string    | --               | MQTT message id                                                                                                                                                                                                     |
| from_clientid | string    |                  | from_clientid                                                                                                                                                                                                       |
| from_username | string    |                  | from_username                                                                                                                                                                                                       |
| clientid      | string    |                  | clientid                                                                                                                                                                                                            |
| username      | string    | u_emqx           | Current MQTT username                                                                                                                                                                                               |
| payload       | string    | {"msg": "hello"} | The payload, if in JSON format, will be automatically decoded, and the object information will be obtained by using payload.x in SQL                                                                                |
| peerhost      | string    |                  | peerhost                                                                                                                                                                                                            |
| topic         | string    | t/a              | Currently MQTT topic can be filtered by wildcards in SQL.  When multiple topics are included in subscribe and unsubscribe, only the first one will be obtained here. To obtain all topics, please use topic_filters |
| qos           | integer   | 1                | Enumeration of message QoS 0,1,2                                                                                                                                                                                    |
| flags         | string    |                  | flags                                                                                                                                                                                                               |
| timestamp     | integer   | 1576549961086    | Timestamp(millisecond)                                                                                                                                                                                              |
| node          | string    | emqx@127.0.0.1   | Node name of the trigger event                                                                                                                                                                                      |




### Message Dropped ($events/message_dropped)

| Filed     | Data Type | Sample           | description                                                                                                                                                                                                         |
| --------- | --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| event     | string    | disconnect       | Trigger event name                                                                                                                                                                                                  |
| id        | string    | --               | MQTT message id                                                                                                                                                                                                     |
| reason    | string    |                  | reason                                                                                                                                                                                                              |
| clientid  | string    |                  | clientid                                                                                                                                                                                                            |
| username  | string    | u_emqx           | Current MQTT username                                                                                                                                                                                               |
| payload   | string    | {"msg": "hello"} | The payload, if in JSON format, will be automatically decoded, and the object information will be obtained by using payload.x in SQL                                                                                |
| peerhost  | string    |                  | peerhost                                                                                                                                                                                                            |
| topic     | string    | t/a              | Currently MQTT topic can be filtered by wildcards in SQL.  When multiple topics are included in subscribe and unsubscribe, only the first one will be obtained here. To obtain all topics, please use topic_filters |
| qos       | integer   | 1                | Enumeration of message QoS 0,1,2                                                                                                                                                                                    |
| flags     | string    |                  | flags                                                                                                                                                                                                               |
| timestamp | integer   | 1576549961086    | Timestamp(millisecond)                                                                                                                                                                                              |
| node      | string    | emqx@127.0.0.1   | Node name of the trigger event                                                                                                                                                                                      |




### Client Connected ($events/client_connected)

| Filed           | Data Type | Sample          | description                          |
| --------------- | --------- | --------------- | ------------------------------------ |
| event           | string    | disconnect      | Trigger event name                   |
| clientid        | string    |                 | clientid                             |
| username        | string    | u_emqx          | Current MQTT username                |
| mountpoint      | string    | undefined       | Mountpoint for bridging messages     |
| peername        | string    | 127.0.0.1:63412 | Client peer name                     |
| sockname        | string    |                 | sockname                             |
| proto_name      | string    |                 | proto_name                           |
| proto_ver       | string    | 4               | 当前协议版本                               |
| keepalive       | integer   | 60              | Current client keepalive             |
| clean_start     | boolean   | false           | Clean Start                          |
| expiry_interval | string    |                 | expiry_interval                      |
| is_bridge       | string    |                 | --                                   |
| connected_at    | integer   | 1576549961086   | Timestamp for connected(millisecond) |
| timestamp       | integer   | 1576549961086   | Timestamp(millisecond)               |
| node            | string    | emqx@127.0.0.1  | Node name of the trigger event       |




### Client Disconnected ($events/client_disconnected)

| Filed           | Data Type | Sample          | description                    |
| --------------- | --------- | --------------- | ------------------------------ |
| event           | string    | disconnect      | Trigger event name             |
| reason          | string    |                 | reason                         |
| clientid        | string    |                 | clientid                       |
| username        | string    | u_emqx          | Current MQTT username          |
| peername        | string    | 127.0.0.1:63412 | Client peer name               |
| sockname        | string    |                 | sockname                       |
| disconnected_at | string    |                 | disconnected_at                |
| timestamp       | integer   | 1576549961086   | Timestamp(millisecond)         |
| node            | string    | emqx@127.0.0.1  | Node name of the trigger event |




### Session Subscribed ($events/session_subscribed)

| Filed     | Data Type | Sample         | description                                                                                                                                                                                                         |
| --------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| event     | string    | disconnect     | Trigger event name                                                                                                                                                                                                  |
| clientid  | string    |                | clientid                                                                                                                                                                                                            |
| username  | string    | u_emqx         | Current MQTT username                                                                                                                                                                                               |
| peerhost  | string    |                | peerhost                                                                                                                                                                                                            |
| topic     | string    | t/a            | Currently MQTT topic can be filtered by wildcards in SQL.  When multiple topics are included in subscribe and unsubscribe, only the first one will be obtained here. To obtain all topics, please use topic_filters |
| qos       | integer   | 1              | Enumeration of message QoS 0,1,2                                                                                                                                                                                    |
| timestamp | integer   | 1576549961086  | Timestamp(millisecond)                                                                                                                                                                                              |
| node      | string    | emqx@127.0.0.1 | Node name of the trigger event                                                                                                                                                                                      |




### Session Unsubscribed ($events/session_unsubscribed)

| Filed     | Data Type | Sample         | description                                                                                                                                                                                                         |
| --------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| event     | string    | disconnect     | Trigger event name                                                                                                                                                                                                  |
| clientid  | string    |                | clientid                                                                                                                                                                                                            |
| username  | string    | u_emqx         | Current MQTT username                                                                                                                                                                                               |
| peerhost  | string    |                | peerhost                                                                                                                                                                                                            |
| topic     | string    | t/a            | Currently MQTT topic can be filtered by wildcards in SQL.  When multiple topics are included in subscribe and unsubscribe, only the first one will be obtained here. To obtain all topics, please use topic_filters |
| qos       | integer   | 1              | Enumeration of message QoS 0,1,2                                                                                                                                                                                    |
| timestamp | integer   | 1576549961086  | Timestamp(millisecond)                                                                                                                                                                                              |
| node      | string    | emqx@127.0.0.1 | Node name of the trigger event                                                                                                                                                                                      |



