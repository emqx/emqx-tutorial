# MQTT protocol configuration

It is used for protocol configuration, and locates at ``## MQTT Protocol`` section of configuration file.

```properties
##--------------------------------------------------------------------
## MQTT Protocol
##--------------------------------------------------------------------
```

## mqtt.max_clientid_len

Configure the max length of MQTT client ID, the default max length is 1024. The value can be increased if max length of client ID could possibly larger than it.

## mqtt.max_packet_size

Configure the max size of single MQTT packet, the default value is 64KB. If your application need to send data that larger than this value, then the parameter value should be changed.  MQTT specification says the max size of payload should not larger than 256MB. If your application requries sending lots of big size data, maybe other protocols should be used.   The value unit of this config item can also be MB, such as ``mqtt.max_packet_size = 10MB`` .

## mqtt.keepalive_backoff

MQTT connection is set to connection keepalive * 2, but if user wants to change it to a more flexible value, it can be configured here. If the value is set to 0.75, which means the keepalive is set to keepalive * 1.5. But the value cannot be set smaller than 0.5, otherwise it will be smaller than keepalive time.



Other configuration will not be introduced here, reader can refer to [Config](https://developer.emqx.io/docs/emq/v3/en/config.html) more detailed info.

