# Resource and Action


## Resource

To facilitate the creation and maintenance of rules, EMQ X manages the resources associated with the rules engine actions independently.

The resource saves the resource instance (such as database connection, Web Server connection address, request method, and authentication mode) required by the rule engine action. Before creating the rule, you need to create the resources required by the related action and ensure that the resource is available.


## Action

In the rule engine processing flow, the data is filtered by the rules at first, and  is processed by the action in the end.

The rules output data through actions, and finally implement business functions such as data persistence, device state switching, and event notification.

Actions define operations on data. Most actions require binding resources and configuring the format in which data is written and passed, and additional parameters (such as executed SQL statement templates, topic information for message republish).


The rules engine has a variety of built-in actions:

- Check and debug: simply print data content and action parameters for development and debugging, operation and maintenance troubleshooting, and so on.
- Send data to the Web service: Send data to the API gateway related to the HTTP protocol, support common public cloud function calculation, private deployment server, WehHook, etc., and the data processing is flexible;
- Message republish: The message is republished to the specified topic for message aggregation, redirection, and so on.

For the Enterprise version, the rules engine supports more actions:

**Data Bridging:**

- Bridge data to Kafka: Bridge data to Kafka
-  Bridge data to RabbitMQ: Bridge data to RabbitMQ

**Data persistence：**

- Save data to Cassandra: save data to Cassandra database

- Save data to MongoDB: Save data to MongoDB
- Save data to MySQL: save data to MySQL database
- Save data to OpenTSDB: save data to OpenTSDB database
- Save data to PostgreSQL: save data to a PostgreSQL database
- Save data to Redis: Save data to Redis
- Save data to TimescaleDB: save data to TimescaleDB database