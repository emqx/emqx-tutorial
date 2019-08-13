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




## MySQL/PostgreSQL authentication

emqx_auth_mysql / emqx_auth_pgsql provide authentication based on MySQL and PostgreSQL database. EMQ X will be generated SQLs with client information according to the plugin configuration, then running against database to authenticate. 

### Auth configuration

Please refer to related doc in Internet for the installation of MySQL, and its skip in this tutorial.

#### Create database

Reader can use any preferred MySQL client, and create the database. This tutorial uses the client shipped with MySQL.  Open MySQL client console, create a database named  ``emqx`` , and switch to  ``emqx`` . Please refer to below.

```sql
mysql> create database emqx;
Query OK, 1 row affected (0.00 sec)

mysql> use emqx;
Database changed
```

#### Create tables

The suggested table structure is listed as in below, 

- username is the user name when client connect to server
- password_hash is the encrypted password after using salt
- salt is salt string
- is_superuser determines the user is super user or not, which is used to control ACL, by default it's value is 0; If the value is set to 1, then it's super user, ACL checking will be skip.  For more detailed information ,please refer to [ACL - Access Control List](acl.md).

Note: Your table could be different from in below, you can configure SQLs of  ``authquery ``  in  ``emqx_auth_mysql.conf ``  to adapt.

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

After creation successfully, take a look at the table structure. 

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

#### Prepare for the authentication data

Compare the value of  `password`  field of query result and passed client password after salt encryption, is the same or not. Below is the authentication procedure, 

-  `password`  field must be existed in query result.
- Each client could be specified a salt, EMQ X will create an encrypted password with client passed parameters and salt value of SQL result.  
- If result is is empty or value is different, then authentication is failed. 

Insert the sample data, password is ``test_password``, and  salt is  ``secret``.  **Notice: In ``auth.mysql.password_hash`` of EMQ X configuration file, salt is ONLY an identification, it does NOT mean use the string 'salt' to encrypt.** For example, 

- If configuration is ``auth.mysql.password_hash = md5,salt`` , then EMQ X uses MD5 to encryt password against ``test_passwordsecret`` - (test_password is the password, and secret is password, which is added after the password)
- If configuration is``auth.mysql.password_hash = salt,md5`` , then EMQ X uses MD5 to encryt password against ``secrettest_password`` - (test_password is the password, and secret is password, which is added before the password).

This tutorial uses the 1st configuration, and insert the generated MD5 password into table  ``mqtt_user``.  User can use the [online MD5 tool](https://www.md5hashgenerator.com/) or programming by yourself to encrypt the password.

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

#### Modify EMQ X configuration file

It's because there is no `password` field in table, the query SQL should use ``AS`` statement to create an alias field name.

```sql
SELECT password_hash AS password, ...
```

Below is the major configuration, please refer to description in configuration file for rests of items.

```bash
## Change it to your MySQL server address & port
auth.mysql.server = $mysql_host:3306

## Change it to emqx database that created in previous step
auth.mysql.database = emqx

auth.mysql.auth_query = SELECT password_hash AS password, salt FROM mqtt_user WHERE username = '%u'

## Encryption algorithm plain | md5 | sha | sha256 | bcrypt
## Salt encryption algorithm
auth.mysql.password_hash = md5,salt

## If not using salt encryption algorithm, then write an algorithm name is enough. 
# auth.mysql.password_hash = md5
```

The  usage of PostgreSQL is similar to MySQL, user can refer to configuration of this chapter, and will not be expanded in this tutorial.

## Redis authentication

### Auth configuration

When a client is online, Redis authentication plugin connect to Redis, then query data that previously saved in Redis & compare the authentication info to determine the authentication of client is successful or not.

#### Redis installation 

User can refer to [Redis instal and verification](../backend/redis.html) of data persistence to finish the Redis installation. 

#### Prepare data

The authentication data should be saved into Redis database before starting. The colon, ``:`` is suggested as separate sign. To avoid duplicated key with other business, a business prefix is recommend for the key. Please refer to below for the key format.

```bash
# Business prefix:username or clientid
prefix:[username|clientid]
```

For example,  `mqtt_user:userid_001` 。

Through the command line tool, ``redis-cli``, provided by Redis, to import the authentication data into Redis Hash data structure. Reader can refer to [hmset](https://redis.io/commands/hmset)  and  [hget](https://redis.io/commands/hget)  to get more detailed information.

```bash
## key is mqtt_user:userid_001; password is public, and is_superuser is false
127.0.0.1:6379[2]> HMSET mqtt_user:userid_001 password "public" is_superuser false
OK

## List all of the keys, displays the key that was just saved
127.0.0.1:6379[2]> keys *
1) "mqtt_user:userid_001"

## Get password field value for client key is mqtt_user:userid_001
127.0.0.1:6379> hget mqtt_user:userid_001 password
"public"

## Get is_superuser field value for client key is mqtt_user:userid_001
127.0.0.1:6379> hget mqtt_user:userid_001 is_superuser
"false"
```

#### Modify configuration file

emqx_auth_redis plugin uses the configurations, and generate corresponding Redis command according to passed client information, then query and compare the result.

Open ``etc/plugins/emqx_auth_redis.conf``, make following changes. 

```bash
## Redis command to be executed for authentication
auth.redis.auth_cmd = HMGET mqtt_user:%u password

## Password hash
auth.redis.password_hash = plain
```

Execute command  ``emqx_ctl plugins load emqx_auth_redis``  after configuration, and restart emqx service. Use  ``mosquitto_sub`` command to test connection.

```shell
## Using wrong username and password.
# mosquitto_sub -h 10.211.55.10 -u userid_001 -P password -t /devices/001/temp
Connection Refused: bad user name or password.

## Using correct username and password. Specify -d parameter, and print debug info.
#  mosquitto_sub -h 10.211.55.10 -u userid_001 -P public -t /devices/001/temp -d
Client mosqsub/18771-master sending CONNECT
Client mosqsub/18771-master received CONNACK
Client mosqsub/18771-master sending SUBSCRIBE (Mid: 1, Topic: /devices/001/temp, QoS: 0)
Client mosqsub/18771-master received SUBACK
Subscribed (mid: 1): 0
```

#### Password encryption and salting

The password is saved with plain approach in previous part, EMQ X also supports to use encryption algorithm to encrypt & salt for passwords. 

- Change configuration file:  open file ``emqx_auth_redis.conf`` ,
  - Change ``auth.redis.password_hash = salt,sha256`` , using sha256 algorithm, the salt is added before the password; If configuration is  ``sha256,salt`` , which means salt is added after the password.  **Notice: salt is ONLY an identification, it does NOT mean use the string 'salt' to encrypt.**
  - Change read command ``auth.redis.auth_cmd`` , salt need to be fetch;
  - Reboot  EMQ X service after modification.

```bash
## Change Redis command for authentication, fetch the salt. 
auth.redis.auth_cmd = HMGET mqtt_user:%u password salt

## sha256 with salt prefix
auth.redis.password_hash = salt,sha256
```

- Store data into Redis. According to previous configuration,  let's say salt of the client is ``mysalt``, then the plain password after add salt is ``mysaltpublic`` , reader can encrypt the password through [online sha256 tool](https://hash.online-convert.com/sha256-generator), then save it into Redis。

```java
sha256("mysaltpublic") -> 129735f3af16d9a3a6784752d034542642ec96728b6f1dd47ec2b6fe46137130
```

Open Redis command line tool.

```bash
## Delete the old data
127.0.0.1:6379> del mqtt_user:userid_001
(integer) 1
## Save new authentication data
127.0.0.1:6379> HMSET mqtt_user:userid_001 password "129735f3af16d9a3a6784752d034542642ec96728b6f1dd47ec2b6fe46137130" is_superuser false salt "mysalt"
OK
## Get related password and salt. 
127.0.0.1:6379> HMGET mqtt_user:userid_001 password salt
1) "129735f3af16d9a3a6784752d034542642ec96728b6f1dd47ec2b6fe46137130"
2) "mysalt"
```

- Use  ``mosquitto_sub``  MQTT client to connect. 

```shell
# mosquitto_sub -h 10.211.55.10 -u userid_001 -P public -t /devices/001/temp -d
Client mosqsub/9936-master sending CONNECT
Client mosqsub/9936-master received CONNACK
Client mosqsub/9936-master sending SUBSCRIBE (Mid: 1, Topic: /devices/001/temp, QoS: 0)
Client mosqsub/9936-master received SUBACK
Subscribed (mid: 1): 0
```



## MongoDB authentication

### Auth configuration

When a client is online, MongoDB authentication plugin connect to MongoDB, then query data that previously saved in MongoDB & compare the authentication info to determine the authentication of client is successful or not.

#### MongoDB installation

Reader can follow [MongoDB installation document](https://docs.mongodb.com/manual/administration/install-community/) to install MongoDB, then use the client tool ``mongo`` to connect to the database.

```bash
# mongo
MongoDB shell version v4.0.4
connecting to: mongodb://127.0.0.1:27017
Implicit session: session { "id" : UUID("373cf3b1-d72d-4292-95cc-a76cfd607fa7") }
MongoDB server version: 4.0.4
Welcome to the MongoDB shell.
......
```

#### Prepare data

emqx_auth_mongo plugin authenticates clients by client information collection, password and selector query.

MongoDB mqtt database stores following data:

```bash
## Insert data
> use mqtt
switched to db mqtt 
> db.mqtt_user.insert({ username: 'userid_001', password: 'public', is_superuser: false })
WriteResult({ "nInserted" : 1 })

## Query data
> db.mqtt_user.find({})
{ "_id" : ObjectId("5be795f7744a3bac99a6fd02"), "username" : "userid_001", "password" : "public", "is_superuser" : false }
```

#### Modify configuration file

Open `etc/plugins/emqx_auth_mongo.conf`, and change below items.

```bash
## Mongo authentication database name
auth.mongo.database = mqtt

## Collection used for authentication
auth.mongo.auth_query.collection = mqtt_user

## Password field
auth.mongo.auth_query.password_field = password

## Use plain approach for password field
auth.mongo.auth_query.password_hash = plain

## Query command
auth.mongo.auth_query.selector = username=%u
```


After configuration, executing command  ``emqx_ctl plugins load emqx_auth_mongo`` to restart emqx service. When a client with username  `userid_001` is connecting to server, EMQ X will execute following query.

```bash
> db.mqtt_user.findOne({ username: 'userid_001' })
{
	"_id" : ObjectId("5be795f7744a3bac99a6fd02"),
	"username" : "userid_001",
	"password" : "public",
	"is_superuser" : false
}
```

If the value of `password` (password_field field) is the same as client specified `password` , then authentication is successful. Client uses ``mosquitto_sub`` to test the connection.

```shell
## Using wrong user name & password.
# mosquitto_sub -h 10.211.55.10 -u userid_001 -P password -t /devices/001/temp
Connection Refused: bad user name or password.

## Use the coreect user name and password, add -d option, print debug info
#  mosquitto_sub -h 10.211.55.10 -u userid_001 -P public -t /devices/001/temp -d
Client mosqsub/18771-master sending CONNECT
Client mosqsub/18771-master received CONNACK
Client mosqsub/18771-master sending SUBSCRIBE (Mid: 1, Topic: /devices/001/temp, QoS: 0)
Client mosqsub/18771-master received SUBACK
Subscribed (mid: 1): 0
```

#### Password encryption, add salt

In previous parts, we described how to save password with plain in MongoDB. Besides plain approach, EMQ X also support use encryption algorithm to encrypt & salt for passwords.

- Change configuration file: open configuration file ``emqx_auth_mongo.conf`` ,
  - Change item ``auth.mongo.password_hash = salt,sha256`` , using sha256 algorithm, the salt is added ahead of password; If the configuration is  ``sha256,salt`` , which means the salt is added after password. **Notice: salt is ONLY an identification, it does NOT mean use the string 'salt' to encrypt.**
  - Reboot  EMQ X service after modification.

```bash

auth.mongo.auth_query.password_field = password,salt

## sha512 with salt prefix
auth.mongo.password_hash = sha256,salt
```

- Save data into MongoDB, according to configuration of last step, let's say the client uses ``mysalt`` as salt, then the plain password after adding salt is  ``mysaltpublic`` , user can convert password into encrypted password through [online sha512 tools](https://www.liavaag.org/English/SHA-Generator/), then saves in MongoDB.

```java
sha512("mysaltpublic") -> c3acb78da1592319f47d15c5230071f22a9d3b23671a29c8f7b4ab92d66f39aa
```

Open mongo command line.

```bash
## Delete data was saved previously
> db.mqtt_user.deleteOne({ username: 'userid_001'})
{ "acknowledged" : true, "deletedCount" : 1 }

## Save authentication data
> db.mqtt_user.insert({ username: 'userid_001', password: 'c3acb78da1592319f47d15c5230071f22a9d3b23671a29c8f7b4ab92d66f39aa', is_superuser: false, salt: 'mysalt' })
WriteResult({ "nInserted" : 1 })

## Fetch related password and salt.
> db.mqtt_user.findOne({ username: 'userid_001' })
{
	"_id" : ObjectId("5be7aad8744a3bac99a6fd0c"),
	"username" : "userid_001",
	"password" : "c3acb78da1592319f47d15c5230071f22a9d3b23671a29c8f7b4ab92d66f39aa",
	"is_superuser" : false,
	"salt" : "mysalt"
}
```

- Use  ``mosquitto_sub`` client to connect the server.

```shell
# mosquitto_sub -h 10.211.55.10 -u userid_001 -P public -t /devices/001/temp -d
Client mosqsub/9936-master sending CONNECT
Client mosqsub/9936-master received CONNACK
Client mosqsub/9936-master sending SUBSCRIBE (Mid: 1, Topic: /devices/001/temp, QoS: 0)
Client mosqsub/9936-master received SUBACK
Subscribed (mid: 1): 0
```

