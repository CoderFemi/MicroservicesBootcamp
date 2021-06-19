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

To understand how a container works, it is important to know how system programs interact with the underlying hardware. System programs make system calls to the operating system's `kernel` which then provides access to hardware resources such as disk space, memory etc. If a certain program needs a different version of a dependency to run, than what is already available on the system, a segment of the hard disk will be dedicated to store that different version separate from the other version, so different versions of the same dependency can run on the same system. Two methods are used to create this segmentation: `namespacing` and `control groups`. Namespacing isolates processes from accessing certain hardware resources (disk space), and control grouping restricts the amount of the hardware resource (e.g. memory, cpu usage, bandwidth) that the process can use. *Namespacing and control-grouping are features only available on the Linux operating system*. Therefore, when docker is installed, linux is also installed on a virtual machine on the system. It is the linux kernel, not the Windows or MacOS kernel, that carries out containerisation.

So therefore, a container can be said to be a section of the computer system which contains an isolated running process along with the segmented resources that only it can access. In other words, it is a process or group of processes that has a subset of resources specifically assigned to it.

When an instance of an image is created, the kernel isolates a segment of the hard drive and stores the code there. It then runs the program and the running program only has access to that portion of the hard drive and any other segments of system resources such as RAM and CPU assigned to it.

#### Docker CLI commands
- `docker run <imageName>` : searches the local cache for the image specified and if not found, downloads it from the docker hub, caches it, creates an instance of the image, creates a container and runs the startup command to start the program in the container. Next time the command is run, it retrieves the image from the local cache. It is the equivalent of two commands `docker create` and `docker start`.
- `docker run <imageName> <alternateCommand>` : When an alternate command is provided, it overrides and replaces the default startup command which is run when the container is created. Note that the command will only run if the executable file is present in the container's code.
- `docker ps` : This shows a list of all running containers with information like the id, time running, name etc. Adding the flag `--all` shows all the containers that have ever been created.
- `docker create <imageName>` : This command creates a container and prints the id in the terminal.
- `docker start <containerId>` : This starts up the container. To print information about the container's running process in the terminal the `-a` flag is used.
- `docker stop <containerId>`: This stops the container after 10 seconds, giving it time to shut down its processes. If it doesn't stop after the delay, `docker kill` automatically runs to shut down the container immediately.
- `docker logs <containerId>` : Shows all records of logs that have been emitted from the container.
- `docker exec -it <runningContainerId> <command>` : This command is used to run an additional program inside a container that is already running. For example, a Redis Store container is up and running waiting for data to be saved to it. The Redis CLI program is needed to communicate with the Redis store. If it is run separately, it cannot communicate with the program from outside the container. The above command is run as `docker exec -it <redisContainerId> <redis-cli>` to enable redis-cli to be run within the same container. 
    The `it` flag is a combination of two flags `-i` and `-t`. The former attaches to the STDIN process of the container which allows text from the CLI to be passed into the program. The latter simply formats the terminal text prettily. 
    Every process created in a Linux environment has three communication channels attached to it: `STDIN`, `STDOUT` and `STDERR`. As the names imply, standard in conveys information into the process from the terminal, standard out conveys information out from the process to the terminal, while standard error conveys information about errors back to the terminal.
    To avoid the constant use of `docker exec` to connect to the container, it is simpler to start up a shell program (or bash, git bash or zsh) inside the container (if included in the original image) which can be used to interact directly with the instance. This is by using the command `docker exec -it <containerId> sh`, where sh stands for shell.
    A shell can also be started immediately when the container instance is first created, with `docker run -it <image> sh`. But this means the shell program will be the only process running in the container. This is useful for when we want to just work with the file system, without running any other process.
- `docker system prune` : This deletes all stopped containers and reclaims system storage space. It also removes other things like cached images.

When requests need to be made to the container from an external client, such as from a web browser, `port-mapping` needs to be done to re-route communication from the localhost's port to the container's port. This is because the container has it's own separate networking resources. Port mapping is not necessary for outgoing requests; the container can communicate directly with external networks. To run a container with port mapping, the command to run is `docker run -p <localhostPort>:<containerPort> <imageNameOrId>`. It should be mapped at runtime, not inside the dockerfile.

#### Creating an Image
To create an image, create a dockerfile and write code in which specifies a base image, commands to download and install additional programs (dependencies), and a command to run the container on startup. The dockerfile is fed through the docker client to the docker server which builds the image.

The dockerfile format is `Dockerfile`, capitalised first letter and with no file extension. The dockerfile structure is as follows:
- `FROM <baseImage>` : This commands specifies which base image to use. A base image is kind of like an operating system of sorts. It contains a set of programs that are used to carry out the RUN and CMD operations. There are many base images available on the web used for initialising a dockerfile.
- `RUN <installCommand> <dependency>` : Specifies the dependencies to install. For the *alpine* base image, there is a package manager called apk which is used to download and install programs. *(alpine is docker terminology for a specific name for a very small-sized version of an image. E.g. the 'node:alpine' image will only contain the bare necessities needed to run node, without any additional dependencies.)* So the command to install redis would be `RUN apk add --update redis`. In this step, a temporary container is created from the base image which is used to run the command. Then a snaphot is taken of the modified file system, which now includes the installed dependencies and becomes the updated image. Then the temporary container is removed.
- `CMD ["<startupCommand>"]` : This specifies what command to use to startup a container instance. In this step, the updated image is run in another temporary container, an updated system snapshot is taken which now includes the startup command, and the temporary container removed. This final snapshot is now the new image that will be used.
- `COPY` : Another dockerfile command that is vital is the `COPY` command. In some situations one would need to make configuration files available to the temporary containers during the build process. This is because the containers only have access to a specific segment of the system hard drive. Therefore we use the `COPY <systemFilePathToCopyFrom> <containerFilePathToCopyTo>`, and this is usually the root directories of the project therefore would be `COPY ./ ./`. The 'copy' command needs to come before the 'run' command so that the configuration files are available for the run command to make reference to. *Also note that the copy command as well as it's position in the file can be modified to ensure that unnecessary files which are not needed for the build are not copied.* Also, a `.dockerignore` file is used to isolate files that we do not want to copy over, such as the node_modules folder.
- `WORKDIR` : is a dockerfile command used to specify the working directory where our app's files should be stored in the container. The linux system usually has a `usr` folder, and this is the most common place to store user files. Therefore to store our files in an app folder in the usr folder the command would be `WORKDIR usr/app`. This command needs to come before the 'copy' and 'run' commands.

In the docker client, navigate to the folder that contains the dockerfile and run the command `docker build .`. This will pass the dockerfile to the docker server, which creates the image and returns the id. To break down the command, `docker` sends the dockerfile to the server, `build` creates the image, `.` the dot specifies that the build context should be the whole set of files and folder structure of the base image.

Rather than using the image id to start up a container, the convention is to **tag the image** for the build process. The naming convention is in the format `<dockerUsername>/<imageName>:latest>`. latest refers to the most recent version of the image, and it is completely optional as it gets appended when you don't include it. Therefore to run the build command would be `docker build -t coderFemi/redis:latest .`, and the run command would be `docker run coderFemi/redis`.

A docker image can also be manually generated using the command line instead of a dockerfile, using the `docker commit` command.
<!-- docker commit -c "CMD 'redis-server'" CONTAINERID -->

### KUBERNETES
Kubernetes is a container management system.
- Cluster: A kubernetes cluster is a collection of nodes one of which is a master that manages all the other nodes.
- Node: A node is a virtual machine that runs the containers.
- Pod: A pod is a running container. A pod encapsulates/wraps a container, and can contain more than one container. However when it runs only one container, it can simply be referred to as a container or pod.
- Deployment: This is code that monitors a set of pods, ensuring they are always up and running.
- Service: A service is a url that makes it easy to access containers. It is what enables communication between the containers. An event bus which needs to emit an event to a container, will do so through the service.
- Config File: Kubernetes config files specify the different deployments, pods and services - technically known as `objects` - that need to be created. Config files are written in YAML format and provide documentation about the clusters that are running; therefore they should be stored along with source code in the repository. It is possible to run commands in the terminal to create objects directly without config files, but *it is not recommended to do this*.

#### Kubernetes Workflow
When an image is run through docker and then sent off to kubernetes, the cluster master runs the config file which specifies the number of nodes to run and the level of network connectivity for each of them i.e. if they are to be accessible from outside the cluster. The nodes are created, and the containers/pods are started up within those nodes, and monitored by the deployment code.

**Creating a pod**
In the YAML file, the following is the code required for creating a pod:

```
apiVersion: <version>  // This specifies what version to pull the object (pod) from. Kubernetes has different API versions for built-in objects
kind: <object>          // Here we specify what kind of object we want to create, in this case, a pod.
metadata:
  name: <objectName>    // This is just a name used to identify the object. Note that the indent on the second line must be observed, with just two spaces, or else it will generate an error.
spec:                   // The attributes to be applied to the object about to be created.
  containers:           // Many containers can be created in a pod
  - name: <containerName>
    image: <dockerUsername/imageName:version> // Note that a specific version (i.e. 0.0.1) must be appended to the image name so that the image is retrieved from the file system. Or else it will default to 'latest' and docker will go to try and retrieve it from dockerhub.

```
**Kubernetes CLI commands**
- `kubectl apply -f <configFilename>` // Run config file and create object(s) specified within it.
- `kubectl describe pod <podName>` // Get detailed info about a running pod.
- `kubectl get pods` // Get a list of all running pods 
- `kubectl exec it <podName> <command>` // Run a command directly in the pod e.g. open up a shell (sh)
- `kubectl logs <podName>` // Show logs for a pod
- `kubectl delete pod <podName>` // Delete a pod