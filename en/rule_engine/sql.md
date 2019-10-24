# SQL Manual

## Important Upgrade

EMQ X v3.4.0 and earlier:

```sql
SELECT
  payload.host as host,
  payload.location as location,
  payload.internal as internal,
  payload.external as external
FROM
  "message. publish"
```

EMQ X v3.4.1 and later:

```sql
SELECT
  json_ decode(payload) as p, -- Need to decode the payload field manually
  p.host as host,
  p.location as location,
  p.internal as internal,
  p.external as external
FROM
  "message. publish"
```

## SQL  Statement

The SQL statement is used to filter out the fields from the original data according to the conditions and perform preprocessing and conversion. The basic format is as follows:

```
SELECT <field name> FROM <trigger event> [WHERE <condition>]
```

1. Precautions
- The topic name after the FROM clause needs to be enclosed in double quotation marks ("").
- The WHERE clause is followed by a filter condition, which is enclosed in single quotes ('') if the string is used.
- In the SELECT clause, if you use the "." symbol to make nested selections of the payload, you must ensure that the payload is in JSON format.


## SQL Statement Example

1. Extract all fields from the messages with  a topic of "t/a":

    ```sql
    SELECT * FROM "message.publish" WHERE topic = 't/a'
    ```



2. Extract all fields from the message with a topic that can match 't/#'. Note that the '=~' operator is used here for topic matching with wildcards.

    ```sql
    SELECT * FROM "message.publish" WHERE topic =~ 't/#'
    ```

3. Extract the qos, username, and client_id fields from the message with a topic that can match 't/#'

    ```sql
    SELECT qos, username, client_id FROM "message.publish" WHERE topic =~ 't/#'
    ```

4.  Extract the username field from any topic message with the filter criteria of username = 'u_emqx'

    ```sql
    SELECT username FROM "message.publish" WHERE username='u_emqx'
    ```

5. Extract the x field from the payload of  message with any topic and create the alias x for use in the WHERE clause. The WHERE clause is restricted as x = 1. Note that the payload must be in JSON format. Example: This SQL statement can match the payload `{"x": 1}`, but can not match to the payload `{"x": 2}`

    ```sql
    SELECT json_decode(payload) as p, p.x as x FROM "message.publish" WHERE x=1
    ```

6. Similar to the SQL statement above, but nested extract the data in the payload, this SQL statement can match the payload{"x": {"y": 1}}`

    ```sql
    SELECT json_decode(payload) as p, p.x.y as a FROM "message.publish" WHERE a=1
    ```

7.  Try to connect when client_id = 'c1', extract its source IP address and port number

    ```sql
    SELECT peername as ip_port FROM "client.connected" WHERE client_id = 'c1'
    ```

8. Filter all client_ids that subscribe to the 't/#' topic and subscription level is QoS1. Note that the strict equality operator '=' is used here, so it does not match subscription requests with the topic 't' or 't/+/a'

    ```sql
    SELECT  client_id FROM "client.subscribe" WHERE topic = 't/#' and qos = 1
    ```

9. In fact, the topic and qos  in the above example are aliases that are set for ease of use when the subscription request contains only one pair (Topic, QoS). However, if the Topic Filters in the subscription request contain multiple (Topic, QoS) combination pairs,  the contains_topic() or contains_topic_match() function must be explicitly used to check if the Topic Filters contain the specified (Topic, QoS).

    ```sql
    SELECT  client_id FROM "client.subscribe" WHERE contains_topic(topic_filters, 't/#')
    ```

    ```sql
    SELECT  client_id FROM "client.subscribe" WHERE contains_topic(topic_filters, 't/#', 1)
    ```

## Fields available for the SELECT clause


### Publish Message(message.publish)


|  Field  | Description                  |
|-----------|------------------------------------|
| client_id | Client ID                          |
| username  | User name                    |
| event     | Event type, fixed to "message.publish" |
| flags     | Flags of MQTT message  |
| id        | ID of MQTT message       |
| topic     | MQTT  topic                   |
| payload   | MQTT  payload                 |
| peername  | Client's  IP Address and Port |
| qos       | QoS of MQTT message                    |
| timestamp | Timestamp                    |



### Deliver message(message.deliver)

|  Field | Description                  |
|-----------|------------------------------------|
| client_id   | Client ID                          |
| username    | User name                    |
| event       | Event type, fixed to "message.deliver" |
| flags       | Flags of MQTT message |
| id          | ID of MQTT message     |
| topic       | MQTT topic                     |
| payload     | MQTT payload                 |
| peername    | Client's  IP Address and Port |
| qos         | QoS of MQTT message    |
| timestamp   | Timestamp                    |
| auth_result | Authentication results     |
| mountpoint  | Mountpoint of message topic |



### Ack message(message.acked)


|  Field | Description                  |
|-----------|------------------------------------|
| client_id | Client ID                        |
| username  | User name                   |
| event     | Event type, fixed to "message.acked" |
| flags     | Flags of MQTT message |
| id        | ID of MQTT message   |
| topic     | MQTT topic                   |
| payload   | MQTT payload               |
| peername  | Client's  IP Address and Port |
| qos       | QoS of MQTT message |
| timestamp | Timestamp                  |



### Drop message(message.dropped)


|  Field | Description                  |
|-----------|------------------------------------|
| client_id | Client ID                          |
| username  | User name                    |
| event     | Event type, fixed to "message.dropped" |
| flags     | Flags of MQTT message |
| id        | ID of MQTT message     |
| topic     | MQTT topic                     |
| payload   | MQTT payload                 |
| peername  | Client's  IP Address and Port |
| qos       | QoS of MQTT message |
| timestamp | Timestamp                    |
| node      | Node name                     |



### Connect(client.connected)


|  Field | Description                  |
|-----------|------------------------------------|
| client_id    | Client ID                           |
| username     | User name                     |
| event        | Event type, fixed to "client.connected" |
| auth_result  | Authentication results      |
| clean_start  | MQTT clean start Flag position |
| connack      | MQTT CONNACK result              |
| connected_at | Connection timestamp |
| is_bridge    | Bridge or not              |
| keepalive    | MQTT keepalive interval     |
| mountpoint   | Mountpoint of message topic |
| peername     | Client's  IP Address and Port |
| proto_ver    | MQTT protocl version        |




### Disconnect(client.disconnected)


|  Field  | Description                  |
|-----------|------------------------------------|
| client_id   | Client ID                              |
| username    | User name                        |
| event       | Event type, fixed to "client.disconnected" |
| auth_result | Authentication results         |
| mountpoint  | Mountpoint of message topic |
| peername    | Client's  IP Address and Port |
| reason_code | Reason code for disconnection |



### Subscribe(client.subscribe)


|  Field  | Description                  |
|-----------|------------------------------------|
| client_id     | Client ID                           |
| username      | User name                     |
| event         | Event type, fixed to "client.subscribe" |
| auth_result   | Authentication results      |
| mountpoint    | Mountpoint of message topic |
| peername      | Client's  IP Address and Port |
| topic_filters | MQTT subscription list       |
| topic         | The first subscribed topic in the MQTT subscription list |
| topic_filters | The first subscribed Qos in the MQTT subscription list |



### Unsubscribe(client.unsubscribe)


|  Field | Description                  |
|-----------|------------------------------------|
| client_id     | Client ID                             |
| username      | User name                       |
| event         | Event type, fixed to "client.unsubscribe" |
| auth_result   | Authentication results        |
| mountpoint    | Mountpoint of message topic |
| peername      | Client's  IP Address and Port |
| topic_filters | MQTT subscription list        |
| topic         | The first subscribed topic in the MQTT subscription list |
| topic_filters | The first subscribed Qos in the MQTT subscription list |

