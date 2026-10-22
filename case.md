## Case Content

In this case, you will work with cloud infrastructure and cloud-based applications using Microsoft Azure.

You **must complete both available variants**. Each variant focuses on a different cloud implementation scenario and requires you to provision, configure, deploy, integrate, and demonstrate the required Azure services.

### Variant 1 — WSpeedrun.com on Azure Kubernetes Service

**WSpeedrun.com** is a web-based platform that provides leaderboard services for the speedrunning community, allowing users to submit, track, and compare their best times across various games.

As a Cloud Engineer, you are required to provision and deploy WSpeedrun.com on **Azure Kubernetes Service (AKS)** using **Terraform** for Infrastructure-as-Code, **Docker** for application containerization, **Azure Container Registry (ACR)** for container image storage, and **Kubernetes manifests** for application deployment.

The application consists of a **Frontend** and **Backend**, with **Azure Database for MySQL** used as the application database.

The database must not be publicly accessible. Database communication must use a **Private Endpoint** within the same Virtual Network as the AKS Cluster.

The application must be exposed externally through **Kubernetes Ingress**, which acts as the single entry point and provides path-based routing to the Frontend and Backend.

### Variant 2 — Serverless Application with Azure Functions

In this variant, you will develop and deploy a serverless application using **Azure Functions**.

You will select six endpoints from the provided source code and implement them using the **Go Azure Functions SDK** with **Azure Cosmos DB** as the database.

The selected endpoints must collectively demonstrate all CRUD operations:
- Create
- Read
- Update
- Delete

You will also integrate:
- **Azure Blob Storage** for image upload and retrieval.
- **Azure Key Vault** for securely storing and retrieving sensitive information.

Although the Azure Functions implementation uses Go, **Golang is not assessed as a separate proficiency**. The implementation is assessed under the Azure proficiency.

For both variants, you must provide complete documentation containing the implementation steps, configuration, testing results, screenshots, and explanations demonstrating that the required functionality has been successfully implemented.

---

## Tasks

### 1. Variant 1 — Provision Infrastructure with Terraform
Use **Terraform** to define and provision the required Azure resources.

Create a **Resource Group** using the naming format:
`[NIM]-rg`

Create a **Virtual Network** using the naming format:
`[NIM]-vnet`

The Virtual Network must contain at minimum:
- A subnet for Azure Kubernetes Service.
- A subnet for the database Private Endpoint.

Deploy an **AKS Cluster** using the naming format:
`[NIM]-aks`

Provision **Azure Database for MySQL** using the naming format:
`[NIM]-db`

The database must satisfy the following requirements:
- Public network access must be disabled.
- Database access must use a Private Endpoint.
- The Private Endpoint must be located within the same Virtual Network as the AKS Cluster.

Provide evidence that the infrastructure has been successfully provisioned.

### 2. Variant 1 — Containerize the Application
Create Dockerfiles for the provided WSpeedrun.com application.

The application must contain:
- Frontend Docker image.
- Backend Docker image.

Build both Docker images successfully.

Run both containers locally and verify that the applications are functioning correctly.

Provide evidence of:
- Successful Docker image builds.
- Running containers.
- Successful application access.

### 3. Variant 1 — Create Azure Container Registry
Create an **Azure Container Registry (ACR)** using the naming format:
`[NIM]acr`

Build and tag the Frontend and Backend Docker images.

Push both images to the ACR.

Provide evidence that:
- The ACR has been successfully created.
- The Frontend image exists in the registry.
- The Backend image exists in the registry.

### 4. Variant 1 — Deploy the Application on AKS
Use Kubernetes manifest files (`.yaml`) to deploy the application to the AKS Cluster.

Deploy both:
- Frontend.
- Backend.

The Frontend and Backend Services must use:
`ClusterIP`

Using a `LoadBalancer` Service to directly expose the Frontend or Backend is **not allowed**.

Use a Kubernetes **Secret** to store confidential information such as:
- Database connection strings.
- Database credentials.
- Other sensitive configuration.

Configure **Ingress** as the single external entry point.

The Ingress must provide **path-based routing** between the Frontend and Backend.

Demonstrate that:
- The AKS workloads are running.
- The Frontend and Backend Pods are running successfully.
- The Services are correctly configured.
- The Ingress is working.
- The application is accessible through the Ingress public IP.
- The Frontend is functioning correctly.
- A Backend API request returns a successful response.

### 5. Variant 2 — Deploy to Azure Functions
Select **6 endpoints** from the provided source code.

The selected endpoints must collectively cover:
- Create.
- Read.
- Update.
- Delete.

Implement the selected endpoints using the **Go Azure Functions SDK**.

Use **Azure Cosmos DB** as the database.

Configure the six endpoints with the following authorization levels:
- 2 Anonymous endpoints.
- 2 Function-level endpoints using Function Keys.
- 2 Admin-level endpoints using Host/Admin Keys.

Provision an **Azure Function App** and deploy the application.

Demonstrate that the endpoints can be accessed successfully according to their configured authorization levels.

### 6. Variant 2 — Integrate Azure Blob Storage
Integrate the Azure Function application with **Azure Blob Storage**.

#### Image Upload
Create the following endpoint:
`POST {BASE_URL}/image`

The endpoint must:
- Accept `multipart/form-data`.
- Use `image` as the request field.
- Store the uploaded image in an Azure Blob Storage container.
- Return an appropriate response indicating whether the upload was successful.

#### Image Retrieval
Create the following endpoint:
`GET {BASE_URL}/image/{filename}`

The endpoint must:
- Receive the filename as a request parameter.
- Retrieve the specified image from Azure Blob Storage.
- Return the image file.
- Return the appropriate `Content-Type`, such as `image/png` or `image/jpeg`.

Demonstrate both successful image upload and image retrieval.

### 7. Variant 2 — Integrate Azure Key Vault
Integrate the Azure Function application with **Azure Key Vault**.

Store sensitive information such as:
- API keys.
- Database connection strings.
- Storage connection strings.
- Tokens.
- Credentials.

Sensitive information must be stored as secrets in Azure Key Vault.

The Azure Function application must retrieve the required secrets from Azure Key Vault **at runtime**.

Sensitive values must not be:
- Hard-coded in source code.
- Committed to the repository.
- Exposed unnecessarily in application configuration.

Demonstrate that the application successfully retrieves and uses the required secrets.

### 8. Documentation
Create complete and detailed documentation for each of the variant.

For every major action, provide:
- Action Name.
- Tools/Method Used.
- File Location where applicable.
- Step-by-step implementation.
- Result screenshot.
- Description of the result.

For **Variant 1**, the documentation must cover:
1. Provision Infrastructure with Terraform.
2. Containerize the Application.
3. Create Azure Container Registry.
4. Deploy the Application on AKS.

For **Variant 2**, the documentation must cover:
1. Deploy to Azure Functions.
2. Integrate Azure Blob Storage.
3. Integrate Azure Key Vault.

Documentation must be as complete and detailed as possible. Provide screenshots for every major implementation step and sufficient evidence that the completed application is functioning correctly.

---

## Case Resources
- [WSpeedrun.zip](/internal/media/2acc2fb1-6766-43f3-9f72-21e41afc16b3/download) (173.0 KB)
- [Documentation Sheet Var 2.docx](/internal/media/2b249209-2407-413d-917b-459e83dffd79/download) (24.0 KB)
- [Documentation Sheet Var 1.docx](/internal/media/30e8878f-2ee7-47ed-bf91-f14db3a2591b/download) (24.3 KB)

---

## Grading Criteria & Your Scores

> Your case has been fully scored. Scores will appear once your corrector finalizes it.

### Infrastructure as Code
- **Criteria:** Full point: Terraform is correctly used to define and provision the required Azure infrastructure for Variant 1, including the Resource Group, Virtual Network, required subnets, AKS Cluster, and database networking configuration. Required naming conventions are correctly applied. Half point: Terraform is used, but some infrastructure resources, configurations, naming requirements, or networking requirements are incomplete or incorrectly implemented.
- **Category:** Teraform
- **Score:** Not scored · /20

### Application Containerization
- **Criteria:** Full point: The Frontend and Backend applications are correctly containerized using Dockerfiles. Both Docker images build successfully and both containers run correctly during local testing. Half point: Docker is used, but one or more Dockerfiles, images, builds, or local container tests are incomplete or incorrectly implemented.
- **Category:** Docker
- **Score:** Not scored · /15

### Kubernetes Application Deployment
- **Criteria:** Full point: The application is correctly deployed to AKS using Kubernetes manifests. Frontend and Backend Services use ClusterIP, confidential information is stored using Kubernetes Secret, and Ingress is configured as the single external entry point with path-based routing. The application is accessible through the Ingress public IP. Half point: Kubernetes deployment is partially implemented, but some manifests, Services, Secrets, Ingress configuration, routing, or deployment requirements are incomplete or incorrectly implemented.
- **Category:** Kubernetes
- **Score:** Not scored · /25

### Azure Cloud Services — Variant 1
- **Criteria:** Full point: The required Azure services are correctly provisioned, configured, and integrated, including AKS, Azure Database for MySQL, Private Endpoint, Azure Container Registry, Virtual Network, and the required external Ingress access. The database has public network access disabled and is accessed through the Private Endpoint. Half point: Azure services are provisioned, but some required resources, configurations, networking, security, or integration requirements are incomplete or incorrectly implemented.
- **Category:** Azure
- **Score:** Not scored · /20

### Azure Cloud Services — Variant 2
- **Criteria:** Full point: Azure Functions, Azure Cosmos DB, Azure Blob Storage, and Azure Key Vault are correctly provisioned, configured, and integrated. Six endpoints are implemented using the Go Azure Functions SDK and collectively cover Create, Read, Update, and Delete operations. The required authorization levels are correctly configured, image upload and retrieval work correctly, and sensitive information is securely retrieved from Azure Key Vault at runtime. Half point: Azure services are partially implemented, but some endpoints, CRUD operations, authorization levels, Blob Storage operations, Key Vault integration, or runtime secret retrieval are incomplete or incorrectly implemented.
- **Category:** Azure
- **Score:** Not scored · /20
