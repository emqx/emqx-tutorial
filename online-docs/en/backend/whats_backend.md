# EMQ X Backends for Data Persistence

The main usage scenarios of data persistence include recording the client's online and offline status,
subscribing to topic information, message content, sending message receipts after the message arrives into various databases such as Redis, MySQL, PostgreSQL, MongoDB, Cassandra, etc.

Users can also subscribe to related topics to achieve similar functionality, but there is built-in support for these persistences in the enterprise version;
the latter is more efficient than the former and can greatly reduce the workload of developers.



## Data persistence options

The EMQ X persistence plug-in uses an event-driven model to process data and is divided into three main types of event hooks: connect/disconnect, sessions and message.

The principle of persistence is to call the action when the event hook is triggered, and the action is called to process the data according to the configuration instructions, so as to add, delete, modify and check the data.

The same event hook has the same parameters available in different databases, but the action varies according to database characteristics. For example, Redis can use its pub / sub function to bridge the underlying data and support one-to-one, one-to-many message ACK processing.

Specific support for differentiation, please consult the corresponding database document.


### Connect

The hook of connected / disconnected. Processing functions are optional in the hook for client-side up/down logging, online status changes and records, and loading subscription topics from the database for client-side automatic subscriptions.

| hook                | action                 | params | Available operation           |
| ------------------- | ---------------------- | -------- | ------------------ |
| client.connected    | on_client_connected    | clientid | Record client online status |
| client.connected    | on_subscribe_lookup    | clientid | Subscribe topics           |
| client.disconnected | on_client_disconnected | clientid | Record client offline state |

### Sessions

The hook of subscription / unsubscribe, EMQ X creates a session for each connection, triggered when topic subscription / unsubscribe. An optional handler in the hook performs offline / retain message fetching, recording / updating client topic subscription lists, and so on.

The topic parameter acts on the `topic` in the available parameter, and the rule is used to filter the session with the MQTT protocol topic.

| hook                | topic | action                 | params       | Available operation  |
| ------------------- | ----- | ---------------------- | ------------------ | ------------------- |
| session.subscribed  | #     | on_message_fetch       | clientid, topic, qos | Get offline messages |
| session.subscribed  | #     | on_retain_lookup       | clientid, topic, qos | Get retain messages |
| session.unsubscribed | # | -- | clientid, topic | Update subscription list |

### Messages

Client message related hooks. Relevant hooks are triggered when a message is published, delivered, and arrived. The hooks can store message records, retain message operations, and confirm message arrival.

The topic parameter acts on the `topic` in the available parameters, and the rules are used with the MQTT protocol topic to filter the processing messages.

| hook              | topic | action               | params                                      | Available operation            |
| ----------------- | ----- | -------------------- | --------------------------------------------- | ------------------- |
| message.publish   | #     | on_message_publish   | message, msgid, topic, payload, qos, clientid | Record messages that have been published        |
| message.publish   | #     | on_message_retain    | message, msgid, topic, payload, qos, clientid | Record retain messages    |
| message.publish   | #     | on_retain_delete     | message, msgid, topic, payload, qos, clientid | Delete retain messages    |
| message.acked     | #     | on_message_acked     | msgid, topic, clientid                        | Handle ACK       |
| message.delivered | #     | on_message_delivered | msgid, topic, clientid                        | Handle delivered |



## Configuration

EMQ X supports persistence of different types of databases, although there are some differences in configuration details, but any type of persistence configuration mainly does two steps:

- Database Connection Configuration: This section is mainly used to configure database connection information, including server address, database name, and user name and password information, for each different database, this allocation may be different;
- Event registration and behavior: Depending on the event, the user can configure the relevant action in the configuration file, which can be either a function or an SQL statement.

### Database connection configuration

The Department allocates information such as database address, authentication information, connection pool and so on, according to which the plug-in connects to the specified resource.

EMQ X configuration uses a sysctl-like k = V generic format, one per line, with key fields separated by `.`. The database connection configuration information is as follows:

```bash
    ## Pgsql Server
    backend.pgsql.pool1.server = 127.0.0.1:5432

    ## Pgsql Pool Size
    backend.pgsql.pool1.pool_size = 8

    ## Pgsql Username
    backend.pgsql.pool1.username = root

    ## Pgsql Password
    backend.pgsql.pool1.password = public

    ## Pgsql Database
    backend.pgsql.pool1.database = mqtt

    ## Pgsql Ssl
    backend.pgsql.pool1.ssl = false
```

In this configuration, `backend` means that the row configuration belongs to the EMQ X backend family of plug-ins, the second section `pgsql` means configuring the PostgreSQL database, the third section `pool1` means the database connection source, and the last digits of multiple connection sources are accumulated in turn, and the subsequent configuration should specify the connection source that has already been configured;
The fourth paragraph is the property configured in the connection source.


The key of the configuration file is divided into.

```bash
# backend.pgsql.pool1.server = 127.0.0.1:5432
- backend # Plug-in category, here i backend.
    - pgsql # Specific plug-in, here is the PostgreSQL database.
        - pool1 # The data source identifier is used to distinguish the configuration source of the configuration function.
            - server # The server address of the data source.
```



### Event and action

You can configure event registration and related behavior configuration through configuration files.

The value configured in this part is JSON string with different contents depending on the configuration：

```bash
# backend.pgsql.hook.session.subscribed.1 # The last section 1 indicates the first processing configuration.
# PostgreSQL Database client gets offline messages

{
  "topic": "#", # topic filter: any topic
  "action": {
    "function": "on_message_fetch" # using this function
   },
  "pool": "pool1"  # Acting on pool1
}


# backend.pgsql.hook.session.unsubscribed.1
# Delete ACK's message record
{
  "topic": "#", # topic filter, any topic
  "action": {
    # Execute multiple SQL statements, and replace the response data with template syntax in SQL.
    "sql": ["delete from mqtt_acked where clientid = ${clientid} and topic = ${topic}"]
   },
  "pool": "pool1" # Acting on pool1
}
```

> The events and actions supported by each type of database, internal functions, response data, and so on, are detailed in the relevant database configuration, which shows only a common example here.




## Data Persistence - Plug-in

The corresponding tables of the database and configuration files are all in directory `etc/plugins`.


| Database     | configuration file                |
| ---------- | ----------------------- |
| Redis      | emqx_backend_redis.conf |
| MySQL      | emqx_backend_mysql.conf |
| PostgreSQL | emqx_backend_pgsql.conf |
| MongoDB    | emqx_backend_mongo.conf |
| Cassandra  | emqx_backend_cassa.conf |

