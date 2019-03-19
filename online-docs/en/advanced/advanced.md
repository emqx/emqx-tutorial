## 流控

EMQ X 可以从连接、发布层面进行速率限制，避免因客户端频繁上下线、单个客户端无限制发布消息造成服务器波动。

### 连接速率限制

打开配置文件 `etc/emqx.conf`

#### 字节流限制

每项配置的值为 `rate,burst` 组合，单位是 Bps，超限的连接将挂起，默认不启用该配置:
- rate: 每秒连接速率；
- burst: 每秒连接报文大小。

配置项：

- `listener.tcp.external.rate_limit = 1024,4096` ：配置 `external` 域下 TCP 连接速率；
- `listener.tcp.internal.rate_limit = 1000000,2000000` ：配置 `internal` 域下 TCP 连接速率；
- `listener.ssl.external.rate_limit = 1024,4096` ：配置 `external` 域下 TCP SSL/TLS 连接速率；
- `listener.ws.external.rate_limit = 1024,4096` ：配置 `external` 域下 WebSocket 连接速率；
- `listener.wss.external.rate_limit = 1024,4096` ：配置 `external` 域下 WebSocket SSL/TLS 连接速率。


#### 连接速率限制

每秒最大连接数，超限将挂起连接。

- `listener.tcp.external.max_conn_rate = 1000` ： 配置 `external` 域下 TCP 连接速率；
- `listener.tcp.internal.max_conn_rate = 1000` ： 配置 `internal` 域下 TCP 连接速率；
- `listener.ssl.external.max_conn_rate = 500` ： 配置 `external` 域下 TCP SSL/TLS 连接速率；
- `listener.ws.external.max_conn_rate = 1000` ： 配置 `external` 域下 WebSocket 连接速率；
- `listener.wss.external.max_conn_rate = 1000` ： 配置 `external` 域下 WebSocket SSL/TLS 连接速率。


### PUB 速率限制

打开配置文件 `etc/emqx.conf`

配置项为 `rate,timerange` 组合，时间范围支持`s,m,h`。

- `zone.external.publish_limit = 10,1m` ：配置 `external` 域下每个客户端 PUB 速率限制。
