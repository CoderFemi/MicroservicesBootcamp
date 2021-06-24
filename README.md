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
- `Docker` is a tool (container runtime) that is responsible for running containers and makes it easy to install programs without worrying about dependencies and setup. It makes use of the containerisation system to install programs. The Docker Client (CLI) is used to issue commands and interact with the program. The Docker Server (Daemon) is the actual software that creates images, runs and manages containers.
- An `image` is a single file (file system snapshot) containing all the code, dependencies and configuration (startup command etc.) that a program needs to run. In other words, a ready-to-run software package containing everything needed to run an application.
- A `container` is an instance of an image deployed on a virtual machine that has its own independent hardware resources such as memory, networking and storage.

To understand how a container works, it is important to know how system programs interact with the underlying hardware. System programs make system calls to the operating system's `kernel` which then provides access to hardware resources such as disk space, memory etc. If a certain program needs a different version of a dependency to run, than what is already available on the system, a segment of the hard disk will be dedicated to store that different version separate from the other version, so different versions of the same dependency can run on the same system. Two methods are used to create this segmentation: `namespacing` and `control groups`. Namespacing isolates processes from accessing certain hardware resources (disk space), and control grouping restricts the amount of the hardware resource (e.g. memory, cpu usage, bandwidth) that the process can use. *Namespacing and control-grouping are features only available on the Linux operating system*. Therefore, when docker is installed, linux is also installed on a virtual machine on the system. It is the linux kernel, not the Windows or MacOS kernel, that carries out containerisation.

So therefore, a container can be said to be a section of the computer system which contains an isolated running process along with the segmented resources that only it can access. In other words, it is a process or group of processes that has a subset of resources specifically assigned to it.

When an instance of an image is created, the kernel isolates a segment of the hard drive and stores the code there. It then runs the program and the running program only has access to that portion of the hard drive and any other segments of system resources such as RAM and CPU assigned to it.

#### Docker CLI commands
- `docker run <imageName>` : searches the local cache for the image specified and if not found, downloads it from the docker hub, caches it, creates an instance of the image, creates a container and runs the startup command to start the program in the container. Next time the command is run, it retrieves the image from the local cache. It is the equivalent of two commands `docker create` and `docker start`.
- `docker run <imageName> <alternateCommand>` : When an alternate command is provided, it overrides and replaces the default startup command which is run when the container is created. Note that the command will only run if the executable file is present in the container's code.
- `docker ps` : This shows a list of all running containers with information like the id, time running, name etc. Adding the flag `--all` shows all the containers that have ever been created.
- `docker create <imageName>` : This command creates a container and prints the id in the terminal.
- `docker push <imageName>` : This pushes the image to Dockerhub.
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

In the docker client, navigate to the folder that contains the dockerfile and run the command `docker build .`. This will pass the dockerfile to the docker server, which creates the image and returns the id. To break down the command, `docker` sends the dockerfile to the server, `build` creates the image, `.` the dot specifies that the build context should be the whole set of files and folder structure of the base image (alternatively, that Docker should look for the dockerfile in the current directory).

Rather than using the image id to start up a container, the convention is to **tag the image** for the build process. The naming convention is in the format `<dockerUsername>/<imageName>:latest>`. latest refers to the most recent version of the image, and it is completely optional as it gets appended when you don't include it. Therefore to run the build command would be `docker build -t coderFemi/redis:latest .`, and the run command would be `docker run coderFemi/redis`.

A docker image can also be manually generated using the command line instead of a dockerfile, using the `docker commit` command.
<!-- docker commit -c "CMD 'redis-server'" CONTAINERID -->

### KUBERNETES
Kubernetes is a container management system.
- Cluster: A kubernetes cluster is a collection of nodes one of which is a master that manages all the other nodes.
- Node: A node is a virtual machine that runs the containers.
- Pod: A pod is a running container. A pod encapsulates/wraps a container, and can contain more than one container. However when it runs only one container, it can simply be referred to as a container or pod.
- Deployment: This is code that monitors a set of pods, ensuring they are always up and running. These pods are identical in nature, have the same configuration and run the same containers. The deployment manager also manages upgrades by creating new pods running the new app version and deleting the previous pods running the old version.
- Service: A service is a url that makes it easy to access pods. It is what enables communication between the pods. An event bus which needs to emit an event to a pod, will do so through the service. In other words, a cluster service provides networking between pods.
- Config File: Kubernetes config files specify the different deployments, pods and services - technically known as `objects` - that need to be created. Config files are written in YAML format and provide documentation about the clusters that are running; therefore they should be stored along with source code in the repository. It is possible to run commands in the terminal to create objects directly without config files, but *it is not recommended to do this*. A single config file can deploy more than one object, they are separated by three dashes `---` on a single line. Deployment objects are usually deployed along with their corresponding Service objects.

When an image is run through docker and then sent off to kubernetes, the cluster master runs the config file which specifies the number of nodes to run and the level of network connectivity for each of them i.e. if they are to be accessible from outside the cluster. The nodes are created, and the containers/pods are started up within those nodes, and monitored by the deployment code.

#### Creating a Pod

In the YAML file, the following is the code required for creating a pod:

```
apiVersion: <version>  // This specifies what version - e.g. v1 - to pull the object (pod) from. Kubernetes has different API versions for built-in objects
kind: Pod          // Here we specify what kind of object we want to create, in this case, a Pod (title case).
metadata:
  name: <podName>    // This is just a name used to identify the object. Note that the indent on the second line must be observed, with just two spaces, or else it will generate an error.
spec:                   // The attributes to be applied to the object about to be created.
  containers:           // Many containers can be created in a pod. So this signifies the start of an array.
  - name: <containerName> // The dash/hyphen in front signifies an item in the array. i.e. one container out of many.
    image: <dockerUsername/imageName:version> // Note that a specific version (i.e. 0.0.1) must be appended to the image name so that the image is retrieved from the file system. Or else it will default to 'latest' and docker will go to retrieve it from dockerhub. This last scenario happens when the image has been upgraded to a new version after an app upgrade. (The best way to handle app upgrades.) The image is pushed to Dockerhub, and there is no need to change the version in the config file, since no version has been specified, it defaults to latest and it is retrieved from Dockerhub and deployed.

```

#### Creating a Deployment

Using a deployment to manage pods is best practice and easier, rather than using the above method to create individual pods. In the YAML file (file name should be suffixed with 'depl'), the following is the code required for creating a deployment:

```
apiVersion: <apps/version>  // This specifies what version to pull the object (deployment) from. Kubernetes has different API versions for built-in objects.
kind: Deployment          // Here we specify what kind of object we want to create, in this case, a Deployment (title case).
metadata:
  name: <deploymentName-depl>    // This is just a name used to identify the object. It must be suffixed with 'depl' to indicate it's a deployment. This helps when going through logs, to differentiate objects faster. Note that the indent on the second line must be observed, or else it will generate an error.
spec:                   // The attributes to be applied to the object about to be created.
  replicas: <number>    // The number of pods to be started up.
  selector:           // To help identify which pods are being managed by the deployment, by matching labels.
    matchLabels:
      <labelName>:<label> // E.g. app: posts
  template:         // Configuration information
    metadata:
      labels:
        <labelName>:<label>
    spec:
      containers:
        - name: <containerName>
        image: <dockerUsername/imageName:version> // Note that a specific version (i.e. 0.0.1) must be appended to the image name so that the image is retrieved from the file system. Or else it will default to 'latest' and docker will go to try and retrieve it from dockerhub.

```

#### Creating a Cluster Service
Types of Services:
* Cluster IP: Sets up a url through which a pod can be accessed, only by other pods in its cluster.
* Node Port: This makes a pod accessible from outside the cluster. This type of service is mainly for development purposes.
* Load Balancer: This service makes a pod accessible from outside the cluster. This type is for production, as it  manages incoming traffic and redirects to the pods in the cluster. In reality, the load balancer service uses a cloud provider's load balancer to direct traffic to an ingress controller which handles routing of requests to the ClusterIps of each pod in the cluster. The load balancer used mostly is the kubernetes ingress-nginx which is installed via the `kubectl apply -f <installationUrl>`. Then an ingress service is configured in a yaml file. The configuration requires creating a fake host and mapping it to your machine's localhost in a config file located at `C:/Windows/System32/drivers/etc/hosts`
* External Name: This redirects in-cluster requests to a CNAME url.

In the YAML file (file name should be suffixed with 'srv'), the following is the code required for creating a service:

```
apiVersion: <version>  // This specifies what version - e.g. v1 - to pull the object (deployment) from. Kubernetes has different API versions for built-in objects.
kind: Service          // Here we specify what kind of object we want to create, in this case, a Service (title case).
metadata:
  name: <serviceName-srv>    // This is just a name used to identify the object. It must be suffixed with 'srv' to indicate it's a service. This helps when going through logs, to differentiate objects faster. Note that the indent on the second line must be observed, or else it will generate an error.
spec:                   // The attributes to be applied to the object about to be created.
  type: <ServiceType>   // The type of service to be created (title-cased). If not defined, it will default to a type of ClusterIP, which will be created.
  selector:           // To help identify which pods should be monitored by the service, by matching labels.
    <labelName>:<label> // E.g. app: posts
  ports:              // Port configuration information
    - name: <portName>
      protocol: TCP
      port: <port>        // Port on which the service should listen for events.
      targetPort: <port>  // Port on which the pod is listening for events.

```
When a NodePort service is created, a port, usually in the range 30000 - 32000, is assigned randomly to the node, on which the node listens for traffic from the outside world i.e. the port which you type in the browser. This can be located by running the get services or describe service command. *Note that all these ports are just for development environments.*

#### Kubernetes CLI commands

- `kubectl apply -f <configFilename>` // Run config file and create object(s) specified within it. A dot instead of the configFilename, means all the deployments in the current directory will be executed i.e. `kubectl apply -f .`
- `kubectl describe <object> <objectName>` // Get detailed info about a running object.
- `kubectl get <objects>` // Get a list of all running objects 
- `kubectl exec it <podName> <command>` // Run a command directly in the pod e.g. open up a shell (sh)
- `kubectl logs <podName>` // Show logs for a pod
- `kubectl delete <object> <objectName>` // Delete an object
- `kubectl rollout restart deployment <deploymentName>` // This restarts a deployment using an updated image (new version) pulled from dockerhub.

#### Skaffold
Skaffold watches for changes to kubernetes config files (yaml) and automatically applies it to the running cluster. It also ensures that anytime the app source code is updated, it is immediately synced to the appropriate container running inside the cluster.


## TYPESCRIPT
Typescript is a type system. It is just plain javascript, with additional syntax (type annotations) to help catch errors during development. During development, it constantly analyses our code realtime and points out any errors. Saves time, because we do not have to wait till we run our code before detecting any errors. The type system is only active during development; when compiled for production, it is just plain javascript. Typescript files have the `ts` file extension.

It is installed via an npm library - `typescript`. A companion compiler `ts-node` compiles typescript files to javascript.

## Types
Typescript uses the primitive and object types available in Javascript. There are other additional primitive types in TS: `void`, `symbol` and `any`. 'Any' is returned by typescript when it cannot infer the result of certain methods such as JSON.parse() because what the method returns depends on the string that is passed in as an argument.

### Type Annotation vs Type Inference

#### Variables
Type annotation is the additional code included by us in javascript to set up which types we are referring to. For example to declare a variable, a colon and the type are included. `const age: number = 28`. Here, the type annotation is the colon followed by the type, number. Also to add a TA for an array of strings would be `let names: string[] = ['John', 'Mary']`.

On the other hand, with type inference, TS guesses the type of the variable based on what was assigned to it on initialisation. Typescript can only infer when the variable is both declared and initialised on one line. Therefore, there is no need to add any annotations. We only need to add annotations in the following three scenarios:
* When a variable is declared on one line and initialised later on another.
* When the type of the variable cannot be inferred correctly. E.g. when we assign a boolean to a variable but later need to assign it a value of number. Here TS cannot infer that the type could be more than one. So we need to add in an annotation that specifies the type as `:boolean | number`
* When a method returns the 'any' type and we need to clarify the value e.g. JSON.parse().

#### Functions
For functions, we add type annotation to tell TS the type of arguments that are being passed into and the type of value returned from the function. TS can infer what value is returned from the function, so annotation may not be required for a return value. It cannot infer what arguments are being passed in. *It is however recommended to always use a return annotation to enable TS detect when a mistake is made and no return statement is declared.* When no return statement is declared and there is no return annotation, TS will simply infer a type of 'void' for the return value and raise no errors. If we deliberately intend not to return anything from the function, then a return annotation of `void` is required. If we are never going to return anything from the function then we annotate with `never`.

```
// Will return a number
const add = (a: number, b: number): number => {
  return a + b
}

// Will return nothing
const add = (a: number, b: number): void => {
  console.log(a + b)
}

// Will never return anything
const errorMessage = (message: string): never => {
  throw new Error(message)
}

```

To provide type annotation for nested variables we use the following syntax:
```
const person = {
  name: 'Peter',
  age: 29
}
const greeting = (person: {name: string, age: number}) => {
  console.log(`Hi, my name is ${person.name} and I am ${person.age} years old.`)
}

// Destructuring arguments
const greeting = ({name, age}: {name: string, age: number}) => {
  console.log(`Hi, my name is ${name} and I am ${age} years old.`)
}

```

#### Objects
Object destructuring is done as also seen above when destructuring arguments.
```
const {name, age}: {name: string, age: number} = person

```

#### Array
Types in arrays can be annotated or inferred. A one-level array of strings is annotated as `const array = string[]`, while a two-dimensional array will have the annotation `const array = string[][]`. To declare an array with flexible types, a type annotation using the pipe operator is added to indicate more than one type of value for the array e.g. `const array = (string | number)[]`

TS provides a lot of benefits when working with arrays:
- It can provide inference when pulling items from an array. The item accessed will have the same type as what was annotated/inferred for the whole array.
- TS can also prevent incompatible elements from being added to an array e.g. trying to add a number to an array of strings.

#### Tuples
A tuple is essentially an array, with different types of items, but with a specific order to those items. It is used instead of an object to track key-value pairs. But only the values are stored in the tuple, in a specific order which cannot be disarrayed.

They are not that popular due to the fact that there is obviously a loss of information. Without the keys, it would be difficult to decipher what the values represent.

```
// Object with key-value pairs
const person1 = {
  name: 'Parker',
  age: 29,
  alive: true
  greeting(): string {
    return `Hi, I'm ${this.name} and I am ${this.age} years old.`
  }
}

// A tuple showing the same information
const person1: [string, number, boolean] = ['Parker', 29, true]

// Tuple implemented with an alias
type Bio = [string, number, boolean] // alias
const person1: Bio = ['Parker', 29, true]

```
#### Interfaces
An interface is used to create a new type that makes it easier to annotate object properties. It is particularly useful when creating reusable, generic functions that use one interface to annotate similar properties or methods of different objects.

```
interface Person = {
  name: string,
  age: number,
  alive: boolean
  greeting(): string // A method with no arguments that returns a string
}

const printGreeting = (person1: Person): void => {
  console.log(person1.greeting())
}

```

#### Classes
Typescript uses the modifiers public, private and protected on methods to detect errors in code. A method with no modifier is public by default. A private method can only be accessed by other methods within the same class, while a protected method can only be accessed by other methods in the same class as well as child classes.

The public keyword can also be useful in TS for defining a property in the constructor function.

```
// Traditional property definition
class Vehicle {
  model: string
  mileage: number
  constructor(model: string, mileage: number) {
    this.model = model
  }
}

// Property definition with public keyword
class Vehicle {
  constructor(public model: string, mileage: number) {}
}

const car = new Vehicle('Toyota', 5200)

```
The combination of interfaces and classes provide the reusability of code in Typescript.

### Modules and Typescript
* **Type Declaration Files**: When using an npm module, it is important to check if it has a type declaration file. The import statement will show an error if there is none. Type declaration files are usually downloadable as npm modules in the form `@types/<moduleName>`. The type declaration file usually shows a lot of information about the type annotations for all the methods and properties available in the module. The same thing is applicable for modules imported with html script tags. For instance, using the Google maps API script tag creates a global namespace in our project, but Typescript cannot recognise it until the type declaration file for it is installed.
* **Default vs Named Exports**: It is a commonly accepted convention by Typescript developers to only use named exports and not default exports. Sticking to only one type of export reduces the likelihood of generating an error.
* **Dual Nature of Classes** In Typescript, classes are used both as a value and a type for annotation purposes. In other words, a class is used to create an instance of an object, and it can also refer to the Class type. For example, a User class can be used to create a new instance of a user, and it can also be used to refer to a type of User.
* **implements clause** The `implements` keyword is used to create a checking relationship between a class and an imported interface. E.g. `class User implements SomeInterface` means that TS will always check the User class to ensure that it satisfies/contains all the required properties set by the interface. If it doesn't, the file is highlighted with an error, and it is easy to trace the error to that particular file.