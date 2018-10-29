# Auto-cluster by DNS

DNS Stands for Domain Name System. A DNS server returns the IP addresses after receiving a domain query, namely A records. DNS system allows multiple A records for one domain name, this makes a one to many mapping. EMQ X can use this one to many mapping to find all nodes that belong to one cluster, thus the nodes can join a cluster automatically.

_EMQ X auto-clustering uses only a small part of DNS service, for more details about DNS please refer to IETF [RFC1034](https://tools.ietf.org/html/rfc1034) and other documents._  


## Setup a DNS System

If EMQ X is deployed on private cloud or internal network, it may be necessary that you deploy your own DNS system. `bind` is commonly used under Linux, we will demonstrate how to use a `bind` server to setup a a record with multiple IP addresses to be used by EMQ X cluster.

Assuming that you have installed `bind` and want setup an 'emqx-cluster.org' zone, where 'cluster.emqx-cluster.org' is the domain name for EMQ X cluster.


### Create 'emqx-cluster.org' Zone  
Add following section to the file '/etc/bind/named.conf.local' to define a new zone for 'emqx-cluster.org':
```
zone "emqx-cluster.org" {
	type master;
	file "/etc/bind/zones/db.emqx-cluster.org";
};
```
Where the "/etc/bind/zones/db.emqx-cluster.org" is the config file for this zone.
### Configure 'emqx-cluster.org' Zone  
Create file '/etc/bind/zones/db.emqx-cluster.org', modify it and add following section in this file:

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
The last two lines above adds two A record for zone 'cluster.emqx-cluster.org'.     
After restarting `bind` service, query the domain 'cluster.emqx-cluster.org' using `dig`, you shall able to see following returns:
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

## Configure EMQ X Nodes

EMQ X gets the DNS server address from the OS, it may be necessary to add the DNS (the address of `bind` server you've setup) to your system configuration.

On each EMQ X node, edit the 'etc/emqx.conf' file and modify the 'cluster' and 'node' sections in it.

### Change the Cluster Auto-discovery to DNS
```
## Cluster discovery
cluster.discovery = dns

## Setup the domain name for cluster
cluster.dns.name = cluster.emqx-cluster.org

## Setup the first part of node name
cluster.dns.app = emqx
```
In an EMQ X cluster, the nodes communicate with each other by the node name (name@host). the `cluster.dns.app` in the `name` part of the node name, and the returned IP addresses from DNS are the `host` part of node name.

### Configure the Node Name
```
node.name = emqx@192.168.1.165
```
The node name is a `name@host` string, an EMQ X node can get the Ip addresses of other nodes bu query the DNS, but not the `name` part. That why we need to predefine a `cluster.dns.app` and all node uses it as the name part of node name.

### Verify the Cluster

Start the EMQ X nodes one by one, and run following command on a node:
```bash
./emqx_ctl cluster status
```
The clustering is success if it returns following:
```bash
Cluster status: [{running_nodes,['emqx@192.168.1.162','emqx@192.168.1.165']}]
```
shutdown one of these two nodes, and querey the status of cluster on the remaining node, you will see:
```bash
Cluster status: [{running_nodes,['emqx@192.168.1.165']},
                 {stopped_nodes,['emqx@192.168.1.162']}]
```
