# Zone

EMQ X 支持基于 Zone 的 Listeners 监听器组，根据不同的 Zone 定义不同的 Options 。

多个 Listener 属于一个 Zone ，当客户端属于某个 Zone 时，客户端匹配该 Zone 中的 Options 。

Listener options 模块逐条匹配规则:

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
# 创建名为 external 的域，并启用 acl 配置
zone.external.enable_acl = on

# external 监听器继承 external 域的配置
listener.tcp.external = 0.0.0.0:1883

# internal 监听器继承 internal 域的配置，TCP 连接只监听了本地 IP
listener.tcp.internal = 127.0.0.1:11883
```



EMQ X 内置的两个域及监听器：

- external：外部域，绑定于 `external` 监听器，各项端口监听在公网 IP 用于外部连接；
- internal：内部域，绑定于 `internal` 监听器，各项端口监听在本地 IP 用于内部连接。



## Zone 的配置项

`etc/emqx.conf` 配置文件中，`zone.` 开头的配置均为 Zone 的配置项，配置项格式为 `zone.$name.configItem`，部分配置及对照如下： 

| 配置项                                      | 说明                                                |
| ------------------------------------------- | --------------------------------------------------- |
| zone.external.idle_timeout = 15s            | 连接池超时                                          |
| zone.external.publish_limit = 10,10s        | PUB 速率限制，`Number,Duration` 示例为 10s 内 10 次 |
| zone.external.allow_anonymous = true        | 是否启用匿名认证                                    |
| zone.external.enable_ban = on               | 是否开启黑名单                                      |
| zone.external.enable_stats = on             | 是否启用连接状态                                    |
| zone.external.max_packet_size = 64KB        | 最大报文大小                                        |
| zone.external.max_clientid_len = 1024       | 最大 clientid 长度                                  |
| zone.external.max_topic_levels = 7          | 最大 Topic 层级                                     |
| zone.external.max_qos_allowed = 2           | 最大 QoS                                            |
| zone.external.max_topic_alias = 0           | 最大 Topic 别名数                                   |
| zone.external.retain_available = true       | 是否启用 retain                                     |
| zone.external.wildcard_subscription = false | 是否支持通配符订阅                                  |
| zone.external.shared_subscription = false   | 是否启用共享订阅                                    |
| zone.external.server_keepalive = 0          | 心跳时间                                            |
| zone.external.keepalive_backoff = 0.75      | 心跳超时退回（keepalive * 0.75 * 2）                |
| zone.external.max_subscriptions = 0         | 最大订阅数                                          |
| zone.external.upgrade_qos = off             | 是否根据订阅升级 QoS                                |



