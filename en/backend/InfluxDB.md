# InfluxDB data storage

InfluxDB is an open source, time-series database developed by InfluxData. It is written by Go and focuses on querying and storing time-series data with high performance.

Faced with the large-scale and rapid growth of Internet of Things sensor acquisition, transaction records and other data, time series data accumulation speed is very fast. Such large-scale data can be processed by time series database  to improve efficiency, and bring about performance improvement, including: higher Ingest Rates, faster large-scale queries (although  some databases support more queries than others) and better data compression.

This section shows how to store related information through InfluxDB with a practical example in `CentOS 7.2`.



## Install and verify the InfluxDB server

Readers can refer to InfluxDB [documentation](https://docs.influxdata.com/influxdb/) or [Docker](https://hub.docker.com/_/influxdb)  to download and install InfluxDB server, and this article uses InfluxDB version 1.7.



## Configure EMQ X Server

For EMQ X installed via RPM, the InfluxDB related configuration file is located in `/etc/emqx/plugins/emqx_backend_influxdb.conf`, and the InfluxDB plugin only supports message storage.

**Configure the connection address and connection pool size:**

```bash
## InfluxDB UDP Server
## Use only UDP access
backend.influxdb.pool1.server = 127.0.0.1:8089

## InfluxDB Pool Size
backend.influxdb.pool1.pool_size = 5

## Whether or not set timestamp when encoding InfluxDB line
backend.influxdb.pool1.set_timestamp = trues
```

**InfluxDB Backend message storage rule parameters:**

With the topic filter, set the topic that needs to store the message, and the pool parameter distinguishes between multiple data sources:

```bash
## Store Publish Message
backend.influxdb.hook.message.publish.1 = {"topic": "#", "action": {"function": "on_message_publish"}, "pool": "pool1"}
```

Start the plugin.  There rare two ways to start the plugin , `command line` and `console`, and the reader can choose either of them.



### Message template

Because MQTT Message cannot be written directly to InfluxDB, InfluxDB Backend provides the emqx_backend_influxdb.tmpl template file to convert MQTT Messages into DataPoints that can be written to InfluxDB.

The tmpl file is located in `data/templates/emqx_backend_influxdb_example.tmpl`. Using the json format, users can define different Templates for different Topic as follows:

```json
{
    "timestamp": <Where is value of timestamp>
		"measurement": <Where is value of measurement>,
    "tags": {
        <Tag Key>: <Where is value of tag>
    },
		"fields": {
    	<Field Key>: <Where is value of field>
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
        "fields": {
            "temperature": ["$payload", "data", "$0", "temp"]
        },
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
    "fields": {
      "temperature": "1"
    },
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
    "fields": {
      "temperature": "2"
    },
    "timestamp": "1560743513626681000"
  }
]
```



## Example

On the EMQ X Management Console **WebSocket** page, the above format  message is published to the `sample` topic, and the message is parsed and stored in the `measurement` corresponding to the InfluxDB `udp` database.

## Summary

After understanding the data structures stored in InfluxDB, readers can extend the application with InfluxDB.

