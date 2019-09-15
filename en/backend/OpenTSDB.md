# OpenTSDB Data Storage



OpenTSDB is an extensible distributed temporal database, which relies on HBase at the bottom layer.

Faced with the large-scale and rapid growth of Internet of Things sensor acquisition, transaction records and other data, time series data accumulation speed is very fast. Such large-scale data can be processed by time series database  to improve efficiency, and bring about performance improvement, including: higher Ingest Rates, faster large-scale queries (although  some databases support more queries than others) and better data compression.

This section shows how to store related information through OpenTSDB with a practical example in `CentOS 7.2`.



## Install and verify the OpenTSDB  server

Readers can refer to OpenTSDB [documentation](https://docs.influxdata.com/influxdb/) or [Docker](https://hub.docker.com/_/influxdb)  to download and install OpenTSDB server, and this article uses OpenTSDB version 2.4.0 .

## Configure EMQ X Server

For EMQ X installed via RPM, the OpenTSDB related configuration file is located in `/etc/emqx/plugins/emqx_backend_opentsdb.conf`, and the OpenTSDB plugin only supports message storage.

**Configure the connection address and connection pool size, batch policy:**

```bash
## OpenTSDB Server Access address
backend.opentsdb.pool1.server = 127.0.0.1:4242

## OpenTSDB Pool Size
backend.opentsdb.pool1.pool_size = 8

## Whether or not to return summary information
## 
## Value: true | false
backend.opentsdb.pool1.summary = true

## Whether or not to return detailed information
## 
## Value: true | false
backend.opentsdb.pool1.details = false

## Whether or not to wait for the data to be flushed to storage before returning the results.
##
## Value: true | false
backend.opentsdb.pool1.sync = false

## A timeout, in milliseconds, to wait for the data to be flushed to 
## storage before returning with an error.
##
## Value: Duration
##
## Default: 0
backend.opentsdb.pool1.sync_timeout = 0

## Max batch size of put 
## 
## Value: Number >= 0
## Default: 20
backend.opentsdb.pool1.max_batch_size = 20

## Store Publish Message QOS > 0
backend.opentsdb.hook.message.publish.1 = {"topic": "#", "action": {"function": "on_message_publish"}, "pool": "pool1"}
```

**OpenTSDB Backend message storage rule parameters: **

With the topic filter, set the topic that needs to store the message, and the pool parameter distinguishes between multiple data sources:

```bash
## Store Publish Message
backend.opentsdb.hook.message.publish.1 = {"topic": "#", "action": {"function": "on_message_publish"}, "pool": "pool1"}
```

Start the plugin.  There rare two ways to start the plugin , `command line` and `console`, and the reader can choose either of them.



### Message template

Because MQTT Message cannot be written directly to  OpenTSDB,  OpenTSDB Backend provides the emqx_backend_opentsdb.tmpl template file to convert MQTT Messages into DataPoints that can be written to  OpenTSDB.

The tmpl file is located in `data/templates/emqx_backend_opentsdb_example.tmpl`. Using the json format, users can define different Templates for different Topic as follows:

```json
{
    "sample": {
        "measurement": "$topic",
        "tags": {
            "host": ["$payload", "data", "$0", "host"],
            "region": ["$payload", "data", "$0", "region"],
            "qos": "$qos",
            "from": "$from"
        },
        "value": ["$payload", "data", "$0", "temp"],
        "timestamp": "$timestamp"
    }
}
```

Among them, measurement and fields are required to be filled, and tags and timestamp are optional. <Where is value of> Supports variables with the variable name `key` extracted by placeholders such as `$key`. The supported variables are as follows:

- qos: message QoS
- form: publisher information
- topic: Published topic
- timestamp: timestamp
- payload.*: Any variable in the body of the JSON message, such as `{ "data": [{ "temp": 1 }] }` can be extracted with 1 by using `["$payload", "data", "temp"]` 

This example sets the template as follows:

```json
{
    "sample": {
        "measurement": "$topic",
        "tags": {
            "host": ["$payload", "data", "$0", "host"],
            "region": ["$payload", "data", "$0", "region"],
            "qos": "$qos",
            "from": "$from"
        },
        "value": ["$payload", "data", "$0", "temp"],
        "timestamp": "$timestamp"
    }
}

```

The MQTT Message with Topic "sample" has the following Payload:

```json
{
  "data": [
    {
      "temp": 1,
      "host": "serverA",
      "region": "hangzhou"
    },
    {
      "temp": 2,
      "host": "serverB",
      "region": "ningbo"
    }
  ]
}
```



Backend converts the MQTT Message to:

```json
[
  {
    "measurement": "sample",
    "tags": {
      "from": "mqttjs_ebcc36079a",
      "host": "serverA",
      "qos": "0",
      "region": "hangzhou"
    },
    "value": "1",
    "timestamp": "1560743513626681000"
  },
  {
    "measurement": "sample",
    "tags": {
      "from": "mqttjs_ebcc36079a",
      "host": "serverB",
      "qos": "0",
      "region": "ningbo"
    },
    "value": "2",
    "timestamp": "1560743513626681000"
  }
]
```



## Example

On the EMQ X Management Console **WebSocket** page, the above format message is published to the `sample` topic, and the message is parsed and stored in the `measurement` corresponding to the OpenTSDB `udp` database.

## Summary

After understanding the data structures stored in OpenTSDB, readers can extend the application with OpenTSDB.

