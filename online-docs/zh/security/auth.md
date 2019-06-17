# 认证（认证鉴权）

认证（认证鉴权）指的是当一个客户端连接到 MQTT 服务器的时候，通过服务器端的配置来控制客户端连接服务器的权限。EMQ X 的认证支持包括多个层面，分别有 MQTT 传输层，应用层和 EMQ X 本身以插件的方式来支持各种增强的认证方式。

- 在传输层上，TLS 可以保证使用客户端证书的客户端到服务器的身份验证，并确保服务器向客户端验证服务器证书
- 在应用层上，MQTT 协议本身在 CONNECT 报文中指定用户名和密码。客户端可以在连接到 MQTT 服务器时发送用户名和密码进行认证，有效阻止非法客户端的连接
- EMQ X 层面上，以插件形式支持配置文件、HTTP API、JWT、LDAP 及各类数据库如 MongoDB、MySQL、PostgreSQL、Redis 等多种认证

## 认证与认证链

EMQ X 默认开启匿名认证，即允许任意客户端登录，具体配置在 `etc/emqx.conf` 中：

```bash
## Allow Anonymous authentication
mqtt.allow_anonymous = true
```

EMQ X 认证相关插件名称以 `emqx_auth` 开头。当启用认证插件之前，请在配置文件 `etc/emqx.conf` 中把允许匿名认证的方式给去掉:``mqtt.allow_anonymous = false``。当共同启用多个认证插件时，EMQ X 将按照插件开启先后顺序进行链式认证，一旦认证成功就终止认证链并允许客户端接入，最后一个认证源仍未通过时将终止客户端连接，认证链的认证过程示意图如下所示。

![auth chain](../assets/auth_chain.png)


## 用户名密码认证

> 注意: 该部分教程分为旧版与新版，EMQ X v3.0.1 之后为新版，采用安全性更高的认证配置方式。


### 旧版配置方式

> 适用于 EMQ X v3.0.1 之前版本。

用户名认证使用配置文件存储用户名与密码，通过 username 与 password 进行连接认证。

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

然后重启 ``emqx`` 服务。如果配置成功正确，使用正确的用户名和密码可以连接成功，而指定的错误的用户名和密码，通过 mosquitto 提供的命令行会报以下的错误。读者在修改了配置文件后，**需要重新启动 ``emqx`` 服务才可以生效**。

```bash
# mosquitto_sub -h $your_host -u username -P passwd1 -t /devices/001/temp
Connection Refused: bad user name or password.
```

在错误日志文件 ``/var/log/emqx/error.log`` 中会有类似于以下的错误信息。

```
 [error] <0.1981.0>@emqx_protocol:process:241 Client(mosqsub/10166-master@10.211.55.6:40177): Username 'username' login failed for "No auth module to check!"
```


### 新版配置方式

> 适用于 EMQ X v3.0.1 及以后版本，以下所有配置均在集群内同步。

用户名认证通过 REST API 设置 username 与 password 进行连接认证。

打开并配置 `etc/plugins/emqx_auth_username.conf` 文件，配置 password 加密方式：

```
## Password hash.
##
## Value: plain | md5 | sha | sha256

## 配置密码加密方式，默认是 SHA256
auth.user.password_hash = sha256
```


在 EMQ X Dashboard 或控制台启用插件：

```./bin/emqx_ctl plugins load emqx_auth_username```



通过命令行或 [REST API](https://developer.emqx.io/docs/broker/v3/cn/rest.html) 设置 username 及 password 相关接口与认证 详见 [管理监控 API](https://developer.emqx.io/docs/broker/v3/cn/rest.html)，此处不再赘述。


#### 添加用户名

API 定义：

```
# Request
POST api/v3/auth_username
{
    "username": "emqx_u",
    "password": "emqx_p"
}

# Response
{
    "code": 0
}
```

cURL 请求如下：

使用 POST 请求添加 username 为 `emqx_u` password 为 `emqx_p` 的认证信息，返回信息中 `code = 0` 即为成功

```
curl -X POST \
  http://127.0.0.1:8080/api/v3/auth_username \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 5337f088-6afe-4a0a-8ce2-aecd1c02ca11' \
  -H 'cache-control: no-cache' \
  -d '{
    "username": "emqx_u",
    "password": "emqx_p"
}'
```

添加成功并关闭匿名认证后，使用 username 为 `emqx_u`，password 为 `emqx_p` 且 client_id 任意方能成功连接至 EMQ X。


#### 查看已经添加的用户名

API 定义：

```
# Request
GET api/v3/auth_username

# Response
{
    "code": 0,
    "data": ["emqx_u"]
}
```

cURL 请求如下：

```
curl -X GET \
  http://127.0.0.1:8080/api/v3/auth_username \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 52e19a03-052c-4109-8586-6106e9703001' \
  -H 'cache-control: no-cache'
```

#### 更改指定用户名的密码

指定用户名，传递新密码进行更改，再次连接时需要使用新密码进行连接：

API 定义：

```
# Request
PUT api/v3/auth_username/$NAME
{
    "password": "emqx_new_p"
}

# Response
{
    "code": 0
}
```

cURL 请求如下：

```
curl -X PUT \
  http://127.0.0.1:8080/api/v3/auth_username/emqx_u \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 57119369-6459-44dc-8b56-5f618e409438' \
  -H 'cache-control: no-cache' \
  -d '{
    "password": "emqx_new_p"
}'
```


#### 查看指定用户名信息

指定用户名，查看相关用户名、密码信息，注意此处返回的密码是使用配置文件指定方式加密后的密码：

API 定义：

```
# Request
GET api/v3/auth_username/$NAME

# Response
{
    "code": 0,
    "data": {
        "username": "emqx_u",
        "password": "091dc8753347e7dc5d348508fe6323735eecdb84fa800548870158117af8a0c0"
    }
}
```

cURL 请求如下：

```
curl -X GET \
  http://127.0.0.1:8080/api/v3/auth_username/emqx_u \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 13cde276-f959-40ef-97a4-a158b356fc50' \
  -H 'cache-control: no-cache'
```


#### 删除用户名信息

删除指定用户名，删除后无法通过该用户名连接：

API 定义：

```
# Request
DELETE api/v3/auth_username/$NAME

# Response
{
    "code": 0
}
```

cURL 请求如下：

```
curl -X DELETE \
  http://127.0.0.1:8080/api/v3/auth_username/emqx_u \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 23a3da25-4b22-48cb-bd8b-2ec6b88192af' \
  -H 'cache-control: no-cache'
```



## ClientID 认证

> 注意: 该部分教程分为旧版与新版，EMQ X v3.0.1 之后为新版，采用安全性更高的认证配置方式。


### 旧版配置方式

> 适用于 EMQ X v3.0.1 之前版本。


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









### 新版配置方式

> 适用于 EMQ X v3.0.1 及以后版本，以下所有配置均在集群内同步。

ClientID 认证通过 REST API 设置 client_id 与 password 进行连接认证。

打开并配置 `etc/plugins/emqx_auth_clientid.conf` 文件，配置 password 加密方式：

```
## Password hash.
##
## Value: plain | md5 | sha | sha256

## 配置密码加密方式，默认是 SHA256
auth.client.password_hash = sha256
```


在 EMQ X Dashboard 或控制台启用插件：

```./bin/emqx_ctl plugins load emqx_auth_clientid```



通过命令行或 [REST API](https://developer.emqx.io/docs/broker/v3/cn/rest.html) 设置 username 及 password 相关接口与认证 详见 [管理监控 API](https://developer.emqx.io/docs/broker/v3/cn/rest.html)，此处不再赘述。


#### 添加 ClientID

API 定义：

```
# Request
POST api/v3/auth_clientid
{
    "clientid": "emqx_c",
    "password": "emqx_p"
}

# Response
{
    "code": 0
}
```

cURL 请求如下：

使用 POST 请求添加 clientid 为 `emqx_c` password 为 `emqx_p` 的认证信息，返回信息中 `code = 0` 即为成功

```
curl -X POST \
  http://127.0.0.1:8080/api/v3/auth_clientid \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 5337f088-6afe-4a0a-8ce2-aecd1c02ca11' \
  -H 'cache-control: no-cache' \
  -d '{
    "clientid": "emqx_c",
    "password": "emqx_p"
}'
```

添加成功并关闭匿名认证后，使用 client id 为 `emqx_c`，password 为 `emqx_p` 且 username 任意方能成功连接至 EMQ X。


#### 查看已经添加的 ClientID

API 定义：

```
# Request
GET api/v3/auth_clientid

# Response
{
    "code": 0,
    "data": ["emqx_c"]
}
```

cURL 请求如下：

```
curl -X GET \
  http://127.0.0.1:8080/api/v3/auth_clientid \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 52e19a03-052c-4109-8586-6106e9703001' \
  -H 'cache-control: no-cache'
```

#### 更改指定 ClientID 的密码

指定 client_id，传递新密码进行更改，再次连接时需要使用新密码进行连接：

API 定义：

```
# Request
PUT api/v3/auth_clientid/$NAME
{
    "password": "emqx_new_p"
}

# Response
{
    "code": 0
}
```

cURL 请求如下：

```
curl -X PUT \
  http://127.0.0.1:8080/api/v3/auth_clientid/emqx_c \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 57119369-6459-44dc-8b56-5f618e409438' \
  -H 'cache-control: no-cache' \
  -d '{
    "password": "emqx_new_p"
}'
```


#### 查看指定 ClientID 信息

指定 client_id，查看相关 client_id、密码信息，注意此处返回的密码是使用配置文件指定方式加密后的密码：

API 定义：

```
# Request
GET api/v3/auth_clientid/$NAME

# Response
{
    "code": 0,
    "data": {
        "username": "emqx_c",
        "password": "091dc8753347e7dc5d348508fe6323735eecdb84fa800548870158117af8a0c0"
    }
}
```

cURL 请求如下：

```
curl -X GET \
  http://127.0.0.1:8080/api/v3/auth_clientid/emqx_c \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 13cde276-f959-40ef-97a4-a158b356fc50' \
  -H 'cache-control: no-cache'
```


#### 删除 ClientID 信息

删除指定 client_id，删除后无法通过该 client_id 连接：

API 定义：

```
# Request
DELETE api/v3/auth_clientid/$NAME

# Response
{
    "code": 0
}
```

cURL 请求如下：

```
curl -X DELETE \
  http://127.0.0.1:8080/api/v3/auth_clientid/emqx_c \
  -H 'Authorization: Basic dGVzdDpNamczT1RBMU5URXpOakF4TVRnd01EZ3lOamN6TlRrek9UQXpNamM1TmpNMk5ESQ==' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 23a3da25-4b22-48cb-bd8b-2ec6b88192af' \
  -H 'cache-control: no-cache'
```





## HTTP 认证

HTTP 认证调用自定义的 HTTP API 实现认证鉴权。


### 实现原理

EMQ X 在设备连接事件中使用当前客户端相关信息作为参数，向用户自定义的认证服务发起请求查询权限，通过返回的 HTTP **响应状态码** (HTTP Response Code) 来处理认证请求。

 - 认证成功，API 返回 200 状态码

 - 认证失败，API 返回 4xx 状态码


### 使用方式

打开 `etc/plugins/emqx_auth_http.conf` 文件，配置相关规则：

```bash
## 配置一个认证请求 URL，地址的路径部分“/auth/AuthServlet”，用户可以自己随便定义
auth.http.auth_req = http://$SERVER:$port/auth/AuthServlet

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

TODO 

## LDAP 认证

TODO


## MySQL/PostgreSQL 认证

emqx_auth_mysql / emqx_auth_pgsql 分别为基于 MySQL、PostgreSQL 数据库的认证 / 访问控制插件。EMQ X 将根据插件配置，使用当前客户端信息生成预定 SQL 语句，查询数据库进行认证操作。

### Auth 配置

MySQL 的安装过程请读者参考网上相关文章，此处不再赘述。

#### 创建数据库

读者可以使用任何自己喜欢的 mysql 客户端，创建好相应的数据库。这里用的是 MySQL 自带的命令行客户端，打开 MySQL 的控制台，如下所示，创建一个名为 ``emqx`` 的认证数据库，并切换到  ``emqx``  数据库。

```sql
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

```sql
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

