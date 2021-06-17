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
To add a new feature, such as comment moderation, a new service is created. When the comment service creates a comment and emits a `comment-created` event, the moderation service receives the event, and since moderation may take time, the query service also receives and processes it immediately so that the client can render it immediately. When the moderation service is done processing the comment, it emits an event back to the comment service, which then updates the status of the comment and then emits an update which is received by the query service and updated to the client.

The comment service handles all the business logic and the query service does only what it's meant to do; serve up responses to data queries.

## Microservices Scalable Architecture
At the end of building the mini-blog app, the architecture employed was sufficient enough for development purposes. However, for production, challenges would be encountered:
- Scalability: At some point, the app would have to scale up/scale down to accommodate fluctuations in traffic. It would be difficult to create copies of services and there would be a problem of distributing traffic between the scaled up services.
- Automation: With scalability comes the ability to setup and start servers on the go, and it would be impossible to do all this manually.

Two very important tools, Docker and Kubernetes offer scalability and automation to programs.

### Docker
- `Docker` is a tool that makes it easy to install programs without worrying about dependencies and setup. It makes use of the containerisation system to install programs. The Docker Client (CLI) is used to issue commands and interact with the program. The Docker Server (Daemon) is the actual software that creates images, runs and manages containers.
- An `image` is a single file (file system snapshot) containing all the dependencies and configuration (startup command etc.) that a program needs to run.
- A `container` is an instance of an image deployed on a virtual machine that has its own independent hardware resources such as memory, networking and storage.

To understand how a container works, it is important to know how system programs interact with the underlying hardware. System programs make system calls to the operating system's `kernel` which then provides access to hardware resources such as disk space, memory etc. If a certain program needs a different version of a dependency to run, than what is already available on the system, a segment of the hard disk will be dedicated to store that different version separate from the other version, so different versions of the same dependency can run on the same system. Two methods are used to create this segmentation: `namespacing` and `control groups`. Namespacing isolates processes from accessing certain hardware resources (disk space), and control grouping restricts the amount of the hardware resource (e.g. memory, cpu usage, bandwidth) that the process can use. *Namespacing and control-grouping are features only available on the Linux operating system*. Therefore, when docker is installed, linux is also installed on a virtual machine on the system. It is the linux kernel, not the Windows or Mac kernel, that carries out containerisation.

So therefore, a container can be said to be a section of the computer system which contains an isolated running process along with the segmented resources that only it can access. In other words, it is a process or group of processes that has a subset of resources specifically assigned to it.

When an instance of an image is created, the kernel isolates a segment of the hard drive and stores the code there. It then runs the program and the running program only has access to that portion of the hard drive and any other segments of system resources such as RAM and CPU assigned to it.

Docker CLI commands
- `docker run <imageName>` : searches the local cache for the image specified and if not found, downloads it from the docker hub, caches it, creates an instance of the image, creates a container and runs the startup command to start the program in the container. Next time the command is run, it retrieves the image from the local cache. It is the equivalent of two commands `docker create` and `docker start`.
- `docker run <imageName> <alternateCommand>` : When an alternate command is provided, it overrides and replaces the default startup command which is run when the container is created. Note that the command will only run if the executable file is present in the container's code.
- `docker ps` : This shows a list of all running containers with information like the id, time running, name etc. Adding the flag `--all` shows all the containers that have ever been created.
- `docker create <imageName>` : This command creates a container and prints the id in the terminal.
- `docker start <containerId>` : This starts up the container. To print information about the container's running process in the terminal the `-a` flag is used.
- `docker stop <containerId>`: This stops the container after 10 seconds, giving it time to shut down its processes. If doesn't stop after the delay, `docker kill` automatically runs to shut down the container immediately.
- `docker logs <containerId>` : Shows all records of logs that have been emitted from the container.
- `docker exec -it <runningContainerId> <command>` : This command is used to run an additional program inside a container that is already running. For example, a Redis Store container is up and running waiting for data to be saved to it. The Redis CLI program is needed to communicate with the Redis store. If it is run separately, it cannot communicate with the program from outside the container. The above command is run as `docker exec -it <redisContainerId> <redis-cli>` to enable redis-cli to be run within the same container. 
    The `it` flag is a combination of two flags `-i` and `-t`. The former attaches to the STDIN process of the container which allows text from the CLI to be passed into the program. The latter simply formats the terminal text prettily. 
    Every process created in a Linux environment has three communication channels attached to it: `STDIN`, `STDOUT` and `STDERR`. As the names imply, standard in conveys information into the process from the terminal, standard out conveys information out from the process to the terminal, while standard error conveys information about errors back to the terminal.
    To avoid the constant use of `docker exec` to connect to the container, it is simpler to start up a shell program (or bash, git bash or zsh) inside the container (if included in the original image) which can be used to interact directly with the instance. This is by using the command `docker exec -it <containerId> sh`, where sh stands for shell.
    A shell can also be started immediately when the container instance is first created, with `docker run -it <image> sh`. But this means the shell program will be the only process running in the container. This is useful for when we want to just work with the file system, without running any other process.
- `docker system prune` : This deletes all stopped containers and reclaims system storage space. It also removes other things like cached images.