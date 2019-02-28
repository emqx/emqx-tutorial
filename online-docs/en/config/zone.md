# Zone

EMQ X supports Zone-based listener groups, with different options defined according to different zones.

Multiple listeners belong to a zone, and when a client belongs to the zone, the client matches options in that zone.

Listener options math rules:

```
                   ---------              ----------              -----------
Listeners -------> | Zone  | --nomatch--> | Global | --nomatch--> | Default |
                   ---------              ----------              -----------
                       |                       |                       |
                     match                   match                   match
                      \|/                     \|/                     \|/
                Zone Options            Global Options           Default Options
```



```bash
# create external，enable acl
zone.external.enable_acl = on

# external listener extend external's config
listener.tcp.external = 0.0.0.0:1883

# internal  listener extend internal's config，TCP listen on localhost
listener.tcp.internal = 127.0.0.1:11883
```



EMQ X's built-in two domains and listeners：

- external：bind to `external` listeners，listen on '0.0.0.0'；
- internal：bind to `internal` listeners，listen on '127.0.0.1'.



## Configuration

In `etc/emqx.conf` the option start with `zone.` belong to zone configuration，format like `zone.$name.configItem`： 

| Option                                     | description                                                |
| ------------------------------------------- | --------------------------------------------------- |
| zone.external.idle_timeout = 15s            | Idle timeout of the external MQTT connections.                                          |
| zone.external.publish_limit = 10,10s        | Publish limit for the external MQTT connections. |
| zone.external.allow_anonymous = true        | Allow anonymous                                    |
| zone.external.enable_ban = on               | Enable ban check.                                      |
| zone.external.enable_stats = on             | Enable per connection statistics.                                   |
| zone.external.max_packet_size = 64KB        | Maximum MQTT packet size allowed.                                        |
| zone.external.max_clientid_len = 1024       | Maximum length of MQTT clientId allowed.                              |
| zone.external.max_topic_levels = 7          | Maximum topic levels allowed. 0 means no limit.                                     |
| zone.external.max_qos_allowed = 2           | Maximum QoS allowed.                                           |
| zone.external.max_topic_alias = 0           | Maximum Topic Alias, 0 means no limit.                                   |
| zone.external.retain_available = true       | Whether the Server supports retained messages.                                    |
| zone.external.wildcard_subscription = false | Whether the Server supports Wildcard Subscriptions                                 |
| zone.external.shared_subscription = false   | Whether the Server supports Shared Subscriptions                                  |
| zone.external.server_keepalive = 0          | Server Keep Alive                                            |
| zone.external.keepalive_backoff = 0.75      | he backoff for MQTT keepalive timeout.（keepalive * 0.75 * 2）                |
| zone.external.max_subscriptions = 0         | Maximum number of subscriptions allowed, 0 means no limit.                                         |
| zone.external.upgrade_qos = off             | Force to upgrade QoS according to subscription.                                |



