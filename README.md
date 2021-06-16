# MICROSERVICES BOOTCAMP

## Monolith vs Microservices Architecture
A monolithic server is what every developer is commonly used to. This single server contains all the code for Routing, Middleware, Business Logic and Database Access needed to implement *ALL* the features of the app. A **Microservice** on the other hand, is self-contained and contains only the code and its own database needed to implement only *ONE* feature of the app.

The stand-alone nature of a microservice guarantees the continual uptime of the system. If one microservice crashes, it does not affect another microservice which stays up and running because it is completely independent. A characteristic of a microservice is known as the Database-Per-Service i.e. each service gets its own database to read and write from. This is due to the following:
* Each service should run independently of other services.
* Database schema/structure might change unexpectedly.
* Some services might function better with a different type of database.

## Data Management in Microservices
The biggest problem of Microservices is data management; how to communicate between one service and another. Since each service cannot read from another's database, there needs to be a form of direct request made from one service to another. This problem can be solved either with Synchronous communication or Asynchronous communication.
- Synchronous communication: In sync comm, the new service connects to the other services *by using direct requests*. This has its pros and cons. It is very easy to understand and the requesting service does not need to have a database. However, if any of the other services fail, the request made by the new service will also fail, because there is a dependency between the services. There can also be an intricate web of requests, if servies depend on other services which depend on other services.
- Asynchronous communication: With async comm, *communication is established using events*. This can be accomplished in two ways:
    * Using an event bus: An event bus is set up to receive events and transmit them to the services that would process and send back results which would be returned to the requesting service. Using an event bus also has its shortcomings, because it is a single point of failure, and there can also be an intricate web of events being sent back and forth.
    * Using an event bus, along with a separate database for the new microservice: In this structure, there are no dependencies between services, and data retrieval is super fast. Services are setup to emit an event anytime a resource is created. The data is received by the service which needs it from the event bus and is stored in a separate database. When a request is made for that data, the service can easily look it up in its own database, without having to communicate with the other services again. The downsides to this approach is that it's harder to understand, and there are duplicated data, which may become stale over time. The cost of storing the duplicated data might be negligible and not pose any problem.

## Microservices Architecture: Building an app from scratch
Building an app requires considering all the resources that are going to be created and manipulated within the app. For a simple mini-blog app, the main resources are posts and comments. These two resources are the two main features that will be implemented as microservices.

### Implementing an Event Bus
Fetching data from the different servers initially involves dispatching multiple requests. In this scenario, to render all the comments for `n` number of posts, a request will be sent n times to retrieve all the associated comments for all the posts. This is the first notable challenge involved in microservices, and is solved by setting up a Query Service and an Event Bus which would listen for, recieve and transmit events to all services. Popular open source event buses are RabbitMQ, Kafka and NATS which all have their pros, cons and specific use cases. A simple event bus can be implemented using an express server to demonstrate what happens under the hood of these open-source options.

When any CRUD operation (event) is emitted from a service to the event bus, it transmits the event to all services, including the one that emitted it. The services listen for the event, which is handled appropriately and a response sent back to the event bus.

An event object includes a type property, which indicates what type of event is being emitted, and a data property which contains the data being transmitted.

The Query Service receives events from all the other services and stores the data in a structure/schema that would provide all the information needed in one place. In this scenario, all posts would be stored along with their associated comments, for easy retrieval. Therefore the client, rather than make requests to the individual services, would make a request to the Query Service for information, now domiciled in one location.

What happens when a service goes down, and it does not receive any events during the downtime? This is solved by creating a cache/event datastore that stores all the events. As soon as the service comes back online, it accesses all the events and processes them accordingly.

### Adding New Features
To add a new feature, such as comment moderation, a new service is created. When the comment service creates a comment and emits a comment-created event, the moderation service receives the event, and since moderation may take time, the query service also receives and processes it immediately so that the client can render it immediately. When the moderation service is done processing the comment, it emits an event back to the comment service, which then updates the status of the comment and then emits an update which is received by the query service and updated to the client.

The comment service handles all the business logic and the query service does only what it's meant to do; serve up responses to data queries.