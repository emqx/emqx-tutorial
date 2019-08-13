# 首次安装 EMQ X
在安装 EMQ X 前，请确认安装的 [前置条件](./precondition.md) 都已经满足。

## 版本选择
EMQ X 支持多种操作系统，请选择合适您的版本[下载](./choose-download.md)。

## 在 Linux 下安装
对于 Linux 发布，EMQ X 提供两种方式的安装。一是基于各 linux 发布的安装包。用安装包安装 EMQ X 以后，可以方便的使用系统管理工具来启停 EMQ X 服务。二是使用 zip 压缩打包的通用包。安装 zip 包只需解压 zip 文件即可。使用 zip 包可以实现在同一个系统下安装多套 EMQ X。在开发 / 实验室环境下使用 zip 包安装 EMQ X 非常实用。

### CentOS/RHEL
目前 EMQ X 支持 CentOS/RHEL 6 和 7，在这两个版本上的安装过程一致。以下安装过程以 CentOS 7 为例。

#### 使用 zip 包安装
解压 zip 文件
```bash
unzip emqx-centos7-v3.0.zip
```

启动以控制台调试模式 emqx，检查 EMQ X 是否可以正常启动：
```bash
cd emqx && ./bin/emqx console
```
如果安装成功，可以在控制台看到以下输出：
```bash
starting emqx on node 'emqx@127.0.0.1'
emqx ctl is starting...[ok]
emqx hook is starting...[ok]
emqx router is starting...[ok]
emqx pubsub is starting...[ok]
emqx stats is starting...[ok]
emqx metrics is starting...[ok]
emqx pooler is starting...[ok]
emqx trace is starting...[ok]
emqx client manager is starting...[ok]
emqx session manager is starting...[ok]
emqx session supervisor is starting...[ok]
emqx wsclient supervisor is starting...[ok]
emqx broker is starting...[ok]
emqx alarm is starting...[ok]
emqx mod supervisor is starting...[ok]
emqx bridge supervisor is starting...[ok]
emqx access control is starting...[ok]
emqx system monitor is starting...[ok]
dashboard:http listen on 0.0.0.0:18083 with 2 acceptors.
mqtt:tcp listen on 0.0.0.0:1883 with 8 acceptors.
mqtt:ssl listen on 0.0.0.0:8883 with 4 acceptors.
mqtt:ws listen on 0.0.0.0:8083 with 4 acceptors.
Erlang MQTT Broker 3.0 is running now
```

CTRL+C 关闭控制台。守护进程模式启动:
```bash
./bin/emqx start
```
#### 使用 rpm 包安装
在 CentOS 下使用 rpm 工具安装 EMQ X：
```bash
rpm -ivh emqx-centos7-v3.0-beta.4.rpm
```
在安装完成之后，EMQ X 的配置文件、日志文件和数据文件分别在以下目录：
系统配置文件：/etc/emqx/emqx.conf
插件配置文件： /etc/emqx/plugins/\*.conf
日志文件： /var/log/emqx
数据文件： /var/lib/emqx/

在命令行启停 EMQ X：
```bash
systemctl start|stop|restart emqx.service
```

### Ubuntu
目前 EMQ X 支持 Ubuntu 12.04、14.04、16.04 和 18.04，在这些版本上的安装过程一致。以下安装过程以 Ubuntu 18.04 为例。
#### 使用 zip 包安装
解压 zip 文件
```bash
unzip emqx-ubuntu18.04-v3.0.zip
```

启动以控制台调试模式 emqx，检查 EMQ X 是否可以正常启动：
```bash
cd emqx && ./bin/emqx console
```
如果安装成功，可以在控制台看到以下输出：
```bash
starting emqx on node 'emqx@127.0.0.1'
emqx ctl is starting...[ok]
emqx hook is starting...[ok]
emqx router is starting...[ok]
emqx pubsub is starting...[ok]
emqx stats is starting...[ok]
emqx metrics is starting...[ok]
emqx pooler is starting...[ok]
emqx trace is starting...[ok]
emqx client manager is starting...[ok]
emqx session manager is starting...[ok]
emqx session supervisor is starting...[ok]
emqx wsclient supervisor is starting...[ok]
emqx broker is starting...[ok]
emqx alarm is starting...[ok]
emqx mod supervisor is starting...[ok]
emqx bridge supervisor is starting...[ok]
emqx access control is starting...[ok]
emqx system monitor is starting...[ok]
dashboard:http listen on 0.0.0.0:18083 with 2 acceptors.
mqtt:tcp listen on 0.0.0.0:1883 with 8 acceptors.
mqtt:ssl listen on 0.0.0.0:8883 with 4 acceptors.
mqtt:ws listen on 0.0.0.0:8083 with 4 acceptors.
Erlang MQTT Broker 3.0 is running now
```

CTRL+C 关闭控制台。守护进程模式启动:
```bash
./bin/emqx start
```
#### 使用 deb 包安装

```bash
sudo dpkg -i emqx-ubuntu18.04-v3.0_amd64.deb
```

在安装完成之后，EMQ X 的配置文件、日志文件和数据文件分别在以下目录：
系统配置文件：/etc/emqx/emqx.conf
插件配置文件： /etc/emqx/plugins/\*.conf
日志文件： /var/log/emqx
数据文件： /var/lib/emqx/

在命令行启停 EMQ X：
```bash
service emqx start|stop|restart
```
### Debian
目前 EMQ X 支持 Debian 7、8 和 9，在这些版本上的安装过程一致。以下安装过程以 Debian 9 为例。
#### 使用 zip 包安装

解压 zip 文件
```bash
unzip emqx-debian9-v3.0.zip
```

启动以控制台调试模式 emqx，检查 EMQ X 是否可以正常启动：
```bash
cd emqx && ./bin/emqx console
```
如果安装成功，可以在控制台看到以下输出：
```bash
starting emqx on node 'emqx@127.0.0.1'
emqx ctl is starting...[ok]
emqx hook is starting...[ok]
emqx router is starting...[ok]
emqx pubsub is starting...[ok]
emqx stats is starting...[ok]
emqx metrics is starting...[ok]
emqx pooler is starting...[ok]
emqx trace is starting...[ok]
emqx client manager is starting...[ok]
emqx session manager is starting...[ok]
emqx session supervisor is starting...[ok]
emqx wsclient supervisor is starting...[ok]
emqx broker is starting...[ok]
emqx alarm is starting...[ok]
emqx mod supervisor is starting...[ok]
emqx bridge supervisor is starting...[ok]
emqx access control is starting...[ok]
emqx system monitor is starting...[ok]
dashboard:http listen on 0.0.0.0:18083 with 2 acceptors.
mqtt:tcp listen on 0.0.0.0:1883 with 8 acceptors.
mqtt:ssl listen on 0.0.0.0:8883 with 4 acceptors.
mqtt:ws listen on 0.0.0.0:8083 with 4 acceptors.
Erlang MQTT Broker 3.0 is running now
```

CTRL+C 关闭控制台。守护进程模式启动:
```bash
./bin/emqx start
```
#### 使用 deb 包安装
```bash
sudo dpkg -i emqx-debian9-v3.0_amd64.deb
```

在安装完成之后，EMQ X 的配置文件、日志文件和数据文件分别在以下目录：
系统配置文件：/etc/emqx/emqx.conf
插件配置文件： /etc/emqx/plugins/\*.conf
日志文件： /var/log/emqx
数据文件： /var/lib/emqx/

在命令行启停 EMQ X：
```bash
service emqx start|stop|restart
```
## 在 MacOS 下安装
目前 EMQ X 在 MacOS 下提供 zip 包安装：
解压 zip 文件
```bash
unzip emqx-macos-v3.0.zip
```

启动以控制台调试模式 emqx，检查 EMQ X 是否可以正常启动：
```bash
cd emqx && ./bin/emqx console
```
如果安装成功，可以在控制台看到以下输出：
```bash
starting emqx on node 'emqx@127.0.0.1'
emqx ctl is starting...[ok]
emqx hook is starting...[ok]
emqx router is starting...[ok]
emqx pubsub is starting...[ok]
emqx stats is starting...[ok]
emqx metrics is starting...[ok]
emqx pooler is starting...[ok]
emqx trace is starting...[ok]
emqx client manager is starting...[ok]
emqx session manager is starting...[ok]
emqx session supervisor is starting...[ok]
emqx wsclient supervisor is starting...[ok]
emqx broker is starting...[ok]
emqx alarm is starting...[ok]
emqx mod supervisor is starting...[ok]
emqx bridge supervisor is starting...[ok]
emqx access control is starting...[ok]
emqx system monitor is starting...[ok]
dashboard:http listen on 0.0.0.0:18083 with 2 acceptors.
mqtt:tcp listen on 0.0.0.0:1883 with 8 acceptors.
mqtt:ssl listen on 0.0.0.0:8883 with 4 acceptors.
mqtt:ws listen on 0.0.0.0:8083 with 4 acceptors.
Erlang MQTT Broker 3.0 is running now
```

CTRL+C 关闭控制台。守护进程模式启动:
```bash
./bin/emqx start
```
## 在 Microsoft Windows 下安装
目前 EMQ X 在 Windows 下提供 zip 包安装。程序包下载解压后，打开 Windows 命令行窗口，cd 到程序目录。

控制台模式启动:
```bash
bin\emqx console
```
## 在 Docker 中安装
解压 emqx docker 镜像包：
```bash
unzip emqx-docker-v3.0.zip
```

加载镜像：
```bash
docker load < emqx-docker-v3.0
```
启动容器：
```bash
docker run -tid --name emq30 -p 1883:1883 -p 8083:8083 -p 8883:8883 -p 8084:8084 -p 18083:18083 emqx-docker-v3.0
```
停止容器：
```bash
docker stop emq30
```
开启容器：
```bash
docker start emq30
```
进入 Docker 控制台：
```bash
docker exec -it emq30 /bin/sh
```

## 使用源代码安装
EMQ X 消息服务器基于 Erlang/OTP 平台开发，项目托管的 GitHub 管理维护，源码编译依赖 Erlang 环境和 git 客户端。

本文以下说明适合 Linux 环境。

* 注意：*  
*EMQ X 3.0 依赖 Erlang R21 + 版本 *  
* 如何安装 Erlang 请参考[Erlang 官方网站](http://www.erlang.org/)*  
* 如何安装和使用 git 客户端请参考[git-scm](http://www.git-scm.com/)*

在准备好编译环境之后，clone 代码边并使编译：
```bash
git clone -b win30 https://github.com/emqx/emqx-rel.git

cd emqx-relx && make

cd _rel/emqx && ./bin/emqx console
```

在编译成功后，程序包发布目录：
```bash
_rel/emqx
```

从控制台启动程序：
```bash
cd _rel/emqx && ./bin/emqx console
```
