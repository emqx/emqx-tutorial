# ACL（Access Control List）访问控制

上一章介绍的认证（认证鉴权）用于控制用户是否可以登录 EMQ X 服务器；而本章则介绍利用 ACL 用户控制用户的权限：EMQ X 支持限定客户端可以使用的主题，从而实现设备权限的管理。

## ACL 访问控制

EMQ X 默认开启 ACL 白名单，允许不在 ACL 列表中的发布订阅行为，具体配置在 `etc/emqx.conf` 中：

```bash
## ACL nomatch
mqtt.acl_nomatch = allow

## Default ACL File
## etc/acl.conf 文件中配置了基础的 ACL 规则
mqtt.acl_file = etc/acl.conf
```

ACL 访问控制规则定义规则如下:

```bash
允许 (Allow)|拒绝 (Deny)  谁(Who)  订阅 (Subscribe)|发布 (Publish)   主题列表 (Topics)
```

EMQ X  接收到 MQTT 客户端发布 (PUBLISH) 或订阅 (SUBSCRIBE) 请求时，会逐条匹配 ACL 访问控制规则，直到匹配成功返回 allow 或 deny。

- ACL 可以设置超级用户，如果是超级用户客户端，可以进行任意发布 / 订阅操作
- ACL 控制与认证用的是同一个配置文件``plugins/emqx_auth_xxx.conf``，但并不是所有的插件都支持 ACL。

## ACL 缓存

```bash
## 是否缓存 ACL 规则，设定了缓存之后，可以加快获取 ACL 记录的速度
mqtt.cache_acl = true
```

ACL 规则在命中后，会在内存中有缓存，避免下次需要验证 ACL 的时候访问外部存储设备，加快访问的速度。ACL 在内存中的缓存只有在连接建立和存在的时间段内有效，如果连接断开，该连接对应的 ACL 信息会被删除；用户可以通过 EMQ X 提供的 REST API 来删除 ACL 信息。

```json
  {
        "name": "clean_acl_cache",
        "method": "DELETE",
        "path": "/connections/:clientid/acl/:topic",
        "descr": "Clean ACL cache of a connection"
  }
```



## 配置文件访问控制

### ACL 配置

#### 准备访问控制数据

设定如下的访问规则。

1. 设定所有用户不可以订阅系统主题，除了从特定机器 ``10.211.55.10`` 发起的连接除外；
2. 应用的主题设计为``/smarthome/$clientId/temperature``，设定一条规则只允许相同的 ``clientId`` 的设备才可以对它自己的主题进行发布消息操作

打开访问控制的配置文件 ``/etc/emqx/acl.conf`` ，配置文件内容如下。

```bash
{allow, {user, "dashboard"}, subscribe, ["$SYS/#"]}.

{allow, all, publish, ["/smarthome/%c/temperature"]}.

{allow, {ipaddr, "10.211.55.10"}, pubsub, ["$SYS/#", "#"]}.

{deny, all, subscribe, ["$SYS/#", {eq, "#"}]}.
```

#### 修改配置文件

打开配置文件 ``/etc/emqx/emqx.conf`` ，将 ACL 的规则匹配变为：不匹配则不允许。

```bash
mqtt.acl_nomatch = deny
```

打开配置文件 ``/etc/emqx/plugins/emqx_auth_username.conf``，加入以下的认证用户。

```
auth.user.1.username = userid_001
auth.user.1.password = public
```

使用命令行 ``emqx_ctl plugins load emqx_auth_username`` 激活 emqx_auth_username 插件，然后重启 EMQ X 服务。

#### 测试系统主题

在机器 ``10.211.55.6`` 订阅系统主题，请注意订阅系统主题的时候，在 mosquitto 客户端需要对主题的字符``$``前加入转义符 ``\``，变成 ``\$SYS/#`` ，命令如下所示。目前版本无法在前端知道是否订阅失败，需要结合EMQ X 后台日志才可以进行判断。

```bash
mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "\$SYS/#" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 128
```

EMQ X 后台日志（``/var/log/emqx/error.log``）出错信息。

```bash
2018-11-13 02:12:43.866 [error] <0.1993.0>@emqx_protocol:process:294 Client(test_username1@10.211.55.6:57612): Cannot SUBSCRIBE [{<<"$SYS/#">>,[{qos,0}]}] for ACL Deny
```

在机器 ``10.211.55.10`` 订阅系统主题，成功收到所有的系统消息。

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

#### 测试设备操作自己的主题

订阅失败，结合 EMQ X 的后台日志可以得知 ACL 禁止的消息。

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "/smarthome/user1/temperature" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: /smarthome/user1/temperature, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 128
```

EMQ X 后台日志（``/var/log/emqx/error.log``）出错信息。

```bash
2018-11-13 02:16:56.118 [error] <0.2001.0>@emqx_protocol:process:294 Client(test_username1@10.211.55.6:57676): Cannot SUBSCRIBE [{<<"/smarthome/user1/temperature">>,[{qos,0}]}] for ACL Deny
```

成功的订阅：EMQ X 后台日志（``/var/log/emqx/error.log``）如果没有打印 ACL 的出错信息表示订阅成功。

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "/smarthome/test_username1/temperature" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: /smarthome/test_username1/temperature, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 0
```

## HTTP 访问控制

HTTP 访问控制使用 HTTP API 实现ACL 控制。


### 实现原理

EMQ X 在发布/订阅的时候使用当前客户端相关信息作为参数，发起请求查询设备权限，通过 HTTP 响应状态码 (HTTP Status) 来处理事件。

 - ACL 成功，API 返回 200 状态码

 - ACL 失败，API 返回 4xx 状态码


### 使用方式

打开 `etc/plugins/emqx_auth_http.conf` 文件，配置相关规则：

```bash
## 配置超级用户 ACL 地址，这里指定相关的服务器地址和端口，路径可以按照你自己的实现来指定
auth.http.super_req = http://$server:$port/mqtt/admin
auth.http.super_req.method = post
auth.http.super_req.params = clientid=%c,username=%u

## 配置 ACL URL 地址，
auth.http.acl_req = http://$server:$port/mqtt/acl
auth.http.acl_req.method = get
auth.http.acl_req.params = access=%A,username=%u,clientid=%c,ipaddr=%a,topic=%t
```

装载插件后重新启动 EMQ X，EMQ X 将通过指定的 ACL 地址进行检查，Web 服务器获取到 EMQ X 提交的参数并执行相关逻辑后返回**相应的 HTTP 响应状态码。**但是具体返回内容视你自己需求而定，EMQ X 不作要求。

> 配置中的详细占位符定义请见页底。

如下所示为超级用户的实现代码，这里判断传入的 ``clientId`` 为 ``sysadmin`` 的时候就返回200，认为该用户为超级用户；否则返回 SC_FORBIDDEN，表示不允许访问。超级用户不受 ACL 的控制。

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

下列代码是验证 ACL 逻辑的示例，判断传入的 ``clientId`` 以及操作的 ``topic`` 之间的关系，如果 ``topic`` 以 ``clientId`` 结尾，那么返回200，表示可以操作；否则返回403（Forbidden），表示不可以操作。

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

客户端通过 ``mosquitto_pub`` 发出消息，但是由于我们设定的规则不允许该用户往该主题发送消息，前端看起来都正常，如下图所示。

```shell
# mosquitto_pub -h 10.211.55.10 -u user1 -i id1  -P passwd -t /devices/001/temp -m "hello" -d
Client id1 sending CONNECT
Client id1 received CONNACK
Client id1 sending PUBLISH (d0, q0, r0, m1, '/devices/001/temp', ... (5 bytes))
Client id1 sending DISCONNECT
```

在后端的日志中，会报出一条错误，提示该客户端不允许往该主题上发送消息。

```bash
2018-11-12 14:46:02.773 [error] <0.2004.0>@emqx_protocol:process:257 Client(id1@10.211.55.6:41367): Cannot publish to /devices/001/temp for ACL Deny
```

使用如下所示的命令，发送消息就正常。

```shell
# mosquitto_pub -h 10.211.55.10 -u user1 -i id1  -P passwd -t /devices/001/temp/id1 -m "hello"
```

但是如果是超级用户登录的话，就不会出现 ``ACL Deny`` 的错误消息，可以往任意主题发送、订阅消息。

```bash
# mosquitto_sub -h 10.211.55.10 -u sysadmin -i sysadmin  -P sysadmin -t /devices/001/temp
hello
```

## MySQL/PostgreSQL 访问控制

emqx_auth_mysql / emqx_auth_pgsql 插件分别为基于 MySQL、PostgreSQL 数据库的访问控制插件。

> 用户认证（鉴权）和访问控制用的是同一个配置文件

### 超级用户配置

超级用户的设置是通过用户认证表的数据验证来实现的。如下所示，打开配置文件 emqx_auth_mysql.conf / emqx_auth_pgsql.conf 比较查询结果中的 `is_superuser` 字段是否为 `true`，"true"、true、'1'、'2'、'3'... 等程序意义上的为真值均可。超级用户不受 ACL 的控制。

```bash
auth.mysql.super_query = SELECT is_superuser FROM mqtt_user WHERE username = '%u' LIMIT 1
```

### ACL 配置

#### 创建数据库

>  如果读者在阅读过 MySQL/PostgreSQL 认证部分，已经创建过数据库的话，可以跳过这部分。

读者可以使用任何自己喜欢的 mysql 客户端，创建好相应的数据库。这里用的是 MySQL 自带的命令行客户端，打开 MySQL 的控制台，如下所示，创建一个名为 ``emqx`` 的认证数据库，并切换到  ``emqx``  数据库。

```sql
mysql> create database emqx;
Query OK, 1 row affected (0.00 sec)

mysql> use emqx;
Database changed
```

#### 创建表

建议的表结构如下，其中，

- allow：禁止（0）；或则允许（1）。

- ipaddr：设置 IP 地址。
- username：连接客户端的用户名，此处的值如果设置为 ``$all``  表示该规则适用于所有的用户。
- clientid：连接客户端的 clientId。
- access：允许的操作。订阅（1）；发布（2）；订阅和发布都可以（3）。
- topic：控制的主题名。主题可以使用通配符；并且可以在主题中加入占位符 ``%c`` , 来匹配带客户端 ID 的主题，例如 ``/smarthome/$clientId/temperature`` 。

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

创建成功后，查看一下表结构，

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

#### 准备访问控制数据

现在要制定以下规则：

1. 设定所有用户不可以订阅系统主题，除了从特定机器 ``10.211.55.10`` 发起的连接除外；
2. 应用的主题设计为``/smarthome/$clientId/temperature``，设定一条规则只允许相同的 ``clientId`` 的设备才可以对它自己的主题进行发布消息操作

```sql
# 所有用户不可以订阅系统主题
INSERT INTO mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (0, NULL, '$all', NULL, 1, '$SYS/#');

# 允许10.211.55.10上发起的连接订阅系统主题
INSERT INTO mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (1, '10.211.55.10', NULL, NULL, 1, '$SYS/#');

# 允许设备只对自己的主题进行发布消息
INSERT INTO mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (1, NULL, NULL, NULL, 1, '/smarthome/%c/temperature');
```

#### 修改配置

打开配置文件 ``/etc/emqx/emqx.conf`` ，将 ACL 的规则匹配变为：不匹配则不允许。

```bash
mqtt.acl_nomatch = deny
```


打开配置文件 ``/etc/emqx/plugins/emqx_auth_mysql.conf``，设置 SQL 语句如下，

```bash
auth.mysql.acl_query = select allow, ipaddr, username, clientid, access, topic from mqtt_acl where ipaddr = '%a' or username = '%u' or username = '$all' or clientid = '%c'
```

保存配置文件后，激活 emqx_auth_mysql 和 emqx_auth_pgsql 插件，并重启 EMQ X 服务。

#### 测试系统主题

在机器 ``10.211.55.6`` 订阅系统主题，请注意订阅系统主题的时候，在 mosquitto 客户端需要对主题的字符``$``前加入转义符 ``\``，变成 ``\$SYS/#`` ，命令如下所示。目前版本无法在前端知道是否订阅失败，需要结合EMQ X 后台日志才可以进行判断。

```bash
mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "\$SYS/#" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 128
```

EMQ X 后台日志（``/var/log/emqx/error.log``）出错信息。

```bash
2018-11-13 02:12:43.866 [error] <0.1993.0>@emqx_protocol:process:294 Client(test_username1@10.211.55.6:57612): Cannot SUBSCRIBE [{<<"$SYS/#">>,[{qos,0}]}] for ACL Deny
```

在机器 ``10.211.55.10`` 订阅系统主题，成功收到所有的系统消息。

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

#### 测试设备操作自己的主题

订阅失败，结合 EMQ X 的后台日志可以得知 ACL 禁止的消息。

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "/smarthome/user1/temperature" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: /smarthome/user1/temperature, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 128
```

EMQ X 后台日志（``/var/log/emqx/error.log``）出错信息。

```bash
2018-11-13 02:16:56.118 [error] <0.2001.0>@emqx_protocol:process:294 Client(test_username1@10.211.55.6:57676): Cannot SUBSCRIBE [{<<"/smarthome/user1/temperature">>,[{qos,0}]}] for ACL Deny
```

成功的订阅：EMQ X 后台日志（``/var/log/emqx/error.log``）如果没有打印 ACL 的出错信息表示订阅成功。

```bash
# mosquitto_sub -h 10.211.55.10 -u test_username1 -i test_username1  -P test_password  -t "/smarthome/test_username1/temperature" -d
Client test_username1 sending CONNECT
Client test_username1 received CONNACK
Client test_username1 sending SUBSCRIBE (Mid: 1, Topic: /smarthome/test_username1/temperature, QoS: 0)
Client test_username1 received SUBACK
Subscribed (mid: 1): 0
```

## Redis 访问控制

emqx_auth_redis 插件为基于 Redis 数据库的访问控制插件。Redis 里现在只支持白名单配置，就是只有在 Redis 中列出的规则才可以对某主题具有访问权限。

> 用户认证（鉴权）和访问控制中用的是同一个配置文件

### 超级用户配置

如果按照在[认证](auth.md)中的配置，超级用户是通过获取保存在 Redis 数据库中 ``mqtt_user`` 数据结构的 ``is_superuser`` 字段中的值判断该用户是否为超级用户。打开 `etc/plugins/emqx_auth_redis.conf`，配置 super 查询。超级用户不受 ACL 的控制。

```bash
## Super Redis command
auth.redis.super_cmd = HGET mqtt_user:%u is_superuser
```

### ACL 配置

#### 准备 ACL 数据

采用 Redis 的 Hash 来存储 ACL 信息，格式如下：

- username：用户名，表示客户端的用户名称
- topicname：主题名
- [1|2|3]：1为订阅；2为发布；3为订阅和发布

```bash
HSET mqtt_acl:username topicname [1|2|3]
```

如下所示，为用户名为 ``user1`` 的客户端设定可以订阅系统主题 ``$SYS/#``。

```bash
## 设定主题 $SYS/# 的权限为可以订阅
127.0.0.1:6379[2]> HMSET mqtt_acl:userid_001 $SYS/# 1
OK

## 取出主题 $SYS/# 的权限
127.0.0.1:6379> HMGET mqtt_acl:userid_001 $SYS/#
1) "1"

## 设定主题 $SYS/# 的权限为可以发布
127.0.0.1:6379> HMSET mqtt_acl:userid_001 /smarthome/%c/temperature 2
OK

## 取出主题 $SYS/# 的权限
127.0.0.1:6379> HMGET mqtt_acl:userid_001 /smarthome/%c/temperature
1) "2"
```

#### 修改配置文件

打开配置文件 ``/etc/emqx/emqx.conf`` ，将 ACL 的规则匹配变为：不匹配则不允许。

```bash
mqtt.acl_nomatch = deny
```

打开 `etc/plugins/emqx_auth_redis.conf`，配置 ACL 查询：

```bash
## %u: 用户名
## %c: 客户端ID
auth.redis.acl_cmd = HGETALL mqtt_acl:%u
```

保存配置文件后，激活 emqx_auth_redis插件，并重启 EMQ X 服务。

#### 测试系统主题

请注意订阅系统主题的时候，在 mosquitto 客户端需要对主题的字符``$``前加入转义符 ``\``，变成 ``\$SYS/#`` ，命令如下所示。订阅成功后能接收到系统主题上的消息。

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

在 Redis 中把该用户对系统主题的权限设置为只能发布。

```shell
127.0.0.1:6379> HMSET mqtt_acl:userid_001 $SYS/# 2
OK
```

订阅失败，结合 EMQ X 的后台日志可以得知 ACL 禁止的消息。

```shell
# mosquitto_sub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "\$SYS/#" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending SUBSCRIBE (Mid: 1, Topic: $SYS/#, QoS: 0)
Client userid_001 received SUBACK
Subscribed (mid: 1): 128
```

EMQ X 后台日志（``/var/log/emqx/error.log``）出错信息。

```shell
2018-11-13 12:08:48.178 [error] <0.1958.0>@emqx_protocol:process:294 Client(userid_001@10.211.55.6:43337): Cannot SUBSCRIBE [{<<"$SYS/#">>,[{qos,0}]}] for ACL Deny
```

#### 测试设备操作自己的主题

用户 ``userid_001`` 向不是自己的主题 ``/smarthome/userid_002/temperature`` 发送消息，结合 EMQ X 的后台日志可以得知 ACL 禁止的消息

```shell
# mosquitto_pub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "/smarthome/userid_002/temperature" -m "hello" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending PUBLISH (d0, q0, r0, m1, '/smarthome/userid_002/temperature', ... (5 bytes))
Client userid_001 sending DISCONNECT
```

EMQ X 后台日志（``/var/log/emqx/error.log``）出错信息。

```shell
2018-11-13 12:11:33.785 [error] <0.1966.0>@emqx_protocol:process:257 Client(userid_001@10.211.55.6:43448): Cannot publish to /smarthome/userid_002/temperature for ACL Deny
```

用户 ``userid_001`` 向自己的主题 ``/smarthome/userid_001/temperature`` 发送消息，后台无 ACL 出错信息，发送消息成功。

```shell
# mosquitto_pub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "/smarthome/userid_001/temperature" -m "hello" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending PUBLISH (d0, q0, r0, m1, '/smarthome/userid_001/temperature', ... (5 bytes))
Client userid_001 sending DISCONNECT
```

## MongoDB 访问控制

emqx_auth_mongo 插件为基于 Mongo 数据库的访问控制插件。MongoDB 里现在只支持白名单配置，就是只有在 MongoDB 中列出的规则才可以对某主题具有访问权限。

> 用户认证（鉴权）和访问控制中用的是同一个配置文件


### 超级用户配置

打开 `etc/plugins/emqx_auth_mongo.conf`，配置 super 查询：

```bash
## 是否开启
auth.mongo.super_query = on

## super 信息所在集合
auth.mongo.super_query.collection = mqtt_user

## super 字段
auth.mongo.super_query.super_field = is_superuser

## 查询指令
auth.mongo.super_query.selector = username=%u
```

当查询结果中的 `is_superuser`（super_field 字段）为 `true` 时，表示当前用户为。

### ACL 配置

#### 准备 ACL 数据

MongoDB 中定义的 ACL 数据结构如下，

- username：登录的用户名称
- clientid：登录的客户端id
- publish：数组格式，该用户允许的发布的消息主题名称列表，如果没有可以忽略该字段。
- subscribe：数组格式，该用户允许的订阅的消息主题名称列表，如果没有可以忽略该字段。
- pubsub：数组格式，该用户允许的既可以发布、也可以订阅的消息主题名称列表，如果没有可以忽略该字段。

```json
{
    username: "username",
    clientid: "clientid",
    publish: ["topic1", "topic2", ...],
    subscribe: ["subtop1", "subtop2", ...],
    pubsub: ["topic/#", "topic1", ...]
}
```

在 MongoDB 中插入以下 ACL 信息，

- 用户名和客户端 ID 为 userid_001 的用户，可以在自己的主题  ``/smarthome/%c/temperature`` 上进行发布操作；也可以在系统主题上进行订阅操作。

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

#### 修改配置文件

打开配置文件 ``/etc/emqx/emqx.conf`` ，将 ACL 的规则匹配变为：不匹配则不允许。

```bash
mqtt.acl_nomatch = deny
```

打开 `etc/plugins/emqx_auth_mongo.conf`，配置 ACL 查询，

```bash
## 是否开启 ACL 控制
auth.mongo.acl_query = on

## ACL 信息所在集合
auth.mongo.acl_query.collection = mqtt_acl

## 查询指令
auth.mongo.acl_query.selector = username=%u
```

保存配置文件后，激活 emqx_auth_mongodb 插件，并重启 EMQ X 服务。

#### 测试系统主题

请注意订阅系统主题的时候，在 mosquitto 客户端需要对主题的字符``$``前加入转义符 ``\``，变成 ``\$SYS/#`` ，命令如下所示。订阅成功后能接收到系统主题上的消息。

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

#### 测试设备操作自己的主题

用户 ``userid_001`` 向不是自己的主题 ``/smarthome/userid_002/temperature`` 发送消息，结合 EMQ X 的后台日志可以得知 ACL 禁止的消息

```shell
# mosquitto_pub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "/smarthome/userid_002/temperature" -m "hello" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending PUBLISH (d0, q0, r0, m1, '/smarthome/userid_002/temperature', ... (5 bytes))
Client userid_001 sending DISCONNECT
```

EMQ X 后台日志（``/var/log/emqx/error.log``）出错信息。

```shell
2018-11-13 21:44:44.161 [error] <0.2700.0>@emqx_protocol:process:257 Client(userid_001@10.211.55.6:56967): Cannot publish to /smarthome/userid_002/temperature for ACL Deny
```

用户 ``userid_001`` 向自己的主题 ``/smarthome/userid_001/temperature`` 发送消息，后台无 ACL 出错信息，发送消息成功。

```shell
# mosquitto_pub -h 10.211.55.10 -u userid_001 -i userid_001 -P public -t "/smarthome/userid_001/temperature" -m "hello" -d
Client userid_001 sending CONNECT
Client userid_001 received CONNACK
Client userid_001 sending PUBLISH (d0, q0, r0, m1, '/smarthome/userid_001/temperature', ... (5 bytes))
Client userid_001 sending DISCONNECT
```



## 附录：认证/访问控制占位符对照表

| 占位符 | 对照参数                                        |
| :----- | :---------------------------------------------- |
| %c     | MQTT clientid                                   |
| %u     | MQTT username                                   |
| %p     | MQTT password                                   |
| %a     | ACL IP 地址                                     |
| %A     | ACL access 方式，1: 发布  2：订阅  3：发布/订阅 |
| %t     | ACL 中 MQTT topic                               |

