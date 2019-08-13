# 配置 EMQ X 插件

EMQ X 中基础协议层之外的功能大多通过插件实现，如连接认证（auth）、发布订阅 ACL、数据持久化(backend)、数据桥接（bridge）及其他协议接入、Broker 功能等。



## 插件配置文件

EMQ X 插件开发规范中，每个插件需对应一个同名且以 `.conf` 后缀结尾的配置文件。打开主配置文件 `etc/emqx.conf` 进行插件配置文件所在目录与启动列表配置：

```bash
## 配置文件所在目录
plugins.etc_dir = etc/plugins/

## 暂存已启动的插件名称
plugins.loaded_file = data/loaded_plugins
```



通过管理控制台或管理命令加载成功后的插件名将均会被写入 `data/loaded_plugins` 文件中，每个插件一行并以 `.` 结尾，EMQ X 下次启动时将读取列表并自动启动相关插件，该文件亦可作为自启动列表配置：

```
emqx_management.
emqx_recon.
emqx_retainer.
emqx_dashboard.
emqx_delayed_publish.
```



## 应用插件配置

默认插件配置文件在 `etc/plugins/` 目录中，EMQ X 3.0 之前版本 Broker 插件配置文件修改后需要重启 Broker 才能应用新配置，企业版 3.0，开源版 3.0.1 及以后版本中更改插件配置文件后重新启动相关插件即可。

