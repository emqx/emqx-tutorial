# 会话

MQTT 中每个客户端与服务器建立连接后就是一个会话(Session)，客户端和服务器之间有状态交互。EMQ X 支持几项会话信息配置：

- `zone.external.session_expiry_interval = 2h`：通过 Zone 绑定配置会话过期时间；
- `listener.ssl.external.reuse_sessions = on`：配置监听器上会话重用。

