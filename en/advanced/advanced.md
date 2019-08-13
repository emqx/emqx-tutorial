## Rate limit

EMQ X could restrict the speed from the connection and publishing level to avoid server fluctuation caused by frequent downloading and downloading of clients and unlimited publishing of messages by a single client.

### Connection rate limit

Configuration file: `etc/emqx.conf`

#### Byte stream

The value of each configuration is `rate, burst` combination, in Bps. Excessive connections will be suspended. This configuration is not enabled by default:

- rate: Connection rate per second;
- burst: Connect message size per second.

Configuration

- `listener.tcp.external.rate_limit = 1024,4096` ：Set `external` TCP connect rate；
- `listener.tcp.internal.rate_limit = 1000000,2000000` ：Set `internal` TCP connect rate；
- `listener.ssl.external.rate_limit = 1024,4096` ：Set `external` TCP SSL/TLS connect rate；
- `listener.ws.external.rate_limit = 1024,4096` ：Set `external` WebSocket connect rate；
- `listener.wss.external.rate_limit = 1024,4096` ：Set `external`  WebSocket SSL/TLS connect rate.


#### Connection rate limit

Set the maximum number of connections per second, the connection will be suspended if it exceeds the limit.

- `listener.tcp.external.max_conn_rate = 1000` ： Set `external` TCP connect rate；
- `listener.tcp.internal.max_conn_rate = 1000` ： Set `internal` TCP connect rate；
- `listener.ssl.external.max_conn_rate = 500` ： Set `external` TCP SSL/TLS connect rate；
- `listener.ws.external.max_conn_rate = 1000` ： Set `external` WebSocketconnect rate；
- `listener.wss.external.max_conn_rate = 1000` ： Set `external` WebSocket SSL/TLS connect rate.


### Publish rate limit

Configuration file: `etc/emqx.conf`

The configuration item is `rate, timerange` combination, and time range supports `s, m, h`.

- `zone.external.publish_limit = 10,1m` ：Set `external` publish rate limit for each client in the domain.
