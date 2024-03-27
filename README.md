# LexiClean: An Annotation Tool for Rapid Multi-Task Lexical Normalisation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- [![Read the Paper](https://img.shields.io/badge/Read_the_Paper-LexiClean-brightgreen.svg)](URL_TO_YOUR_PAPER) -->

LexiClean is a rapid annotation tool for acquiring parallel corpora for lexical normalisation built with the full-stack web-based framework MERN (MongoDB-Express-React-Node).

<!-- A live demonstration of the tool can be found at https://lexiclean.nlp-tlp.org and a systems demonstration video at X. -->

> Note: LexiClean version 1.0.0 was released in 2021 to accompany a paper published in EMNLP. The video of the original software can be found [here](https://youtu.be/P7_ooKrQPDU). The current version of LexiClean in this repository is 2.0.0 and represents a substantial deviation from the original with a new demonstration video planned.

## Features

- **Elevate & Protect Your Data**: Boost your data’s quality and safeguard privacy with LexiClean. Our tool combines advanced normalisation and tagging capabilities to refine your text data meticulously, ensuring precision and protection effortlessly.
- **Collaboration Meets Innovation**: Embrace collaborative intelligence with LexiClean. Our platform empowers you to join forces with peers, enhancing data accuracy and unveiling deep insights, all within a shared, innovative workspace.
- **Empowering the Future, Openly**: Commitment to open-source is at our core. LexiClean invites you to refine text quality and protect sensitive data with full confidence, leveraging our transparent, community-driven solutions in your own environment.
- **Machine Learning Ready**: Streamline your annotation tasks with LexiClean’s OpenAI integration. Access annotated datasets effortlessly, readying your machine learning models for the future, faster and more efficiently.

## Built With

- React - The web framework used
- Node.js - Server Environment
- MongoDB - Database
- Docker - Containerization

## Getting Started

This application is containerised using Docker, making it straightforward to set up and run on any system with Docker and Docker Compose installed. Follow the steps below to get your application up and running.

### Cloning the Project

First, clone the LexiClean repository and navigate into its root directory:

```bash
# Clone the repository
git clone https://github.com/<FINAL_REPO_NAME_HERE>

# Navigate to the project directory
cd lexiclean
```

### Prerequisites

- Docker: Ensure you have Docker installed on your system. You can download it from [Docker's official website](https://docs.docker.com/get-docker/).
- Docker Compose: Ensure Docker Compose is installed. It typically comes with the Docker Desktop installation.

### Setting Up Environmental Variables

Before running LexiClean, you must configure the required environment variables for the backend and client. These variables are essential for configuring the application services and ensuring secure and proper operation.

#### Backend

Create a `.env` file in the root directory of `./backend` and populate it with the necessary environment variables. Here is an example `.env` file:

```makefile
DB_URI = mongodb://localhost:27017/lexiclean

# Optional Auth0 configuration
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_AUDIENCE=
AUTH0_SECRET=
AUTH0_MGMT_CLIENT_ID=
AUTH0_MGMT_SECRET=

# Authentication strategy
AUTH_STRATEGY=DUMMY
```

Refer to the [Deployment section](#deployment) for advanced environment variable configurations, including those supporting the Auth0 authentication strategy.

#### Client

Create a `.env` file in the root directory of `./client` and populate it with the required environment variables. For example:

```makefile
REACT_APP_AUTH_STRATEGY=DUMMY
REACT_APP_API_URL=http://localhost:3001

# Optional Auth0 configuration
REACT_APP_AUTH0_DOMAIN=
REACT_APP_AUTH0_CLIENT_ID=
REACT_APP_AUTH0_AUDIENCE=

REACT_APP_DOCS_URL=http://localhost:4000

```

For advanced environment variables, including those supporting Auth0 authentication, see [Deployment](#deployment).

### Running LexiClean

With Docker and Docker Compose installed and the environment variables configured, you can now run LexiClean using the following command:

```bash
docker-compose up --build
```

This command builds the images for the application (if they are not already built) and starts the containers defined in your `docker-compose.yml` file. The `--build` option ensures that Docker builds the images before starting the containers, which is useful when you have made changes to your Dockerfile or application code.

Once the containers are up and running, you can access the application as follows:

- **Frontend:** Open your web browser and navigate to `http://localhost:3000`.
- **Backend/API:** The backend API is accessible at `http://localhost:3001`.
- **Documentation Site**: Open your web browser and navigate to `http://localhost:4000`.

To stop the application and remove the containers, use the following command:

```bash
docker-compose down
```

For further details on Docker, including its commands, please refer to the [Docker documentation](https://docs.docker.com/).

## Documentation

Detailed documentation about LexiClean can be accessed at http://localhost:4000 when you have the application running, or by visiting [here](). LexiClean uses [Docasaurus]() as a static documentation site.
