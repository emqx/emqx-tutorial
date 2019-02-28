# Nodes

In EMQ X cluster, node communication, management monitoring API, management command and other node connection and management functions need to specify the node name. EMQ X node specifications and functions follow Erlang, node name format is：`name@node_ip_address`



## Erlang node name and cookies

Erlang/OTP X platform applications are mostly composed of distributed Erlang nodes (processes). Each Erlang node (process) needs to assign a node name for communication and mutual access between nodes. All Erlang nodes (processes) that communicate with each other are securely authenticated through a common Cookie.

```bash
## Node name
node.name = emqx@127.0.0.1

## Cookie for distributed node
node.cookie = emqxsecretcookie
```



## Erlang Distributed Protocol

EMQ X nodes are connected by TCPv4, TCPv6 or TLS protocols based on Erlang/OTP platform:

```bash
## Specify the erlang distributed protocol
##  - inet_tcp: the default; handles TCP streams with IPv4 addressing.
##  - inet6_tcp: handles TCP with IPv6 addressing.
##  - inet_tls: using TLS for Erlang Distribution.
node.proto_dist = inet_tcp
```



Specify SSL Options in the file if using SSL for Erlang Distribution.
```bash
node.ssl_dist_optfile = {{ platform_etc_dir }}/ssl_dist.conf


## etc/ssl_dist.conf
## Using Erlang Maps
[{server,
  [{certfile, "etc/certs/cert.pem"},
   {keyfile, "etc/certs/key.pem"},
   {secure_renegotiate, true},
   {depth, 0}]},
 {client,
  [{secure_renegotiate, true}]}].
```





## Erlang VM

The Department allocation is set as advanced configuration. If there is no special requirement or the meaning of the configuration item is not clear, the default value is recommended. See [Erlang Virtual Machine Start Configuration Item Configuration](http://erlang.org/doc/man/erl.html)：

| Option                                                      | descrption                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| node.smp = auto                                             | Enable SMP support of Erlang VM: auto, disable                         |
| node.heartbeat = on                                         | Heartbeat monitoring of an Erlang runtime system. Comment the line to disable                                    |
| node.kernel_poll = on                                       | Enable kernel poll.                                                     |
| node.async_threads = 32                                     | Async threads                                               |
| node.process_limit = 256000                                 | Max number of Erlang proccesses. A MQTT client consumes two proccesses. The value should be larger than max_clients * 2
 |
| node.max_ports = 256000                                     | Max number of Erlang Ports. A MQTT client consumes one port. The value should be larger than max_clients.
 |
| node.dist_buffer_size = 8MB                                 |  buffer busy limit |
