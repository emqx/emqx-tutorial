# Configure  EMQ X plugins

Most of the functions outside the basic protocol layer in EMQ X are implemented through plug-ins, such as connection authentication (auth), publish-subscribe ACL, data backend, data bridge and other protocol access, and Broker functionality.



## Plugins configuration file

In the EMQ X plugin development specification, each plugin needs a configuration file with the same name and ending with the `.conf` suffix. Open the main configuration file `etc/emqx.conf` to configure the directory of the plugin configuration file and startup list :

```bash
## configure the directory where the file is located
plugins.etc_dir = etc/plugins/

## Store the name of the plugin that was started
plugins.loaded_file = data/loaded_plugins
```



The  name of the plugin that are successfully loaded through the management console or administrative commands will be written to the `data/loaded_plugins` file. Each plugin will end in a line with '.'. EMQ X will read the list and start  related plugins automatically at the next time it starts.  This file can also be configured as a self-starting list:

```
emqx_management.
emqx_recon.
emqx_retainer.
emqx_dashboard.
emqx_delayed_publish.
```



## Application plugin configuration

The default plugin configuration file is in the `etc/plugins/` directory. In the previous version of EMQ X before 3.0, when the Broker plugin configuration file is modified, the Broker needs to be restarted before the new configuration can be applied. In the version of Enterprise 3.0, open source version 3.0.1 and later version, only the relevant plug-ins need to be restarted after changing the plug-in configuration file.

