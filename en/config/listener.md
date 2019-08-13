# MQTT Connection and Listener

## Connection

MQTT connection provides a config item  ``mqtt.conn.force_gc_count = 100``, which is used for optimizing EMQ memory usage. If the number of EMQ connection procedure is invoked, then force the procedure to GC and release memory. Generally the default configuration is fine.

## Listener

A listener is open & listened by EMQ to support a protocol.  A listener can be used for configure protocols such as: MQTT, MQTT/SSL, MQTT/WS.  The listener's port, connection number can be configured through  ``listener.tcp|ssl|ws|wss|.*``.  Below is a TCP configuration named external. 

```properties
##--------------------------------------------------------------------
## External TCP Listener

## External TCP Listener: 1883, 127.0.0.1:1883, ::1:1883
listener.tcp.external = 0.0.0.0:1883

## Size of acceptor pool
listener.tcp.external.acceptors = 8

## Maximum number of concurrent connections
listener.tcp.external.max_connections = 1024000

## Maximum external connections per second
listener.tcp.external.max_conn_rate = 1000

## Zone of the external MQTT/TCP listener belonged to
listener.tcp.external.zone = external
```

Then you can use config item ``listener.tcp.external.zone`` to link the previous ``external`` TCP connection listener. User can also create a name for new TCP connection and link to the new listener.

```properties
## Zone of the external MQTT/TCP listener belonged to
listener.tcp.external.zone = external
```

Similar to``listener.tcp.external.zone``,  EMQ also provides ``listener.tcp.internal.zone``, which is used for internal MQTT connections configuration, then different privilege and controls policies can be set, and make system more robust.



Other configuration will not be introduced here, reader can refer to [Config](https://developer.emqx.io/docs/emq/v3/en/config.html) more detailed info.