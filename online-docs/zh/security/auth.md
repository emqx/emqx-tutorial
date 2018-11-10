# 认证（认证鉴权）



认证（认证鉴权）指的是当一个客户端连接到 MQTT 服务器的时候，通过服务器端的配置来控制客户端连接服务器的权限。EMQ X 的认证支持包括多个层面，分别有 MQTT 传输层，应用层和 EMQ X 本身以插件的方式来支持各种增强的认证方式。

- 在传输层上，TLS 可以保证使用客户端证书的客户端到服务器的身份验证，并确保服务器向客户端验证服务器证书
- 在应用层上，MQTT 协议本身在 CONNECT 报文中指定用户名和密码。客户端可以在连接到 MQTT 服务器时发送用户名和密码进行认证，有效阻止非法客户端的连接
- EMQ X 层面上，以插件形式支持文件系统、HTTP API、JWT、LDAP 及各类数据库如 MongoDB、MySQL、PostgreSQL、Redis 等多种认证

## 认证与认证链

EMQ X 默认开启匿名认证，即允许任意客户端登录，具体配置在 `etc/emqx.conf` 中：

```bash
## Allow Anonymous authentication
mqtt.allow_anonymous = true
```

EMQ X 认证相关插件名称以 `emqx_auth` 开头。当启用认证插件之前，请在配置文件 `etc/emqx.conf` 中把允许匿名认证的方式给去掉:``mqtt.allow_anonymous = false``。当共同启用多个认证插件时，EMQ X 将按照插件开启先后顺序进行链式认证，一旦认证成功就终止认证链并允许客户端接入，最后一个认证源仍未通过时将终止客户端连接，认证链的认证过程示意图如下所示。

![auth chain](../assets/auth_chain.png)

## 用户名密码认证

用户名密码认证使用配置文件存储用户名与密码，通过 username 与 password 进行连接认证。

打开并配置 `etc/plugins/emqx_auth_username.conf` 文件，按照如下所示创建认证信息：

```bash
# 第一组认证信息
auth.user.1.username = username
auth.user.1.password = passwd

# 第二组认证信息
auth.user.2.username = default_user
auth.user.2.password = passwd2
```

在 EMQ X Dashboard 或控制台启用插件：

```./bin/emqx_ctl plugins load emqx_auth_username```

然后重启 ``emqx`` 服务，如果配置成功正确，可以直接连接成功；如果配置不正确，通过 mosquitto 提供的命令行会报以下的错误。读者在修改了配置文件后，**需要重新启动 ``emqx`` 服务才可以生效**。

```bash
# mosquitto_sub -h $your_host -u username -P passwd1 -t /devices/001/temp
Connection Refused: bad user name or password.
```

EMQ X 的 ``/var/log/emqx/error.log`` 会有类似于以下的错误信息。

```
 [error] <0.1981.0>@emqx_protocol:process:241 Client(mosqsub/10166-master@10.211.55.6:40177): Username 'username' login failed for "No auth module to check!"
```

## ClientID 认证

ClientID 认证使用配置文件存储客户端 ID 与密码，连接时通过 clientid 与 password 进行认证。

配置 `etc/plugins/emqx_auth_clientid.conf` 文件，按照如下所示创建认证信息：

```bash
# 第一组认证信息
auth.client.1.clientid = id
auth.client.1.password = passwd

# 第二组认证信息
auth.client.2.clientid = dev:devid
auth.client.2.password = passwd2
```

在 EMQ X Dashboard 或控制台启用插件：

```./bin/emqx_ctl plugins load emqx_auth_clientid```

重启 ``emqx`` 服务后，可通过 MQTT 客户端通过在上述配置文件中配置的客户端 id 和密码连接至 EMQ，如果指定了错误的客户端 ID 和密码，使用 ``mosquitto_sub`` 的时候会出现如下错误。。

```bash
# mosquitto_sub -h $your_host -u id -i id1 -P passwd -t /devices/001/temp
Connection Refused: bad user name or password.
```


## HTTP 认证

HTTP 认证调用自定义的 HTTP API 实现认证鉴权。


### 实现原理

EMQ X 在设备连接、发布/订阅事件中使用当前客户端相关信息作为参数，向用户自定义的认证服务发起请求查询权限，通过返回的 HTTP **响应状态码** (HTTP Response Code) 来处理事件。

 - 认证成功，API 返回 200 状态码

 - 认证失败，API 返回 4xx 状态码


### 使用方式

打开 `etc/plugins/emqx_auth_http.conf` 文件，配置相关规则：

```bash
## 配置一个认证请求 URL，地址的路径部分“/auth/AuthServlet”，用户可以自己随便定义
auth.http.auth_req = http://$SERVER:8080/auth/AuthServlet

## HTTP 请求方法
auth.http.auth_req.method = post

## 使用占位符传递请求参数
auth.http.auth_req.params = clientid=%c,username=%u,password=%P
```

启用插件并且**重启 EMQ X 服务器**之后，所有的连接将通过 ``http://$SERVER:8080/auth/AuthServlet`` 进行认证，该服务获取到参数并执行相关验证逻辑后返回**相应的 HTTP 响应状态码。**但是具体返回内容视你自己需求而定，EMQ X 不作要求。

以下为一段 Java Servlet 代码示例：

- 当连接的 clientId，username，password 中任意一个为空的时候，返回状态码 ``SC_BAD_REQUEST (400)`` ，表示参数有问题
- 当 clientId 为 id1，username 为 user1，password 为 passwd 的时候，返回状态码 ``OK(200)`` ，表示认证通过；否则返回 ``SC_UNAUTHORIZED(401)``，表示认证失败

```java
package io.emqx;

import java.io.IOException;
import java.text.MessageFormat;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/AuthServlet")
public class AuthServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    public AuthServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String clientId = request.getParameter("clientid");
		String username = request.getParameter("username");
		String password = request.getParameter("password");
		
		System.out.println(MessageFormat.format("clientid: {0}, username: {1}, password:{2}", clientId, username, password));
		
		if(clientId == null || "".equals(clientId.trim()) || username == null || "".equals(username) || password == null || "".equals(password.trim())) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Invalid request contents.");
			return;
		}
		
		if("id1".equals(clientId) && "user1".equals(username) && "passwd".equals(password)) {
			response.setStatus(HttpServletResponse.SC_OK);
			response.getWriter().println("OK");
		} else {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Invalid user credentials.");
			return;
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
```

命令行中输入以下内容，连接成功。

```bash
# mosquitto_sub -h 10.211.55.10 -u user1 -i id1  -P passwd -t /devices/001/temp
```

在 web 服务器中输出以下内容，表明验证信息成功传入。

```bash
clientid: id1, username: user1, password:passwd
```

如果指定了错误的信息，认证将失败。如下所示，指定错误的用户名 ``user``

```bash
# mosquitto_sub -h 10.211.55.10 -u user -i id1  -P passwd -t /devices/001/temp
Connection Refused: bad user name or password.
```




## JWT 认证

TODO：等待 Erlang 文档支持

emqx_auth_jwt 



## LDAP 认证

emqx_auth_ldap 使用 LDAP 协议进行认证。

打开 `etc/plugins/emqx_auth_ldap.conf` 文件，配置相关规则：

```bash
## 服务地址
auth.ldap.servers = 127.0.0.1

## 服务端口
auth.ldap.port = 389

auth.ldap.timeout = 30

## 访问规则
auth.ldap.user_dn = uid=%u,ou=People,dc=example,dc=com

auth.ldap.ssl = false
```




## MySQL/PostgreSQL 认证/访问控制

emqx_auth_mysql / emqx_auth_pgsql 分别为基于 MySQL、PostgreSQL 数据库的认证 / 访问控制插件。


EMQ X 将根据插件配置，使用当前客户端信息生成预定 SQL 语句，查询数据库进行认证操作。


### Auth 配置

比较查询结果中的 `password` 字段是否与当前客户端 password / 加盐加密后的 password (取决于配置) 是否相等，验证流程如下：

- 1. 查询结果集中必须有 `password` 字段；

- 2. EMQ X 根据加盐 (salt) / 加密算法配置处理当前客户端密码；

- 3. 结果集为空或两个字段不等，认证失败。

设计设备表表结构如下：

```sql
CREATE TABLE `mqtt_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `is_superuser` tinyint(1) DEFAULT 0,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mqtt_username` (`username`)
)
```

插入示例数据：

示例数据中密码为 test_password，加密 salt 为 'secret'，使用 MD5 算法对 password + salt 字符串加密：

```java
String password_hash = md5(password + 'secret')
```

```sql
INSERT INTO mqtt_user (client_id, username, password_hash) VALUES ('test_client', 'test_username', '7BA799D1D5C66C4E3607D3AF92455ABC')
```

由于表中没有 `password` 字段，查询 SQL 应该使用 `AS` 语法来转换处理：

```sql
SELECT password_hash AS password where client_id = '%c' and username = '%u'
```

因为使用了 MD5 算法且在 salt 后置加密，需要更改插件中以下配置：

```bash
## 加密算法 plain | md5 | sha | sha256 | bcrypt
## 对应 md5(password + salt)
auth.pgsql.password_hash = MD5,secret

## 对应 md5(salt + password)
## auth.pgsql.password_hash = secret,MD5

## bu加盐
## auth.pgsql.password_hash = MD5
```

配置文件中相应的配置如下：

```sql
## PostgreSQL 认证 SQL
auth.pgsql.auth_query = SELECT password_hash AS password where client_id = '%c' and username = '%u'

## PostgreSQL 密码预处理
auth.pgsql.password_hash = MD5,secret
```

> 将对应配置 key 的 pgsql 换为 mysql 即为 MySQL 的配置如：auth.mysql.password_hash



### Super 配置

比较查询结果中的 `is_superuser` 字段是否为 `true`，"true"、true、'1'、'2'、'3'... 等程序意义上的为真值均可：

```bash
auth.pgsql.super_query = select is_superuser from mqtt_user where username = '%u' limit 1
```


### ACL 配置

通过条件查询出 allow, ipaddr, username, clientid, access, topic 字段进行比较。

设计 ACL 表表结构如下：

```sql
CREATE TABLE `mqtt_acl` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `allow` int(1) DEFAULT NULL COMMENT '0: deny, 1: allow',
  `ipaddr` varchar(60) DEFAULT NULL COMMENT 'IpAddress',
  `username` varchar(100) DEFAULT NULL COMMENT 'Username',
  `clientid` varchar(100) DEFAULT NULL COMMENT 'ClientId',
  `access` int(2) NOT NULL COMMENT '1: subscribe, 2: publish, 3: pubsub',
  `topic` varchar(100) NOT NULL DEFAULT '' COMMENT 'Topic Filter',
  PRIMARY KEY (`id`)
)
```


插入多行示例数据：

```sql
INSERT INTO mqtt_acl (allow, ipaddr, username, clientid, access, topic)
VALUES
    (1,NULL,'$all',NULL,2,'#'), -- 允许任意 IP 地址任意用户名任意客户端 ID 在 # 主题发布消息
    
    (0,NULL,'$all',NULL,1,'$SYS/#'), -- 禁止任意设备订阅 $SYS/# 主题
  
    (0,NULL,'$all',NULL,1,'eq #'), -- 禁止任意设备订阅 # 主题
  
    (1,'127.0.0.1',NULL,NULL,2,'$SYS/#'), -- 允许来自 127.0.0.1 的客户端在 $SYS/# 主题发布消息
  
    (1,'127.0.0.1',NULL,NULL,2,'#'), -- 允许来自 127.0.0.1 的客户端在 # 主题发布消息
  
    (1,NULL,'dashboard',NULL,1,'$SYS/#'); -- 允许 dashboard 客户端订阅 $SYS/# 主题
```


配置设计 SQL 语句能兼顾到所需 ACL：

```bash
auth.pgsql.acl_query = select allow, ipaddr, username, clientid, access, topic from mqtt_acl where ipaddr = '%a' or username = '%u' or username = '$all' or clientid = '%c'
```


### 使用方式

打开 `etc/plugins/emqx_auth_pgsql.conf` 文件，配置数据源与查询规则：

```bash
## 连接地址
auth.pgsql.server = 127.0.0.1:5432

## 连接池
auth.pgsql.pool = 8

auth.pgsql.username = root

## auth.pgsql.password =

auth.pgsql.database = mqtt

auth.pgsql.encoding = utf8

auth.pgsql.ssl = false

## ... 其他 Auth ACL  Super 配置
```

> 数据源连接地址、认证信息等配置错误将无法启动插件。



## Redis 认证/访问控制


Redis 认证/访问控制插件连接至 Redis ，执行带有客户端信息的 Redis command 进行认证操作。

推荐使用 `:` 作为 Redis key 的分隔符将客户端信息放入 Redis key 中，为避免 key 与其他业务重复，格式可以为：

```bash
# 业务标识符:username 或 clientid
prefix:[username|clientid]
```

如 `mqtt_user:emqx`




### Auth 配置

emqx_auth_redis 插件将根据插件配置，使用当前客户端信息生成预定 Redis command，查询结果进行比较。

使用 Redis Hash 存储客户端信息：

```bash
127.0.0.1:6379[2]> HMSET mqtt_user:emqx password public is_superuser false
OK
127.0.0.1:6379[2]>
```

打开 `etc/plugins/emqx_auth_redis.conf`，配置以下信息：

```bash
## 认证时 Redis command
auth.redis.auth_cmd = HMGET mqtt_user:%u password

## Password hash
auth.redis.password_hash = plain
```


至此，`username` 为 `emqx` 的客户端连接时，EMQ X 将执行下列查询：

```bash
127.0.0.1:6379[2]> HMGET mqtt_user:emqx password
1) "public"
```

当查询结果与当前客户端 `password` 相等时，认证成功。




### Super 配置

打开 `etc/plugins/emqx_auth_redis.conf`，配置 super 查询：

```bash
## Super Redis command
auth.redis.super_cmd = HGET mqtt_user:%u is_superuser
```



### ACL 配置

打开 `etc/plugins/emqx_auth_redis.conf`，配置 ACL 查询：

```bash
## ACL Redis command
auth.redis.acl_cmd = HGETALL mqtt_acl:%u
```

按照 ACL 数据元，使用 Redis Hash 存储 ACL 信息：

```bash
127.0.0.1:6379[2]> HMSET mqtt_user:emqx allow 0 username emqx access 3 topic not_allowed_topic
OK
127.0.0.1:6379[2]>
```



### 使用方式

打开 `etc/plugins/emqx_auth_redis.conf` 文件，配置数据源与查询规则：

```bash
## 连接地址
auth.redis.server = 127.0.0.1:6379

## 连接池
auth.redis.pool = 8

## auth.redis.password = 

auth.redis.database = 0

## ... 其他 Auth ACL Super 配置
```

> 数据源连接地址、认证信息等配置错误将无法启动插件，请为 Redis 开启防火墙策略或配置连接认证保障数据安全。



## MongoDB 认证/访问控制

MongoDB 认证/访问控制插件连接至 MongoDB ，执行带有客户端信息的 Query 进行认证操作。




### Auth 配置

emqx_auth_mongo 插件根据配置的存储客户端信息的集合（collection）、password 字段名（password_field）、过滤查询的 selector 进行认证操作：

MongoDB mqtt 数据库中有如下信息：

```bash
## 插入数据
> use mqtt
switched to db mqtt 
> db.mqtt_user.insert({ username: 'emqx', password: 'public', is_superuser: false })
WriteResult({ "nInserted" : 1 })

## 查看数据
> db.mqtt_user.find({})
{ "_id" : ObjectId("5bdfbb8ab988e43692ca93b1"), "username" : "emqx", "password" : "public", "is_superuser" : false }
```



打开 `etc/plugins/emqx_auth_mongo.conf`，配置以下信息：

```bash
## 认证信息所在集合
auth.mongo.auth_query.collection = mqtt_user

## 密码字段
auth.mongo.auth_query.password_field = password

## 密码处理
auth.mongo.auth_query.password_hash = plain

## 查询指令
auth.mongo.auth_query.selector = username=%u
```


至此，`username` 为 `emqx` 的客户端连接时，EMQ X 将执行下列查询：

```bash
> db.mqtt_user.findOne({ username: 'emqx' })
{
	"_id" : ObjectId("5bdfbb8ab988e43692ca93b1"),
	"username" : "emqx",
	"password" : "public",
	"is_superuser" : false
}
```

当查询结果中的 `password`（password_field 字段）与当前客户端 `password` 相等时，认证成功。




### Super 配置

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

当查询结果中的 `is_superuser`（super_field 字段）为 `true` 时，认证成功。



### ACL 配置

打开 `etc/plugins/emqx_auth_mongo.conf`，配置 ACL 查询：

```bash
## 是否开启 ACL 控制
auth.mongo.acl_query = on

## ACL 信息所在集合
auth.mongo.acl_query.collection = mqtt_acl

## 查询指令
auth.mongo.acl_query.selector = username=%u
```

按照 ACL 数据元，插入以下 ACL 信息：

```bash
> use mqtt
switched to db mqtt
> db.mqtt_acl.insert({ allow: 0, username: 'emqx', access: 3, topic: 'not_allowed_topic' })
WriteResult({ "nInserted" : 1 })
```



### 使用方式

打开 `etc/plugins/emqx_auth_mongo.conf` 文件，配置数据源与查询规则：

```bash
## MongoDB 拓扑模式
auth.mongo.type = single

## MongoDB 地址
auth.mongo.server = 127.0.0.1:27017

## MongoDB 连接池大小
auth.mongo.pool = 8

## MongoDB 用户名
## auth.mongo.login =

## MongoDB 密码
## auth.mongo.password =

## MongoDB 数据库名
auth.mongo.database = mqtt

## ... 其他 Auth ACL Super 配置
```

> 数据源连接地址、认证信息等配置错误将无法启动插件，请为 MongoDB 开启防火墙策略或配置连接认证以保障数据安全。


