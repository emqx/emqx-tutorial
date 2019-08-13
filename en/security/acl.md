# ACL (Access Control List) access control

The authentication introduced in the previous chapter is used to control whether the user can log in to the EMQ X server. This chapter describes the use of ACL users to control the user's permissions: EMQ X supports defining the topics that the client can use to implement device permissions management.

## ACL access control

EMQ X enables the ACL whitelist by default to allow publish and subscription by the user that are not in the ACL list, as configured in `etc/emqx.conf`:

```bash
## ACL nomatch
mqtt.acl_nomatch = allow

## Default ACL File
## Basic ACL rules are configured in the file of etc/acl.conf
mqtt.acl_file = etc/acl.conf
```

The ACL access control rules are  defined as follows:

```bash
Allow|Deny  Who  Subscribe|Publish   Topics
```

When EMQ X receives an PUBLISH or SUBSCRIBE request from MQTT client, it matches the ACL access control rule one by one until the match returns either allow or deny.

- ACL can set super user. If it is a super user client, it can perform any publish/subscribe operation.
- The same configuration file ``plugins/emqx_auth_xxx.conf`` is used for both ACL control and authentication, but not all plugins support ACLs.

## ACL Cache

```bash
## Whether to cache ACL rules. After setting the cache,it can speed up the acquisition of ACL records.
mqtt.cache_acl = true
```

After the ACL rule is matched, it will have a cache in the memory to avoid accessing the external storage device when the ACL needs to be verified next time, thus speeding up the access. The cache of the ACL in the memory is valid only during the period when the connection is established and exists. If the connection is disconnected, the ACL information corresponding to the connection is deleted. The user can delete the ACL information through the REST API provided by EMQ X.

```json
  {
        "name": "clean_acl_cache",
        "method": "DELETE",
        "path": "/connections/:clientid/acl/:topic",
        "descr": "Clean ACL cache of a connection"
  }
```



## Configuration file access control

### ACL configuration

#### Prepare to access control data

Set the access rules as follows.

1. Set all users not to subscribe to the system topic, except for connections initiated from a specific machine ``10.211.55.10``;
2. The topic of the application is designed as ``/smarthome/$clientId/temperature``, setting a rule to allow only the  device with same ``clientId`` to publish messages to its own topic.

Open the access control configuration file ``/etc/emqx/acl.conf`` and the configuration file contents are as follows.

```bash
{allow, {user, "dashboard"}, subscribe, ["$SYS/#"]}.

{allow, all, publish, ["/smarthome/%c/temperature"]}.

{allow, {ipaddr, "10.211.55.10"}, pubsub, ["$SYS/#", "#"]}.

{deny, all, subscribe, ["$SYS/#", {eq, "#"}]}.
```

#### Modify configuration file

Open the configuration file ``/etc/emqx/emqx.conf`` and change the matching rule of the ACL to: no allowed is not matched.

```bash
mqtt.acl_nomatch = deny
```

Open the configuration file ``/etc/emqx/plugins/emqx_auth_username.conf`` and add the following authenticated users.

```
auth.user.1.username = userid_001
auth.user.1.password = public
```

Use the command line ``emqx_ctl plugins load emqx_auth_username`` to activate the emqx_auth_username plugin and restart the EMQ X service.

#### Test system topic

Subscribe to the system topic in the machine ``10.211.55.6``. Please note that the mosquitto client needs to add the escape character ``\`` before the topic character ``$``, which becomes `` \$SYS/#``, and the command is as follows. In the current version, it cannot be known if the subscription fails in the front end, but needs to be combined with the EMQ X background log to judge.

```bash
mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "\$SYS/#" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 128
```

EMQ X background log (``/var/log/emqx/error.log``) error message.

```bash
2018-11-13 02:12:43.866 [error] <0.1993.0>@emqx_protocol:process:294 Client(test_username1@10.211.55.6:57612): Cannot SUBSCRIBE [{<<"$SYS/#">>,[{qos,0}]}] for ACL Deny

```

Subscribe to the system topic in the machine 10.211.55.10, and all system messages were successfully received.

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "\$SYS/#" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 0
Client test_username1 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers', ... (14 bytes))
emqx@127.0.0.1
Client test_username1 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers/emqx@127.0.0.1/version', ... (5 bytes))
2.4.3
Client test_username1 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers/emqx@127.0.0.1/sysdescr', ... (12 bytes))
EMQ X Broker
Client test_username1 received PUBLISH (d0, q0, r0, m0, '$SYS/brokers/emqx@127.0.0.1/uptime', ... (22 bytes))
17 minutes, 14 seconds
Client test_username1 received PUBLISH (d0, q0, r0, m0, '$SYS/brokers/emqx@127.0.0.1/datetime', ... (19 bytes))
2018-11-13 02:14:03

```

#### Test of device operating its own topic

The subscription fails, combined with the background log of EMQ X,  the message that ACL prohibits is known.

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "/smarthome/user1/temperature" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: /smarthome/user1/temperature, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 128

```

EMQ X background log (``/var/log/emqx/error.log``) error message.

```bash
2018-11-13 02:16:56.118 [error] <0.2001.0>@emqx_protocol:process:294 Client(test_username1@10.211.55.6:57676): Cannot SUBSCRIBE [{<<"/smarthome/user1/temperature">>,[{qos,0}]}] for ACL Deny

```

Successful subscription: If there is no ACL error message printed in EMQ X background log (``/var/log/emqx/error.log``) , the subscription is successful.

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "/smarthome/test_username1/temperature" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: /smarthome/test_username1/temperature, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 0

```

## HTTP access control

The HTTP API is used for ACL control.

### Principle of implementation

EMQ X uses the related information of current client as a parameter when publishing or subscribing, initiates a request to query device permissions, and processes events via an HTTP response status code (HTTP Status).

- ACL succeeds, API returns 200 status code
- ACL fails, API returns 4xx status code

### Way of use

Open the `etc/plugins/emqx_auth_http.conf` file and configure the relevant rules:

```bash
## Configure the ACL address of super user, the relevant server address and port is specified here, and the path can be specified according to your own implementation
auth.http.super_req = http://$server:$port/mqtt/admin
auth.http.super_req.method = post
auth.http.super_req.params = clientid=%c,username=%u

## Configure the ACL URL address
auth.http.acl_req = http://$server:$port/mqtt/acl
auth.http.acl_req.method = get
auth.http.acl_req.params = access=%A,username=%u,clientid=%c,ipaddr=%a,topic=%t

```

After loading the plugin, restart EMQ X. EMQ X will check according to  the specified ACL address. After the web server obtains the parameters submitted by EMQ X and executes the relevant logic, it returns the **corresponding HTTP response status code**. The specific return content depends on your own needs, and EMQ X has no requirement for that.

> See the bottom of the page for detailed placeholder definitions in the configuration.

The implementation code of super user is shown below. If the incoming ``clientId`` is ``sysadmin``, it returns 200, and the user is considered as super user; otherwise, it returns SC_FORBIDDEN, indicating that access is not allowed. Super users are not controlled by ACLs.

```java
package io.emqx;

import java.io.IOException;
import java.text.MessageFormat;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/admin")
public class AdminServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
    public AdminServlet() {
        super();
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String clientId = request.getParameter("clientid");
		System.out.println(MessageFormat.format("clientid: {0}", clientId));
		if(clientId == null || "".equals(clientId.trim()) ) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Invalid request contents.");
			return;
		}
		
		if(clientId.equals("sysadmin")) {
			response.setStatus(HttpServletResponse.SC_OK);
			response.getWriter().println("OK");
		} else {
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getWriter().println("Not admin");
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}

```

The following code is an example of verifying ACL logic, judging the relationship between the incoming ``clientId`` and the ``topic`` of the operation. If ``topic`` ends with ``clientId``, it returns 200, indicating the operation is allowed; otherwise it returns 403 (Forbidden), indicating that operation is not allowed.

```java
package io.emqx;

import java.io.IOException;
import java.text.MessageFormat;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/acl")
public class AclServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    public AclServlet() {
        super();
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String clientId = request.getParameter("clientid");
		String username = request.getParameter("username");
		String access = request.getParameter("access");
		String topic = request.getParameter("topic");
		String ipaddr = request.getParameter("ipaddr");
		
		System.out.println(MessageFormat.format("clientid: {0}, username: {1}, access: {2}, topic: {3}, ipaddr: {4}", clientId, username, access, topic, ipaddr));
		
		if(clientId == null || "".equals(clientId.trim()) || topic == null || "".equals(topic.trim())) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Invalid request contents.");
			return;
		}
		
		if(topic.endsWith(clientId)) {
			response.setStatus(HttpServletResponse.SC_OK);
			response.getWriter().println("OK");
		} else {
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.getWriter().println("Not allowed");
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
}

```

The client sends a message through ``mosquitto_pub``. Since the rule we set does not allow the user to send a message to the topic, the front end looks normal, as shown in the following figure.

```shell
# mosquitto_pub -h 10.211.55.10 -u user1 -i id1  -P passwd -t /devices/001/temp -m "hello" -d
Client id1 sending CONNECT
Client id1 received CONNACK
Client id1 sending PUBLISH (d0, q0, r0, m1, '/devices/001/temp', ... (5 bytes))
Client id1 sending DISCONNECT

```

In the backend log, an error is reported stating that the client is not allowed to send messages to the topic.

```bash
2018-11-12 14:46:02.773 [error] <0.2004.0>@emqx_protocol:process:257 Client(id1@10.211.55.6:41367): Cannot publish to /devices/001/temp for ACL Deny

```

The operation of sending a message is normal when using the command shown below.

```shell
# mosquitto_pub -h 10.211.55.10 -u user1 -i id1  -P passwd -t /devices/001/temp/id1 -m "hello"

```

However, if the logged user is super user, the error message ``ACL Deny`` will not appear, and the message can be sent and subscribed to any topic.

```bash
# mosquitto_sub -h 10.211.55.10 -u sysadmin -i sysadmin  -P sysadmin -t /devices/001/temp
hello

```

## MySQL/PostgreSQL access control

emqx_auth_mysql / emqx_auth_pgsql plugins are access control plugins based on MySQL and PostgreSQL databases respectively.

> The same configuration file is used for both user authentication and access control.

### Super user configuration

The super user's settings are implemented through data validation of the user authentication table. Open the configuration file of emqx_auth_mysql.conf / emqx_auth_pgsql.conf to see if the `is_superuser` field in the query result is `true`, The true value of the program such as "true", true, '1', '2', '3' can be treated as true. Super users are not controlled by ACLs.

```bash
auth.mysql.super_query = SELECT is_superuser FROM mqtt_user WHERE username = '%u' LIMIT 1

```

### ACL configuration

#### Create a database

> If the reader has already created the database after reading the MySQL/PostgreSQL authentication section, he can skip this section.

Readers can use any of their favorite mysql clients to create the appropriate database. The command line client that comes with MySQL is used here. Open the MySQL console and create an authentication database named ``emqx`` and switch to the ``emqx`` database as shown below.

```sql
mysql> create database emqx;
Query OK, 1 row affected (0.00 sec)

mysql> use emqx;
Database changed

```

#### Create a table

The suggested table structure is as follows:

- allow: Prohibited (0); or allowed (1)
- ipaddr: Set the IP address.
- username: The username connecting to the client. If the value here is set to ``$all``, the rule is applicable to all users.
- clientid: clientId connecting to the client. 
- access: Allowed operations. Subscription (1); publish (2); both subscription and publish (3).
- topic: The name of the controlled topic. The topic can use wildcards, and a placeholder ``%c`` can be added to the topic to match topics of client IDs, such as ``/smarthome/$clientId/temperature``.

```sql
CREATE TABLE `mqtt_acl` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `allow` int(1) DEFAULT 1 COMMENT '0: deny, 1: allow',
  `ipaddr` varchar(60) DEFAULT NULL COMMENT 'IpAddress',
  `username` varchar(100) DEFAULT NULL COMMENT 'Username',
  `clientid` varchar(100) DEFAULT NULL COMMENT 'ClientId',
  `access` int(2) NOT NULL COMMENT '1: subscribe, 2: publish, 3: pubsub',
  `topic` varchar(100) NOT NULL DEFAULT '' COMMENT 'Topic Filter',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

```

After the creation is successful, look at the table structure.

```sql
mysql> desc mqtt_acl;
+----------+------------------+------+-----+---------+----------------+
| Field    | Type             | Null | Key | Default | Extra          |
+----------+------------------+------+-----+---------+----------------+
| id       | int(11) unsigned | NO   | PRI | NULL    | auto_increment |
| allow    | int(1)           | YES  |     | 1       |                |
| ipaddr   | varchar(60)      | YES  |     | NULL    |                |
| username | varchar(100)     | YES  |     | NULL    |                |
| clientid | varchar(100)     | YES  |     | NULL    |                |
| access   | int(2)           | NO   |     | NULL    |                |
| topic    | varchar(100)     | NO   |     |         |                |
+----------+------------------+------+-----+---------+----------------+
7 rows in set (0.00 sec)

```

#### Prepare to access controlled data

Now the following rules are made:

1. All users are set not to subscribe to the system topic, except for connections initiated from a specific machine ``10.211.55.10``;
2. The topic of the application is designed as ``/smarthome/$clientId/temperature``, setting a rule to allow only the same ``clientId`` device to publish messages to its own topic.

```sql
# All users cannot subscribe to system topics
INSERT INTO mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (0, NULL, '$all', NULL, 1, '$SYS/#');

# Connection initiated on 10.211.55.10 is allowed to subscribe to system topics 
INSERT INTO mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (1, '10.211.55.10', NULL, NULL, 1, '$SYS/#');

# Devices are allowed to publish messages only to their own topics
INSERT INTO mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (1, NULL, NULL, NULL, 1, '/smarthome/%c/temperature');

```

#### Modify configuration

Open the configuration file ``/etc/emqx/emqx.conf`` and change the rule matching of the ACL to: not allowed if  is not matched.

```bash
mqtt.acl_nomatch = deny

```

Open the configuration file ``/etc/emqx/plugins/emqx_auth_mysql.conf`` and set the SQL statement as follows.

```bash
auth.mysql.acl_query = select allow, ipaddr, username, clientid, access, topic from mqtt_acl where ipaddr = '%a' or username = '%u' or username = '$all' or clientid = '%c'

```

After saving the configuration file, activate the emqx_auth_mysql and emqx_auth_pgsql plugins and restart the EMQ X service.

#### Test system topic

Subscribe to the system topic in the machine ``10.211.55.6``. Please note that the mosquitto client needs to add the escape character ``\`` before the topic character ``$``, which becomes `` \$SYS/#``, and the command is as follows. In the current version, it cannot be known if the subscription fails in the front end, but needs to be combined with the EMQ X backend log to judge.

```bash
mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "\$SYS/#" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 128

```

EMQ X background log (``/var/log/emqx/error.log``) error message.

```bash
2018-11-13 02:12:43.866 [error] <0.1993.0>@emqx_protocol:process:294 Client(test_username1@10.211.55.6:57612): Cannot SUBSCRIBE [{<<"$SYS/#">>,[{qos,0}]}] for ACL Deny

```

Subscribe to the system topic in the machine 10.211.55.10, and all system messages were successfully received.

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "\$SYS/#" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 0
Client test_username1 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers', ... (14 bytes))
emqx@127.0.0.1
Client test_username1 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers/emqx@127.0.0.1/version', ... (5 bytes))
2.4.3
Client test_username1 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers/emqx@127.0.0.1/sysdescr', ... (12 bytes))
EMQ X Broker
Client test_username1 received PUBLISH (d0, q0, r0, m0, '$SYS/brokers/emqx@127.0.0.1/uptime', ... (22 bytes))
17 minutes, 14 seconds
Client test_username1 received PUBLISH (d0, q0, r0, m0, '$SYS/brokers/emqx@127.0.0.1/datetime', ... (19 bytes))
2018-11-13 02:14:03

```

#### Test of device operating its own theme

The subscription fails,  and  the message that ACL prohibits is known combined with the background log of EMQ X .

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "/smarthome/user1/temperature" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: /smarthome/user1/temperature, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 128

```

EMQ X background log (``/var/log/emqx/error.log``) error message.

```bash
2018-11-13 02:16:56.118 [error] <0.2001.0>@emqx_protocol:process:294 Client(test_username1@10.211.55.6:57676): Cannot SUBSCRIBE [{<<"/smarthome/user1/temperature">>,[{qos,0}]}] for ACL Deny

```

Successful subscription: If there is no ACL error message printed in EMQ X background log (``/var/log/emqx/error.log``) , the subscription is successful.

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "/smarthome/test_username1/temperature" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: /smarthome/test_username1/temperature, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 0

```

## Redis access control

The emqx_auth_redis plugin is a Redis database-based access control plugin. Redis now only supports whitelist configuration, which means that only the rules listed in Redis have access permission to a topic.

> The same configuration file is used for both user authentication and access control.

### Super user configuration

According to the configuration in [Authentication](auth.md), whether the user is a super user is determined by obtaining the value stored in the ``is_superuser`` field of the ``mqtt_user`` data structure in the Redis database. Open `etc/plugins/emqx_auth_redis.conf` and configure the super query. Super users are not controlled by ACLs.

```bash
## Super Redis command
auth.redis.super_cmd = HGET mqtt_user:%u is_superuser

```

### ACL configuration

#### Prepare ACL data

Use Redis's Hash to store ACL information in the following format:

- username: indicating the user name of the client
- topicname: indicating topic name
- [1|2|3]: 1 for subscription; 2 for publish; 3 for both subscription and publish

```bash
HSET mqtt_acl:username topicname [1|2|3]

```

As shown below, the system topic``$SYS/#`` can be subscribed by the client named ``user1``.

```bash
## Set the permissions of the topic $SYS/# as Subscribable.
127.0.0.1:6379[2]> HMSET mqtt_acl:userid_001 $SYS/# 1
OK

## Remove the permissions for the topic $SYS/#
127.0.0.1:6379> HMGET mqtt_acl:userid_001 $SYS/#
1) "1"

## Set the permissions of the theme $SYS/# as publishable.
127.0.0.1:6379> HMSET mqtt_acl:userid_001 /smarthome/%c/temperature 2
OK

## Remove the permissions for the topic $SYS/#
127.0.0.1:6379> HMGET mqtt_acl:userid_001 /smarthome/%c/temperature
1) "2"

```

#### Modify configuration file

Open the configuration file ``/etc/emqx/emqx.conf`` and change the rule matching of the ACL to: not allowed if not matched.

```bash
mqtt.acl_nomatch = deny

```

Open `etc/plugins/emqx_auth_redis.conf` and configure the ACL query:

```bash
## %u: user name
## %c: client ID
auth.redis.acl_cmd = HGETALL mqtt_acl:%u

```

After saving the configuration file, activate the emqx_auth_redis plugin and restart the EMQ X service.

#### Test system topic

When Subscribing to the system topic , it needs to add the escape character ``\`` before the topic character ``$`` to become `` \$SYS/#`` at the mosquitto client, and the command is as follows. After the subscription is successful,  a message on the system  topic is received. 

```shell
# mosquitto_sub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "\$SYS/#" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client userid_001 received SUBACK
Subscribed (mid: 1): 0
Client userid_001 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers', ... (14 bytes))
emqx@127.0.0.1
Client userid_001 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers/emqx@127.0.0.1/version', ... (5 bytes))
2.4.3
Client userid_001 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers/emqx@127.0.0.1/sysdescr', ... (12 bytes))
EMQ X Broker

```

Set the user's permissions on the system topic to only publish in Redis.

```shell
127.0.0.1:6379> HMSET mqtt_acl:userid_001 $SYS/# 2
OK

```

The subscription fails, and the message that ACL prohibits is known combined with the background log of EMQ X.

```shell
# mosquitto_sub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "\$SYS/#" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client userid_001 received SUBACK
Subscribed (mid: 1): 128

```

EMQ X background log (``/var/log/emqx/error.log``) error message.

```shell
2018-11-13 12:08:48.178 [error] <0.1958.0>@emqx_protocol:process:294 Client(userid_001@10.211.55.6:43337): Cannot SUBSCRIBE [{<<"$SYS/#">>,[{qos,0}]}] for ACL Deny

```

#### Test of device operating its own theme

The user ``userid_001`` sends a message to the topic ``/smarthome/userid_002/temperature`` that is not its own. Combined with the background log of EMQ X, the message prohibited by ACL can be known.

```shell
# mosquitto_pub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "/smarthome/userid_002/temperature" -m "hello" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending PUBLISH (d0, q0, r0, m1, '/smarthome/userid_002/temperature', ... (5 bytes))
Client userid_001 sending DISCONNECT

```

EMQ X background log (``/var/log/emqx/error.log``) error message.

```shell
2018-11-13 12:11:33.785 [error] <0.1966.0>@emqx_protocol:process:257 Client(userid_001@10.211.55.6:43448): Cannot publish to /smarthome/userid_002/temperature for ACL Deny

```

The user ``userid_001`` sends a message to its topic ``/smarthome/userid_001/temperature``, there is no ACL error message in the background, and the message is sent successfully.

```shell
# mosquitto_pub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "/smarthome/userid_001/temperature" -m "hello" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending PUBLISH (d0, q0, r0, m1, '/smarthome/userid_001/temperature', ... (5 bytes))
Client userid_001 sending DISCONNECT

```

## MongoDB access control

The emqx_auth_mongo plugin is an access control plugin based on the Mongo database. MongoDB now only supports whitelist configuration, which means that only the rules listed in MongoDB can have access permission to a topic.

> The same configuration file is used for both user authentication and access control.

### Super user configuration

Open `etc/plugins/emqx_auth_mongo.conf` and configure the super query:

```bash
## Whether to enable
auth.mongo.super_query = on

## super Collection of information
auth.mongo.super_query.collection = mqtt_user

## super field
auth.mongo.super_query.super_field = is_superuser

## Query command
auth.mongo.super_query.selector = username=%u

```

When the `is_superuser` (super_field field) in the query result is `true`, it indicates that the current user is super user.

### ACL configuration

#### Prepare ACL data

The ACL data structure defined in MongoDB is as follows.

- username: the username of the login
- clientid: the client id of the login
- publish: array format, a list of message topic names that the user is allowed to publish, if not, the field can be ignored.
- subscribe: array format, a list of message topic names that the user is allowed to subscribe to, if not, the field can be ignored.
- pubsub: array format, a list of message subject names that the user can allow to both publish or subscribe to, if not, the field can be ignored.

```json
{
    username: "username",
    clientid: "clientid",
    publish: ["topic1", "topic2", ...],
    subscribe: ["subtop1", "subtop2", ...],
    pubsub: ["topic/#", "topic1", ...]
}

```

Insert the following ACL information into MongoDB.

- Users whose username and client ID are userid_001 can publish their own topic ``/smarthome/%c/temperature``; they can also subscribe to the system topic.

```bash
> use mqtt
switched to db mqtt

> db.mqtt_acl.insert({ username: 'userid_001', clientid: "userid_001", publish:["/smarthome/%c/temperature"], subscribe: ["$SYS/#"], pubsub: [] })
WriteResult({ "nInserted" : 1 })

> db.mqtt_acl.findOne({ username: 'userid_001' })
{
	"_id" : ObjectId("5bea67bb1d2e8f30aa829072"),
	"username" : "userid_001",
	"clientid" : "userid_001",
	"publish" : [
		"/smarthome/%c/temperature"
	],
	"subscribe" : [
		"$SYS/#"
	],
	"pubsub" : [ ]
}

```

#### Modify configuration file

Open the configuration file ``/etc/emqx/emqx.conf`` and change the rule matching of the ACL to:  not allowed if not matched.

```bash
mqtt.acl_nomatch = deny

```

Open `etc/plugins/emqx_auth_mongo.conf` and configure the ACL query.

```bash
## Whether to enable ACL control
auth.mongo.acl_query = on

## ACL Collection of information
auth.mongo.acl_query.collection = mqtt_acl

## query command
auth.mongo.acl_query.selector = username=%u

```

After saving the configuration file, activate the emqx_auth_mongodb plugin and restart the EMQ X service.

#### Test system topic

When subscribing to the system topic , it needs to add the escape character ``\`` before the topic character ``$`` to become `` \$SYS/#`` at the mosquitto client, and the command is as follows. After the subscription is successful,  a message on the system  topic is received. 

```shell
# mosquitto_sub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "\$SYS/#" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client userid_001 received SUBACK
Subscribed (mid: 1): 0
Client userid_001 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers', ... (14 bytes))
emqx@127.0.0.1
Client userid_001 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers/emqx@127.0.0.1/version', ... (5 bytes))
2.4.3
Client userid_001 received PUBLISH (d0, q0, r1, m0, '$SYS/brokers/emqx@127.0.0.1/sysdescr', ... (12 bytes))
EMQ X Broker

```

#### Test of device operating its own theme

The user ``userid_001`` sends a message to the topic ``/smarthome/userid_002/temperature`` that is not its own. Combined with the background log of EMQ X, the message prohibited by ACL can be known.

```shell
# mosquitto_pub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "/smarthome/userid_002/temperature" -m "hello" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending PUBLISH (d0, q0, r0, m1, '/smarthome/userid_002/temperature', ... (5 bytes))
Client userid_001 sending DISCONNECT

```

EMQ X background log (``/var/log/emqx/error.log``) error message.

```shell
2018-11-13 21:44:44.161 [error] <0.2700.0>@emqx_protocol:process:257 Client(userid_001@10.211.55.6:56967): Cannot publish to /smarthome/userid_002/temperature for ACL Deny

```

The user ``userid_001`` sends a message to its topic ``/smarthome/userid_001/temperature``, there is no ACL error message in the background, and the message is sent successfully.

```shell
# mosquitto_pub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "/smarthome/userid_001/temperature" -m "hello" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending PUBLISH (d0, q0, r0, m1, '/smarthome/userid_001/temperature', ... (5 bytes))
Client userid_001 sending DISCONNECT

```



## Appendix: Authentication/Access Control Placeholder Contrast Table

| Placeholder | Contrast parameters                                          |
| :---------- | :----------------------------------------------------------- |
| %c          | MQTT clientid                                                |
| %u          | MQTT username                                                |
| %p          | MQTT password                                                |
| %a          | ACL IP address                                               |
| %A          | ACL access method,1: publish  2:subscribe  3:publish/subscribe |
| %t          | MQTT topic in ACL                                            |

