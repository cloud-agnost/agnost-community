## What is Agnost?

Agnost is an open-source backend application development platform running on Kubernetes clusters. Agnostics makes it easier for developers to provision the infrastructure needed to develop and deploy their Node.js applications. With Agnost, you can quickly create new databases or connect to existing ones and start coding your application through its web-based code editor.

Agnost not only speeds up environment creation and simplifies its management but also reduces deployments times considerably. The changes you make to your code are reflected within seconds in your execution environments.

Agnost is a cloud-native platform with modular design to support scalability and performance. All components in Agnost are stateless to enhance elasticity and flexibility. For more architecture details, see [Agnost Architecture Overview](https://agnost.dev/blog/high-level-overview-of-agnost-architecture).

Agnost is released under the [APGL-3.0 license](https://github.com/cloud-agnost/agnost-community/blob/master/LICENSE) in February 2024.

## Key features

Agnost offers a wide range of built-in features that enable developers to build, deploy, and manage applications easily.

<details>
  <summary><b>Support for various databases</b></summary>
  Agnost offers a versatile database support system, accommodating various
database options such as MongoDB, MySQL, or PostgreSQL.
Developers can seamlessly integrate their existing database or choose preferred
database technology, enabling flexible and compatible data management solutions.
  </details>

<details>
  <summary><b>Object storage</b></summary>
  Agnost integrates with prominent cloud storage providers, including AWS S3, GCP Cloud Storage, Azure Blob Storage, and MinIO. Developers gain access to efficient and scalable storage solutions, enabling optimized data access and storage while ensuring data redundancy for reliability.
  </details>

<details>
  <summary><b>Caching</b></summary>
  Enhancing application performance is a priority, and Agnost delivers with its native support for Redis. Redis, an in-memory data structure store, empowers developers to cache frequently accessed data for swift retrieval, reducing database loads and improving application responsiveness.
  </details>

<details>
  <summary><b>Asynchronous processing through message brokers</b></summary>
  Agnost supports standard message queuing systems like RabbitMQ and Kafka (coming soon), facilitating reliable communication between microservices. Asynchronous communication ensures seamless data exchange, benefiting applications built on event-driven architectures.
  </details>

<details>
  <summary><b>Real-time communication</b></summary>
  Experience real-time communication with Agnost's support for WebSockets and Server-Sent Events. Developers can build dynamic applications that deliver live updates to users, accommodating features like real-time notifications and collaborative functionalities.
  </details>

<details>
  <summary><b>Cron jobs</b></summary>
  Automating routine tasks is made simple with Agnost's support for scheduled cronjobs. Developers can automate critical background tasks, such as data backups and report generation, optimizing application performance and reducing manual intervention.
  </details>

<details>
  <summary><b>Built-in security measures</b></summary>
  Agnost prioritizes security, not only through essential features like API keys, rate limiters, and domain/IP white-listing but also by providing robust session management capabilities. These security measures work in tandem to protect applications against potential threats, unauthorized access, and session-related vulnerabilities, enhancing data integrity and safeguarding sensitive information.
  </details>

<details>
  <summary><b>Replication and scalability</b></summary>
  Agnost simplifies scaling with advanced replication capabilities. Developers can create read replicas for databases, cache, and message broker clusters, enhancing performance and fault tolerance. The ability to scale read replicas and manage primary instances allows Agnost to handle serious workloads with ease.
  Agnost also empowers developers with full control over their API servers, allowing them to efficiently manage and deploy their apps with ease. With Agnost, you can harness the benefits of serverless architecture while maintaining flexibility and customization in your app backends.
  </details>

<details>
  <summary><b>Team collaboration and developer experience</b></summary>
  With Agnost, you can develop your backend apps in teams and assign roles to each team member. With its web based code editor, you can immediately start coding and testing your applications. Agnost's management UI, the Agnost Studio, enables realtime collaboration among team membes. 
  Additionally, Agnost Studio provides seamless automatic type definition, making it easier for developers to work with strongly-typed data and maintain code consistency throughout their projects. This feature enhances code quality and reduces the likelihood of type-related errors.
  </details>

## Installation & set up

You can easily install Agnost to a Kubernetes cluster using its [Heml Chart](https://github.com/cloud-agnost/charts). We aimed to create Agnost service provider agnostic so that you can deploy it to your preferred cloud provider or run it on-prem. For details on how to install and set-up agnostics, please visit the [installation guide](https://agnost.dev/docs/category/installation-and-setup).

## Documentation

For guidance on installation, development, deployment, and administration, check out [Agnost Docs](https://agnost.dev/docs/intro). 

## Community & support

There are several ways you can get support or report issues when you encounter problems with Agnost. It's important to provide as much detail as possible when reporting issues so that the community and Agnost team can understand and reproduce your problem in order to help you.

### Reporting Issues on GitHub

If you encounter a bug or issue, please open an issue on the [Agnost GitHub repository](https://github.com/cloud-agnost/agnost-community). Provide as much detail as possible, including:

- Agnost version
- Deployment environment (AWS EKS, Azure AKS, GCP GKE, On-Premise Kubernetes, Minikube etc.)
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or logs if possible

The Agnost team monitors the GitHub issues regularly and will respond as soon as possible.

### Agnost Discussions

Join the discussion on the Agnost Forum. You can ask questions, share your experiences, or help others. Visit the [Agnost Discussions](https://github.com/orgs/cloud-agnost/discussions).

### Email Support

For more critical or specific issues related to your use case, you can email the Agnost support team directly at support@agnost.dev. Be sure to provide detailed information about your issue and your environment to help the support team understand and resolve your issue as quickly as possible.

## Contributing to Agnost

Agnost is an open-source project, and we welcome contributions from the community. There are many ways you can contribute, whether you're a developer, a designer, a writer, or a user. Here are some ways you can contribute to the Agnost project.

### Contribute Code

If you're a developer and want to contribute code to the project, you can start by checking the open issues in the
[Agnost GitHub repository](https://github.com/cloud-agnost). If you want to work on a specific issue, please comment on the issue to let others know you're working on it.

Before you start coding, please review the [contributing guidelines](https://github.com/cloud-agnost/agnost-community/CONTRIBUTING.md) and [code of conduct](https://github.com/cloud-agnost/agnost-community/CODE_OF_CONDUCT.md) to understand the project's development process and expectations.

### Improve Documentation

Good documentation is as important as good code. If you enjoy writing or have a knack for explaining complex concepts in a simple way, you can help improve the Agnost documentation. This can involve writing new guides or tutorials, improving existing documentation, or fixing typos and grammatical errors.

### Report Bugs or Request Features

If you're using Agnost and encounter a bug or have a suggestion for a new feature, please report it on the [Agnost GitHub repository](https://github.com/cloud-agnost). Please provide as much detail as possible so that the community and Agnost team can understand your report or request.

### Help Other Users

If you're an experienced Agnost user, you can contribute by helping other users in the [Agnost Discussions](https://github.com/orgs/cloud-agnost/discussions). Answering questions or providing solutions to problems other users are facing is a great way to contribute to the community.

### Social Media

Follow us on social media for the latest updates and announcements about Agnost.

- Twitter: [@AgnostDev](
