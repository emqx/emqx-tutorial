# Overview of Rule Engine 

> Applicable version: `EMQ X v3.1.0+`

EMQ X Rule Engine (Hereinafter referred to as rule engine) is used to configure the processing and response rules of EMQ X message flows and device events. Rule engine not only provides a clear and flexible "configurable" business integration solution, which is used to simplify the business development process, improve usability, and reduce the coupling degree between the business system and EMQ X, but also provides a better infrastructure for the private function customization of EMQ X to speed up development delivery.

![image-20190506171815028](../assets/image-20190506171815028.png)



## Minimum rule

The rule describes Three configurations of **where the data comes from, how to filter and process the data, and where the processed results are going. ** One available rule contains three elements:

- Trigger event: The rule is triggered by an event. When triggered, the event injects context information (data source) of the event into the rule, and  the event type is specified through the FROM clause of the SQL;
- Processing rules (SQL): Filter and process data from context information using the SELECT clause and the WHERE clause and built-in handlers;
- Response action: If there is an output of processing result , the rule will perform the corresponding action, such as persistence to the database, republishing the processed message, forwarding the message to the message queue, and so on. A single rule can configure multiple response actions.


As shown in the figure, it is a simple rule for processing the data during the **message release** , filtering out the `msg` field,  message `topic and QoS` of all the topic messages, and sending it to the web. Server and /uplink topics:


![image-20190610112501545](../assets/image-20190610112501545.png)



## Examples of typical application scenarios for rule engine 

- Action listening: In the development of intelligent door lock for smart home, the function of the door lock will be abnormal because of offline resulting by the network or power failure, man-made damage and other reasons. Through using rule engine configuration to monitor offline events, it can push the fault information to the application service and realize the ability of first time fault detection in the access layer.
- Data filtering: Truck fleet management of vehicle network. Vehicle sensors collect and report a large amount of operational data. The application platform only focuses on data with a vehicle speed greater than 40 km/h. In this scenario, the rule engine can be used to conditionally filter messages to the service, and data that satisfies the condition can be written to the  business message queue .
- Message routing: In the intelligent billing application, the terminal device distinguishes the service type by different topics. The message of billing service can be connected to the billing message queue by configuring the rule engine, and the non-billing information can be connected to other message queues to realize the routing configuration of business messages.
- Message encoding and decoding: In the application scenarios such as public protocol/proprietary TCP protocol access and industrial control, the encoding and decoding of binary/special format message body can be done through the local processing function of the rule engine (which can be customized and developed on EMQ X). Relevant messages can also be routed through the rule engine to external computing resources such as function computing for processing (processing logic can be developed by users), and the messages can be converted into JSON format that is easy for business processing, which simplifies the difficulty of project integration and improves the ability of rapid development and delivery of applications.