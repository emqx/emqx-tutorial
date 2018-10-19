# 使用 DNS 的自动集群
## DNS 自动集群的原理
DNS 是 Domain Name System 的缩写，即域名解析系统。一台 DNS 服务器在收到域名查询请求后，会返回这个域名对应的IP地址，也就是所谓的 A（Address）记录。DNS 允许一个域名有多项 A 记录，也就是多个IP地址，这样就形成了一个名字对应多个 IP 地址的映射。EMQ X 的DNS自动集群就是利用这样的一对多的映射来找到集群中所有的节点，使各个独立的节点都能加入到集群中。

_DNS 定义的服务内容相当广泛，EMQ X 自动集群仅用到了其中很小的一部分，需要对 DNS 做更深入的了解请参阅 IETF 的 [RFC1034](https://tools.ietf.org/html/rfc1034) 等文档。_

## 配置DNS
在大部分的公有云服务中，都有 DNS 服务，分配域名后，在管理界面把 EMQ X 各个节点的 IP 地址添加到该域名的 A 记录中即可。

如果EMQ X 部署在私有云或者内网中，域名也仅在本地网络有效，那么您可能就需要建立自己的域名服务器。Linux 下常有的开源域名服务器有`bind`，接下来我们以 `bind`为例解释如何为 EMQ X 集群建立域名到 IP 的一对多 A 记录映射。

假设您已经安装了`bind`服务器，希望建立一个'emqx-cluster.org'的域，其中'cluster.emqx-cluster.org'主机名的 A 记录用来做到EMQ X集群节点 IP 地址的映射。

### 建立'emqx-cluster.org'域：  
在'/etc/bind/named.conf.local'文件中加入以下段落：
```
zone "emqx-cluster.org" {
	type master;
	file "/etc/bind/zones/db.emqx-cluster.org";
};
```
其中 "/etc/bind/zones/db.emqx-cluster.org" 为域配置文件。
### 配置'emqx-cluster.org'域：  
生成'/etc/bind/zones/db.emqx-cluster.org'文件，在文件中添加以下内容：

```
$TTL    604800
@	IN	SOA	ns1.emqx-cluster.org. root.emqx-cluster.org. (
		2018042201      ;Serial
    3600    ;Refresh
    1800    ;Retry
    604800  ;Expire
    86400   ;Minimum TTL      

)   
;
	  IN	NS	ns1.emqx-cluster.org.
ns1	IN	A	192.168.1.162
cluster		IN	A	192.168.1.162
cluster		IN	A	192.168.1.165
```
配置中最后两行为 'cluster.emqx-cluster.org' 添加了两条A记录。  
在重启之后，使用`dig`命令查询'cluster.emqx-cluster.org'，应该有以下返回：
```bash
dig cluster.emqx-cluster.org

; <<>> DiG 9.10.3-P4-Ubuntu <<>> cluster.emqx-cluster.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 62356
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;cluster.emqx-cluster.org.	IN	A

;; ANSWER SECTION:
cluster.emqx-cluster.org. 604800 IN	A	192.168.1.165
cluster.emqx-cluster.org. 604800 IN	A	192.168.1.162

;; AUTHORITY SECTION:
emqx-cluster.org.	604800	IN	NS	ns1.emqx-cluster.org.

;; ADDITIONAL SECTION:
ns1.emqx-cluster.org.	604800	IN	A	192.168.1.162

;; Query time: 0 msec
;; SERVER: 192.168.1.162#53(192.168.1.162)
;; WHEN: Fri Oct 19 07:09:37 CEST 2018
;; MSG SIZE  rcvd: 119

```

## 配置EMQ X 节点

EMQ X 通过操作系统获取DNS服务器的地址，您可能会需要在系统配置中添加自建的 DNS 服务器。  
在各个 EMQ X 节点上编辑 'etc/emqx.conf'文件中的cluster段落和node段落。

### 配置 DNS 自动集群
```
## 集群方式
cluster.discovery = dns

## 设置需要查询的域名
cluster.dns.name = cluster.emqx-cluster.org

## 设置EMQ X节点名的第一部分
cluster.dns.app = emqx
```
在EMQ X 集群中，各个节点通过节点名互相访问，节点名的格式是 `name@host`，配置文件中的`cluster.dns.app` 设定的就是节点名中的`name`部分。`host`部分为 DNS 返回的IP地址。

### 配置节点名
```
node.name = emqx@192.168.1.165
```
节点名的格式是 `name@host`。节点可以通过 DNS 返回的 IP 地址知道其他节点的节点名的`host`部分，但是无法获知其`name`部分，所以这里`name`部分必须在集群范围内统一取值为上面的 DNS 集群配置中的 `cluster.dns.app` 值。

### 检验是否集群成功

在配置完成后，依次启动集群的各个节点。然后在任意节点上执行命令查询集群状态：
```bash
./emqx_ctl cluster status
```
看到以下结果则表示集群建立成功：
```bash
Cluster status: [{running_nodes,['emqx@192.168.1.162','emqx@192.168.1.165']}]
```
关闭集群内一个节点，再次查询集群状态，应该能看到以下结果：
```bash
Cluster status: [{running_nodes,['emqx@192.168.1.165']},
                 {stopped_nodes,['emqx@192.168.1.162']}]
```
