# Install  EMQ X for the First Time
Before the installation of EMQ X, please make sure that all [preconditions](./precondition.md) are met.

## Choose your EMQ X Release
EMQ X supports multiple operating systems, please choose the [release](./choose-download.md) that fits your environment.。

## Installing EMQ X on Linux
For the Linux distrbutions, there are two ways to install EMQ X. One is to install a distribution specified installation package, by this way, EMQ X is installed as a system service, it is convenient to start/stop the EMQ X service using tools provided by OS; The other is to install it using a zip package. It is eaiser to install, what you need is just unzipping it. It also allows you to install multiple EMQ X instances on a single environment. The zip installation is used in lab environment often.


### CentOS/RHEL
Currently, EMQ X support CentOS/RHEL 6 and 7. The following example is based on CentOS 7.

#### Zip Installation
Unzip the installation file:
```bash
unzip emqx-centos7-v3.0.zip
```

start the EMQ X in console mode and check if it starts as expected:
```bash
cd emqx && ./bin/emqx console
```
If the installation is successful, you will see console output which is samilar to the following:
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

Press 'CTRL+C' to close the console and start EMQ X as daemon:
```bash
./bin/emqx start
```
#### Rpm Installation
Use the rpm tool provided by CenOS to install EMQ X：
```bash
rpm -ivh emqx-centos7-v3.0-beta.4.rpm
```
After the installation, EMQ X's config files, log files and data files are located in the following folders:
EMQ X System configuration: /etc/emqx/emqx.conf
configurations for EMQ X plugins: /etc/emqx/plugins/\*.conf
Log files: /var/log/emqx
Data files: /var/lib/emqx/

Start/stop EMQ X service on CLI:
```bash
systemctl start|stop|restart emqx.service
```

### Ubuntu
Currently, EMQ X support Ubuntu 12.04, 14.04, 16.04, 18.04. The following example is based on Ubuntu 18.04.
#### Zip Installation
Unzip the installation file:
```bash
unzip emqx-ubuntu18.04-v3.0.zip
```

start the EMQ X in console mode and check if it starts as expected:
```bash
cd emqx && ./bin/emqx console
```
If the installation is successful, you will see console output which is samilar to the following:
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

Press 'CTRL+C' to close the console and start EMQ X as daemon:
```bash
./bin/emqx start
```
#### Deb Installation
Use the dpkg tool provided by Ubuntu to install EMQ X：
```bash
sudo dpkg -i emqx-ubuntu18.04-v3.0_amd64.deb
```

After the installation, EMQ X's config files, log files and data files are located in the following folders:
EMQ X System configuration: /etc/emqx/emqx.conf
configurations for EMQ X plugins: /etc/emqx/plugins/\*.conf
Log files: /var/log/emqx
Data files: /var/lib/emqx/

Start/stop EMQ X service on CLI:
```bash
service emqx start|stop|restart
```
### Debian
Currently, EMQ X support Debian 7, 8 and 9. The following example is based on CDebian 9.

#### Zip Installation

Unzip the installation file:
```bash
unzip emqx-debian9-v3.0.zip
```

start the EMQ X in console mode and check if it starts as expected:
```bash
cd emqx && ./bin/emqx console
```
If the installation is successful, you will see console output which is samilar to the following:
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

Press 'CTRL+C' to close the console and start EMQ X as daemon:
```bash
./bin/emqx start
```
#### Deb Installation
```bash
sudo dpkg -i emqx-debian9-v3.0_amd64.deb
```

After the installation, EMQ X's config files, log files and data files are located in the following folders:
EMQ X System configuration: /etc/emqx/emqx.conf
configurations for EMQ X plugins: /etc/emqx/plugins/\*.conf
Log files: /var/log/emqx
Data files: /var/lib/emqx/

Start/stop EMQ X service on CLI:
```bash
service emqx start|stop|restart
```
## Install EMQ X on MacOS
Currently, a zip installation file of EMQ X is available for MacOS.

Unzip the installation file:
```bash
unzip emqx-macos-v3.0.zip
```

start the EMQ X in console mode and check if it starts as expected:
```bash
cd emqx && ./bin/emqx console
```
If the installation is successful, you will see console output which is samilar to the following:
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

Press 'CTRL+C' to close the console and start EMQ X as daemon:
```bash
./bin/emqx start
```
## Install EMQ X on Microsoft Windows
Currently, a zip installation file of EMQ X is available for Microsoft Windows.

After unzip the installation file, please open a command prompt window and switch to the folder that contains the unzipped files.

Start EMQ X in console mode:
```bash
bin\emqx console
```
## Install EMQ X in Docker
Unzip the emqx docker image:
```bash
unzip emqx-docker-v3.0.zip
```

Load Image:
```bash
docker load < emqx-docker-v3.0
```
Run the container:
```bash
docker run -tid --name emq30 -p 1883:1883 -p 8083:8083 -p 8883:8883 -p 8084:8084 -p 18083:18083 emqx-docker-v3.0
```
Stop the container:
```bash
docker stop emq30
```
Start EMQ X container
```bash
docker start emq30
```
Enter the Dockerconsole:
```bash
docker exec -it emq30 /bin/sh
```

## Install EMQ X from the source code
EMQ X broker is developed using Erlang/OTP platform, the project is hosted on github. You will need the Erlang environment and a git client to compile it.

The rest of this section assumes you are on linux OS.

*Please note:*  
*EMQ X 3.0 depends on Erlang R21+*  
*for information about Erlang please refer to[Erlang website](http://www.erlang.org/)*  
*For infomation about git client please refer to [git-scm](http://www.git-scm.com/)*

Clone source and compile it：
```bash
git clone -b win30 https://github.com/emqx/emqx-rel.git

cd emqx-relx && make

cd _rel/emqx && ./bin/emqx console
```

After compiling, the software is published in this folder:
```bash
_rel/emqx
```

Start EMQ X from the console:
```bash
cd _rel/emqx && ./bin/emqx console
```
