# 首次运行EMQ X
在安装以后您可以直接运行EMQ X来获得最初步的经验。除了在控制台，您也可以通过浏览器访问http://127.0.0.1:18083来使用EMQ X的Web管理控制界面。默认的登录名是admin和密码是public。

通过浏览器访问http://127.0.0.1:18083，您将看到一个EMQ X登录界面：
![登录界面](../assets/run-first_1.png)

在输入用户名和密码后，您就可以使用EMQ X Dashboard的各项功能。在首次登入后，您看到的将是EMQ X控制台的信息汇总。这个页面显示了系统信息，节点信息，运行统计和一些统计指标。
![控制台](../assets/run-first_2.png)

您也可以对EMQ X做些简单的配置，让它适配您的运行环境和需求。

## 对EMQ X进行简单的配置

所有对EMQ X的配置都可以通过修改配置文件完成。配置文件的位置：
- etc/emqx.conf : EMQ X服务器的参数设置
- etc/plugins/\*.conf : EMQ X插件配置文件，每个插件都有单独的配置文件。

一些常用功能的配置也在Web Dashboard上进行修改。

### 更改Dashboard界面语言
在Web界面上选择ADMIN -> Settings菜单，您可以改变Dashboard使用的语言，点击Apply后生效。目前EMQ X支持中文和英文。
![修改界面语言](../assets/run-first_3.png)

### 修改Dashboard默认登录名和密码
Dashboard插件以Web界面的方式提供对EMQ X的管理和控制功能，是EMQ X的默认随系统启动的插件之一。在安装以后，您可以通过编辑配置文件的方式来改变Dashboard默认的用户名和密码。
配置文件：
```bash
etc/plugins/emqx_dashboard.conf
```
修改以下两行内容，将等号右侧值改为需要的值：
```
dashboard.default_user.login = admin
dashboard.default_user.password = public
```
或者以Web方式管理Dashboard用户。在ADMIN -> Users 菜单下，您可以修改用户密码和增加/删除用户。admin用户只能修改密码，不能被删除。
![管理用户](../assets/run-first_4.png)
### 配置端口
在安装以后，EMQ X默认会使用以下端口：

- 1883: MQTT协议端口
- 8883: MQTT/SSL 端口
- 8083: MQTT/WebSocket端口
- 8080: HTTP API端口
- 18083: Dashboard管理控制台端口

按照安装环境需要，可以修改以上端口。  

修改协议端口请编辑EMQ X系统配置文件'etc/emqx.conf'，找到以下各行，并按需要修改端口号：
```
listener.tcp.external = 0.0.0.0:1883

listener.ssl.external = 8883

listener.ws.external = 8083
```
修改HTTP API端口请编辑emqx_management插件的配置文件'etc/plugins/emqx_management.conf'，找到下述行，并按需修改端口号：
```
management.listener.http = 8080
```
修改Dashboard管理控制台端口请编辑emqx_dashboard插件的配置文件'etc/plugins/emqx_dashboard.conf',找到下述行，并按需修改端口号：
```
dashboard.listener.http = 18083
```
在Web Dashboard的MANAGEMENT -> Listeners菜单下，可以查看现在正在使用的监听器端口和属性。
![Listeners](../assets/run-first_4.png)

### 启动/停止插件

插件是EMQ X的重要部分，EMQ X的扩展功能基本都是通过插件实现的。包括Dashbard也是插件实现。您可以通过随软件附带的命令行工具`emqx_ctl`来启动和停止各个插件。

启动插件:
```bash
bin/emqx_ctl plugins load plugin_name
```
停止插件：

```bash
bin/emqx_ctl plugins unload plugin_name
```

您也可以在Dashboard的MANAGEMENT -> plugins菜单下启动和停止插件，或对插件进行简单的配置。
![插件](../assets/run-first_6.png)

*EMQ X的Dashboard本身也是一个插件，如果您在Web界面下停止了Dashboard插件，您将无法再使用dashboard，直至您使用命令行工具再次启动Dashboard。*

### 修改Erlang虚拟机启动参数
EMQ X运行在Erlang虚拟机上，在'etc/emqx.conf'中有两个限定了虚拟机允许的最大连接数。在运行EMQ X前可以修改这两个参数以适配连接需求：
- node.process_limit : Erlang 虚拟机允许的最大进程数，EMQ X一个连接会消耗2个Erlang进程;
- node.max_ports : Erlang 虚拟机允许的最大 Port 数量，EMQ X一个连接消耗1个 Port

*在Erlang虚拟机中的Port概念并不是TCP端口，可以近似的理解为文件句柄。*

这连个参数可以设置为：
- node.process_limit： 大于最大允许连接数 * 2  
- node.max_ports： 大于最大允许连接数
