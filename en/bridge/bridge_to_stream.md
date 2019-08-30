# Bridge EMQ X to streaming service (EMQ X Enterprise Edition)
The generation and consumption of data in IoT environment are different from which of the traditional Internet. Every moment, the massive devices of IoT network generates data continually. These data can be very different in aspect of their content, they could be temperature of a room, location of a car, or status of manufactory device. But for a same application, despite of the difference of data generating devices, the generated data can be very similar. For example, in a smart home application, there may be different thermometers from different vendors in place, but the data generated are usually has a same format. These massive data fragments flow in IoT network, they can be processed in a central location in  convergent way. This requires that the IoT network has a different mechanism to handle these data flows. In practice, it can be a streaming data service.
。

## Character of Streaming Data Service
**Unbounded Data**  
The data source of a streaming data service generates data continually. Data flows to the streaming service, it is possible that the data generating never ends.

**Unbounded Data Processing**  
To handle the endless data input, the data processing itself must be also endless. Data flows in, and data are processed, stored, and then output to other units or feedback to the input network.  

**Low latency**  
Low latency. Different from a loop of batch processing, streaming doesn't segments data flow. Streaming processes data at all time. This makes the processing latency in a relative low level.

**Approximate or Speculative Results**  
The data source generates the data endlessly, at every moment there are data waiting for processing, the result from the processed data can be approximate or speculative.

## EMQ X as data source
EMQ X is a powerful IoT message broker, The high performance and high availability of EQM X and the Subscribe/Publish pattern of MQTT message exchange make it a natural data source of streaming processing.

_In the next sections you will see how to setup bridge from EMQ X to streaming processing._
