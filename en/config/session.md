# Session


In MQTT, each client establishes a connection with the server, which is a session. There is a stateful interaction between the client and the server. EMQ X supports several session information configurations:


- `zone.external.session_expiry_interval = 2h`config session expiration time through Zone binding；
- `listener.ssl.external.reuse_sessions = on` config session reuse on listeners.

