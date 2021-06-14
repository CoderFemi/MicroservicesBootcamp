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
