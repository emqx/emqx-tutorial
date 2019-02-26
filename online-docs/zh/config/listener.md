# MQTT 连接和 Listener

## 连接

MQTT 连接提供了一个配置项 ``mqtt.conn.force_gc_count = 100``，这是一个用于优化 EMQ 的内存使用，EMQ的客户端进程被调用了所配置的次数之后对内存进行强制 GC。一般使用系统默认的配置就可以。

## Listener

一个 Listener 是 EMQ 开放并监听相关的端口来支持相关的协议。Listener 可以配置的协议包括：MQTT、MQTT/SSL、MQTT/WS，通过 ``listener.tcp|ssl|ws|wss|.*`` 等来配置  listener 的端口、连接数等。如下所示是一个名为 external 的 TCP 连接配置。

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

然后通过 ``listener.tcp.external.zone``来关联上述配置好的名为 ``external`` 的 TCP 连接配置。读者也可以新增一个别的名字的 TCP 连接配置，然后将 ``listener.tcp.external.zone`` 关联到此新建的 TCP 连接配置。

```properties
## 这里配置的 external 与前面的 zone 相关联，也可以新增一个 $name 的监听器，对应前面的 $name zone ，配在相应的listener下面。
## Zone of the external MQTT/TCP listener belonged to
listener.tcp.external.zone = external
```

与``listener.tcp.external.zone``类似，还提供了``listener.tcp.internal.zone``，用于配置内部的 MQTT 连接的设置，这样可以针对不同类型的连接配置不同的权限和控制，让系统更加健壮。



其它配置项在此不作详细介绍，读者可以参考[配置](https://developer.emqx.io/docs/emq/v3/en/config.html)来获取更多关于协议的配置介绍。