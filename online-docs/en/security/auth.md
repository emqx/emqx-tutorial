# Authentication

Authentication is used to control the client access through server-side configuration when a client connects to MQTT server. EMQ X authentication supports multiple level, which includes MQTT protocol transportation layer, MQTT protocol application layer, and EMQ X plugin layer.  

- MQTT protocol transportation layer, TLS certification can be used for user identification, and server verify client's certification. 
- MQTT protocol application layer, MQTT protocol supports to specify username and password in MQTT CONNECT packet. User name and password are sent and used to authenticated when connecting to server,  and invalid connections are not allowed.
- EMQ X layer, different authentication plugins are provided, such as configuration file, HTTP API, JWT, LDAP and different kinds of databases, such as MongoDB, MySQL,  PostgreSQL & Redis. 

## Authentication and authentication chain

EMQ X enables anonymous authentication by default, which means allowing any clients to login. The configuration can be found in  `etc/emqx.conf`. 

```bash
## Allow Anonymous authentication
mqtt.allow_anonymous = true
```

EMQ X authentication related plugins are prefixed with `emqx_auth`. Before starting to use any authentication plugins, please disable anonymous authentication in configuration file `etc/emqx.conf`: ``mqtt.allow_anonymous = false``. When multiple authentication plugins are enabled, EMQ X will authenticate clients with plugin enable sequence. If a client is authenticated successfully against any plugin in plugin chain successfully, then the client is allowed to connect. The client will be forbid to connect if the last plugin in the authentication chain failed to authenticate. The authentication process is described in below picture.

![auth chain](../assets/auth_chain.png)

## User name and password authentication 

This plugin uses configuration file to store user name and password, and client uses username and password to authentication.

Open and configure `etc/plugins/emqx_auth_username.conf` file, and create authentication info with following:

```bash
# The 1st authentication info
auth.user.1.username = username
auth.user.1.password = passwd

# The 2nd authentication info
auth.user.2.username = default_user
auth.user.2.password = passwd2
```

Enable plugin in EMQ X dashboard or command line:

```./bin/emqx_ctl plugins load emqx_auth_username```

Then restart the  ``emqx`` service. If it is configured successfully, then it can be connected successfully with right username and password; If specified with wrong username and password, it reports below error with mosquitto client tools. **Please reboot EMQ X service to make the configuration effective** after chaning the configuration file. 

```bash
# mosquitto_sub -h $your_host -u username -P passwd1 -t /devices/001/temp
Connection Refused: bad user name or password.
```

Below error message can be found in ``/var/log/emqx/error.log`` .

```
 [error] <0.1981.0>@emqx_protocol:process:241 Client(mosqsub/10166-master@10.211.55.6:40177): Username 'username' login failed for "No auth module to check!"
```

## ClientID authentication

ClientID authentication use configuration file to store client ID and password. ClientId & password are used to authenticate. 

Refer to below to create authtication in file `etc/plugins/emqx_auth_clientid.conf` :

```bash
# The 1st group of authentication info
auth.client.1.clientid = id
auth.client.1.password = passwd

# The 2nd group of authentication info
auth.client.2.clientid = dev:devid
auth.client.2.password = passwd2
```

Enable plugin in EMQ X dashboard or command line:

```./bin/emqx_ctl plugins load emqx_auth_clientid```

After rebooting ``emqx`` service, user can connect to EMQ server with clientId and password configured in previous configuration file. If wrong clientId and password are specified, below error message can be found with ``mosquitto_sub``  client tools. 

```bash
# mosquitto_sub -h $your_host -u id -i id1 -P passwd -t /devices/001/temp
Connection Refused: bad user name or password.
```


## HTTP authentication

HTTP authentication invokes customized HTTP API to realize the authetication.


### Implementation principle

EMQ X uses current client connection related info as request parameters, and submit the request against customized authentication services to validate the account. EMQ X validate the connection with the returned **HTTP response code**. 

 - Authentication success, API returns 200 response code. 

 - Authentication fail, API returns 4xx response code. 


### Implementation steps

Open configuration file `etc/plugins/emqx_auth_http.conf` , and make following changes.

```bash
## Configure an authentication URL.the path, "/auth/AuthServlet", of URL can be be any customized string.
auth.http.auth_req = http://$SERVER:$port/auth/AuthServlet

## HTTP request method
auth.http.auth_req.method = post

## Use the pre-defined placeholders to pass parameters.
auth.http.auth_req.params = clientid=%c,username=%u,password=%P
```

After enabling plugin and reboot EMQ X service, all of clients will authenticate against URL  ``http://$SERVER:8080/auth/AuthServlet``. The service gets the parameters and executes related business logic, then returns corresponding HTTP response code. The HTTP response contents are not required by EMQ X, so you can return any contents.

Below is a sample Java servlet code. 

- When any field of clientId, username, password is empty, the service returns  ``SC_BAD_REQUEST (400)`` , which means wrong parameters.
- When clientId is id1, username is user1 and password is passwd, reutrn the response code ``OK(200)`` , which means authtication success, otherwise returns  ``SC_UNAUTHORIZED(401)`` , which means authentication fail. 

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

Type below in command line, and connect successfully. 

```bash
# mosquitto_sub -h 10.211.55.10 -u user1 -i id1  -P passwd -t /devices/001/temp
```

Below message is print in web server log, which means the authentication info is passed successfully. 

```bash
clientid: id1, username: user1, password:passwd
```

With wrong parameters, authentication will be failed. Below is an example of specifying with not correct username  ``user``.

```bash
# mosquitto_sub -h 10.211.55.10 -u user -i id1  -P passwd -t /devices/001/temp
Connection Refused: bad user name or password.
```




## MySQL/PostgreSQL 认证

emqx_auth_mysql / emqx_auth_pgsql 分别为基于 MySQL、PostgreSQL 数据库的认证 / 访问控制插件。EMQ X 将根据插件配置，使用当前客户端信息生成预定 SQL 语句，查询数据库进行认证操作。

### Auth 配置

MySQL 的安装过程请读者参考网上相关文章，此处不再赘述。

#### 创建数据库

读者可以使用任何自己喜欢的 mysql 客户端，创建好相应的数据库。这里用的是 MySQL 自带的命令行客户端，打开 MySQL 的控制台，如下所示，创建一个名为 ``emqx`` 的认证数据库，并切换到  ``emqx``  数据库。

```mysql
mysql> create database emqx;
Query OK, 1 row affected (0.00 sec)

mysql> use emqx;
Database changed
```

#### 创建表

建议的表结构如下，其中，

- username 为客户端连接的时候指定的用户名
- password_hash 为使用 salt 加密后的密文
- salt 为加密串
- is_superuser 是否为超级用户，用于控制 ACL，缺省为0；设置成1的时候为超级用户，跳过 ACL 检查。具体请参考 [ACL（Access Control List）访问控制](acl.md)。

注：读者在生成的表格中，字段可以不用完全跟下面的一致，用户可以通过配置  ``emqx_auth_mysql.conf `` 文件中的 ``authquery `` 的 SQL 语句来适配）。

```sql
CREATE TABLE `mqtt_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `salt` varchar(40) DEFAULT NULL,
  `is_superuser` tinyint(1) DEFAULT 0,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mqtt_username` (`username`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
```

创建成功后，查看一下表结构如下，

```mysql
mysql> desc mqtt_user;
+---------------+------------------+------+-----+---------+----------------+
| Field         | Type             | Null | Key | Default | Extra          |
+---------------+------------------+------+-----+---------+----------------+
| id            | int(11) unsigned | NO   | PRI | NULL    | auto_increment |
| username      | varchar(100)     | YES  | UNI | NULL    |                |
| password_hash | varchar(255)     | YES  |     | NULL    |                |
| salt          | varchar(40)      | YES  |     | NULL    |                |
| is_superuser  | tinyint(1)       | YES  |     | 0       |                |
| created       | datetime         | YES  |     | NULL    |                |
+---------------+------------------+------+-----+---------+----------------+
6 rows in set (0.01 sec)
```

#### 准备认证数据

比较查询结果中的 `password` 字段的值是否与当前客户端的密码进行加盐加密后的值是否相等，验证流程如下：

- 查询结果集中必须有 `password` 字段；
- 在数据库中可以为每个客户端都指定一个 salt，EMQ X 根据客户端传入的密码和通过 SQL 返回的 salt 信息生成密文；
- 结果集为空或两个字段不等，认证失败。

插入示例数据，示例数据中密码为 ``test_password``，加密 salt 为 ``secret``，在 EMQ X 的配置文件的 ``auth.mysql.password_hash`` 中，**salt 只是一个标识符，不代表使用该字符进行加盐处理**。

- 如果采用``auth.mysql.password_hash = md5,salt`` ，那么 EMQ X 使用 MD5 算法对 ``test_passwordsecret`` 字符串加密；
- 如果采用``auth.mysql.password_hash = salt,md5`` ，那么 EMQ X 使用 MD5 算法对 ``secrettest_password`` 字符串加密；

本文采用第一种配置方式，将得到的 MD5 密文插入表 ``mqtt_user``。读者可以通过[在线的 MD5 工具](https://www.md5hashgenerator.com/)或者自己写程序对密码进行编码。

```java
MD5("test_passwordsecret") -> a904b2d1d2b2f73de384955022964595
```

```sql
mysql> INSERT INTO mqtt_user(username,password_hash,salt) VALUES('test_username', 'a904b2d1d2b2f73de384955022964595', 'secret');

Query OK, 1 row affected (0.00 sec)

mysql> select * from mqtt_user;
+----+----------------+----------------------------------+--------+--------------+---------+
| id | username       | password_hash                    | salt   | is_superuser | created |
+----+----------------+----------------------------------+--------+--------------+---------+
|  3 | test_username1 | a904b2d1d2b2f73de384955022964595 | secret |            0 | NULL    |
+----+----------------+----------------------------------+--------+--------------+---------+
1 row in set (0.00 sec)
```

#### 修改 EMQ X 配置文件

由于表中没有 `password` 字段，查询 SQL 应该使用 `AS` 语法来转换处理：

```sql
SELECT password_hash AS password, ...
```

修改后的主要配置如下所示，其它相关配置，请参考配置文件中相应的描述进行修改。

```bash
## 修改为实际 mysql 所在的服务器地址
auth.mysql.server = $mysql_host:3306

## 修改为上面创建成功的 emqx 数据库
auth.mysql.database = emqx

auth.mysql.auth_query = SELECT password_hash AS password, salt FROM mqtt_user WHERE username = '%u'

## 加密算法 plain | md5 | sha | sha256 | bcrypt
## 加盐加密算法
auth.mysql.password_hash = md5,salt

## 不加盐加密算法，直接写算法名称即可
# auth.mysql.password_hash = md5
```

PostgreSQL 的用法与 MySQL 类似，读者可以参考本章的配置，此处不再赘述。



## Redis 认证

### Auth 配置

客户端上线后，Redis 认证插件连接至 Redis ，通过查询和比对 Redis 中预先存储的认证信息来判断该客户端是否有权限连接该服务器。

#### Redis 安装

读者可以参考数据持久化部分中的[安装与验证 redis 服务器](../backend/redis.html#安装与验证-redis-服务器)章节来完成 Redis 的安装，此处不再赘述。

#### 准备数据

需要先将认证数据存入 Redis 数据库中，推荐使用 `:` 作为 Redis key 的分隔符，为避免 key 与其他业务重复，建议可以加入一个业务标识符前缀，key 的格式如下。

```bash
# 业务标识符前缀:username 或 clientid
prefix:[username|clientid]
```

如 `mqtt_user:userid_001` 。

通过 Redis 提供的命令行工具 ``redis-cli`` 来将认证数据导入到 Redis Hash 数据结构中，读者可以参考 [hmset](https://redis.io/commands/hmset) 和 [hget](https://redis.io/commands/hget)  获取更加详细的介绍。

```bash
## 将 key 为 mqtt_user:userid_001；设置密码字段为 public，设置is_superuser字段为 false
127.0.0.1:6379[2]> HMSET mqtt_user:userid_001 password "public" is_superuser false
OK

## 列出所有的 key，刚存入的被列出
127.0.0.1:6379[2]> keys *
1) "mqtt_user:userid_001"

## 展示客户端的 key 为 mqtt_user:userid_001 的 password 字段值
127.0.0.1:6379> hget mqtt_user:userid_001 password
"public"

## 展示客户端的 key 为 mqtt_user:userid_001 的 is_superuser 字段值
127.0.0.1:6379> hget mqtt_user:userid_001 is_superuser
"false"
```

#### 修改配置文件

emqx_auth_redis 插件将根据插件配置，根据传入的客户端信息生成相应的 Redis 命令，查询结果进行比较。

打开 `etc/plugins/emqx_auth_redis.conf`，配置以下信息：

```bash
## 认证时执行的 Redis 命令
auth.redis.auth_cmd = HMGET mqtt_user:%u password

## Password hash
auth.redis.password_hash = plain
```

配置完毕后执行  ``emqx_ctl plugins load emqx_auth_redis`` 并重启 emqx 服务。在客户端使用 ``mosquitto_sub`` 命令来连接。

```shell
## 使用错误的用户名和密码
# mosquitto_sub -h 10.211.55.10 -u userid_001 -P password -t /devices/001/temp
Connection Refused: bad user name or password.

## 使用正确的用户名和密码，加入 -d 参数，打印交互的 MQTT 报文
#  mosquitto_sub -h 10.211.55.10 -u userid_001 -P public -t /devices/001/temp -d
Client mosqsub/18771-master sending CONNECT
Client mosqsub/18771-master received CONNACK
Client mosqsub/18771-master sending SUBSCRIBE (Mid: 1, Topic: /devices/001/temp, QoS: 0)
Client mosqsub/18771-master received SUBACK
Subscribed (mid: 1): 0
```

#### 密码加密、加盐

上文描述的是在 Redis 中采用明文的方式保存密码，EMQ X 还支持用加密算法对密码进行加密和加盐处理。

- 修改配置文件：打开配置文件 ``emqx_auth_redis.conf`` ，
  - 更改配置 ``auth.redis.password_hash = salt,sha256`` ，采用 sha256 加密算法，加入的 salt 在密码之前；如果该配置是 ``sha256,salt`` 则表示加入的 salt 在密码之后；**注意：salt 只是一个标识符，不代表使用该字符进行加盐处理**
  - 更改读取命令 ``auth.redis.auth_cmd`` ，需要取出 salt；
  - 更改完成后重启 EMQ X 服务。

```bash
## 更改认证时执行的 Redis 命令，取出 salt
auth.redis.auth_cmd = HMGET mqtt_user:%u password salt

## sha256 with salt prefix
auth.redis.password_hash = salt,sha256
```

- 在 Redis 中存入数据，根据上一步的配置，假设该客户端设置的 salt 为 ``mysalt``，那么加盐后的密码原文为 ``mysaltpublic`` ，读者可以通过[在线的 sha256工具](https://hash.online-convert.com/sha256-generator)将密码转换为密文，并存入 Redis。

```java
sha256("mysaltpublic") -> 129735f3af16d9a3a6784752d034542642ec96728b6f1dd47ec2b6fe46137130
```

打开 Redis 命令行工具。

```bash
## 先删除之前保存的认证数据
127.0.0.1:6379> del mqtt_user:userid_001
(integer) 1
## 保存认证数据
127.0.0.1:6379> HMSET mqtt_user:userid_001 password "129735f3af16d9a3a6784752d034542642ec96728b6f1dd47ec2b6fe46137130" is_superuser false salt "mysalt"
OK
## 取出相关的密码和盐
127.0.0.1:6379> HMGET mqtt_user:userid_001 password salt
1) "129735f3af16d9a3a6784752d034542642ec96728b6f1dd47ec2b6fe46137130"
2) "mysalt"
```

- 在客户端使用 ``mosquitto_sub`` 命令来连接。

```shell
# mosquitto_sub -h 10.211.55.10 -u userid_001 -P public -t /devices/001/temp -d
Client mosqsub/9936-master sending CONNECT
Client mosqsub/9936-master received CONNACK
Client mosqsub/9936-master sending SUBSCRIBE (Mid: 1, Topic: /devices/001/temp, QoS: 0)
Client mosqsub/9936-master received SUBACK
Subscribed (mid: 1): 0
```



## MongoDB 认证

### Auth 配置

客户端上线后，MongoDB 认证插件连接至 MongoDB ，通过查询和比对 MongoDB 中预先存储的认证信息来判断该客户端是否有权限连接该服务器。

#### MongoDB 安装

读者请按照 [MongoDB 安装文档](https://docs.mongodb.com/manual/administration/install-community/)安装好数据库，然后使用客户端 ``mongo`` 连接到数据库。

```bash
# mongo
MongoDB shell version v4.0.4
connecting to: mongodb://127.0.0.1:27017
Implicit session: session { "id" : UUID("373cf3b1-d72d-4292-95cc-a76cfd607fa7") }
MongoDB server version: 4.0.4
Welcome to the MongoDB shell.
......
```

#### 准备数据

emqx_auth_mongo 插件根据配置的存储客户端信息的集合（collection）、password 字段名（password_field）、过滤查询的 selector 进行认证操作：

MongoDB mqtt 数据库中有如下信息：

```bash
## 插入数据
> use mqtt
switched to db mqtt 
> db.mqtt_user.insert({ username: 'userid_001', password: 'public', is_superuser: false })
WriteResult({ "nInserted" : 1 })

## 查看数据
> db.mqtt_user.find({})
{ "_id" : ObjectId("5be795f7744a3bac99a6fd02"), "username" : "userid_001", "password" : "public", "is_superuser" : false }
```

#### 修改配置文件

打开 `etc/plugins/emqx_auth_mongo.conf`，配置以下信息：

```bash
## Mongo 认证数据库名称
auth.mongo.database = mqtt

## 认证信息所在集合
auth.mongo.auth_query.collection = mqtt_user

## 密码字段
auth.mongo.auth_query.password_field = password

## 使用明文密码存储
auth.mongo.auth_query.password_hash = plain

## 查询指令
auth.mongo.auth_query.selector = username=%u
```


配置完毕后执行  ``emqx_ctl plugins load emqx_auth_mongo`` 并重启 emqx 服务。`username` 为 `userid_001` 的客户端连接时，EMQ X 将执行下列查询：

```bash
> db.mqtt_user.findOne({ username: 'userid_001' })
{
	"_id" : ObjectId("5be795f7744a3bac99a6fd02"),
	"username" : "userid_001",
	"password" : "public",
	"is_superuser" : false
}
```

当查询结果中的 `password`（password_field 字段）与当前客户端 `password` 相等时，认证成功。在客户端使用 ``mosquitto_sub`` 命令来连接。

```shell
## 使用错误的用户名和密码
# mosquitto_sub -h 10.211.55.10 -u userid_001 -P password -t /devices/001/temp
Connection Refused: bad user name or password.

## 使用正确的用户名和密码，加入 -d 参数，打印交互的 MQTT 报文
#  mosquitto_sub -h 10.211.55.10 -u userid_001 -P public -t /devices/001/temp -d
Client mosqsub/18771-master sending CONNECT
Client mosqsub/18771-master received CONNACK
Client mosqsub/18771-master sending SUBSCRIBE (Mid: 1, Topic: /devices/001/temp, QoS: 0)
Client mosqsub/18771-master received SUBACK
Subscribed (mid: 1): 0
```

#### 密码加密、加盐

上文描述的是在 MongoDB 中采用明文的方式保存密码，EMQ X 还支持用加密算法对密码进行加密和加盐处理。

- 修改配置文件：打开配置文件 ``emqx_auth_mongo.conf`` ，
  - 更改配置 ``auth.mongo.password_hash = salt,sha256`` ，采用 sha256 加密算法，加入的 salt 在密码之前；如果该配置是 ``sha256,salt`` 则表示加入的 salt 在密码之后；**注意：salt 只是一个标识符，不代表使用该字符进行加盐处理**
  - 更改完成后重启 EMQ X 服务。

```bash

auth.mongo.auth_query.password_field = password,salt

## sha512 with salt prefix
auth.mongo.password_hash = sha256,salt
```

- 在 MongoDB 中存入数据，根据上一步的配置，假设该客户端设置的 salt 为 ``mysalt``，那么加盐后的密码原文为 ``mysaltpublic`` ，读者可以通过[在线的 sha512工具](https://www.liavaag.org/English/SHA-Generator/)将密码转换为密文，并存入 MongoDB。

```java
sha512("mysaltpublic") -> c3acb78da1592319f47d15c5230071f22a9d3b23671a29c8f7b4ab92d66f39aa
```

打开 mongo 命令行工具。

```bash
## 先删除之前保存的认证数据
> db.mqtt_user.deleteOne({ username: 'userid_001'})
{ "acknowledged" : true, "deletedCount" : 1 }

## 保存认证数据
> db.mqtt_user.insert({ username: 'userid_001', password: 'c3acb78da1592319f47d15c5230071f22a9d3b23671a29c8f7b4ab92d66f39aa', is_superuser: false, salt: 'mysalt' })
WriteResult({ "nInserted" : 1 })

## 取出相关的密码和盐
> db.mqtt_user.findOne({ username: 'userid_001' })
{
	"_id" : ObjectId("5be7aad8744a3bac99a6fd0c"),
	"username" : "userid_001",
	"password" : "c3acb78da1592319f47d15c5230071f22a9d3b23671a29c8f7b4ab92d66f39aa",
	"is_superuser" : false,
	"salt" : "mysalt"
}
```

- 在客户端使用 ``mosquitto_sub`` 命令来连接。

```shell
# mosquitto_sub -h 10.211.55.10 -u userid_001 -P public -t /devices/001/temp -d
Client mosqsub/9936-master sending CONNECT
Client mosqsub/9936-master received CONNACK
Client mosqsub/9936-master sending SUBSCRIBE (Mid: 1, Topic: /devices/001/temp, QoS: 0)
Client mosqsub/9936-master received SUBACK
Subscribed (mid: 1): 0
```

