# 节点

EMQ X 集群中节点通信，管理监控 API、管理命令等节点连接、管理功能均需要指定节点名称。EMQ X 节点规范与功能沿用 Erlang，节点名称格式为：`name@当前节点用于通信的 IP 地址`



## Erlang 节点名称、分布式节点间通信 Cookie

Erlang/OTP 平台应用多由分布的 Erlang 节点(进程)组成，每个 Erlang 节点(进程)需指配一个节点名，用于节点间通信互访。 所有互相通信的 Erlang 节点(进程)间通过一个共用的 Cookie 进行安全认证。
```bash
## Node name
node.name = emqx@127.0.0.1

## Cookie for distributed node
node.cookie = emqxsecretcookie
```



## EMQ X 节点连接方式

EMQ X 节点基于 Erlang/OTP 平台的 TCPv4, TCPv6 或 TLS 协议连接:

```bash
## 指定 Erlang 分布式通信协议
##  - inet_tcp: 默认值，使用 TCP IPv4 通信.
##  - inet6_tcp: 使用 TCP IPv6 通信.
##  - inet_tls: 使用 TLS.
node.proto_dist = inet_tcp
```



使用 TLS （inet_tls）连接方式通信时，需指定 ssl 配置文件：
```bash
node.ssl_dist_optfile = {{ platform_etc_dir }}/ssl_dist.conf

## etc/ssl_dist.conf
## 使用 Erlang 元组指定证书
[{server,
  [{certfile, "etc/certs/cert.pem"},
   {keyfile, "etc/certs/key.pem"},
   {secure_renegotiate, true},
   {depth, 0}]},
 {client,
  [{secure_renegotiate, true}]}].
```





## Erlang 虚拟机参数

该部分配置为高级配置，如无特殊需求或不清楚配置项含义建议使用默认值。详细配置见 [Erlang 虚拟机启动配置项配置](http://erlang.org/doc/man/erl.html)：

| 配置项                                                      | 说明                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| node.smp = auto                                             | SMP 模式，可选 enable, auto, disable                         |
| node.heartbeat = on                                         | Erlang 运行时系统心跳监控                                    |
| node.kernel_poll = on                                       | 内核轮询                                                     |
| node.async_threads = 32                                     | 同步线程池大小                                               |
| node.process_limit = 256000                                 | Erlang 虚拟机允许的最大进程数，一个 MQTT 连接会消耗2个 Erlang 进程，所以参数值 > 最大连接数 * 2 |
| node.max_ports = 256000                                     | Erlang 虚拟机允许的最大 Port 数量，一个 MQTT 连接消耗 1 个 Port，所以参数值 > 最大连接数 |
| node.dist_buffer_size = 8MB                                 | 分发缓冲区缓存大小                                           |
| node.max_ets_tables = 256000                                | 最大 ETS 表大小                                              |
| node.fullsweep_after = 1000                                 | 调整 GC 频率                                                 |
| node.crash_dump = log/crash.dump                            | 故障转储日志文件                                             |
| node.dist_net_ticktime = 60                                 | --                                                           |
| node.dist_listen_min = 6369<br/>node.dist_listen_max = 6369 | 节点监听器端口范围                                           |

