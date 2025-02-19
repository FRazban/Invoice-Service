# Invoice Service

This project is a NestJS-based Invoice Service that utilizes MongoDB and RabbitMQ. The application is containerized using Docker and orchestrated with Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Project Structure

invoice-service/ ├── src/ ├── test/ ├── node_modules/ ├── dist/ ├── .env ├── .gitignore ├── .prettierrc ├── docker-compose.yml ├── Dockerfile ├── package.json ├── README.md ├── tsconfig.build.json └── tsconfig.json


## Environment Variables

Ensure you have a `.env` file in the root of your project (`invoice-service/.env`) with the following content:

MONGODB_URI=mongodb://mongo:27017/invoice RABBITMQ_URI=amqp://guest:guest@rabbitmq

nginx
Copy
Edit


These variables configure the application to connect to the MongoDB and RabbitMQ services defined in the `docker-compose.yml` file.

## Docker Setup

### Dockerfile

The `Dockerfile` in the root directory defines how the Docker image for the NestJS application is built. Ensure it contains the following:

```dockerfile
# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "dist/main.js" ]

Docker Compose
The docker-compose.yml file defines the services required for the application, including the NestJS application (invoice-service), MongoDB, and RabbitMQ. Ensure it contains the following:

version: '3.8'
services:
  mongo:
    image: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  rabbitmq:
    image: rabbitmq:management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest

  invoice-service:
    build:
      context: .
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://mongo:27017/invoice
      RABBITMQ_URI: amqp://guest:guest@rabbitmq
    depends_on:
      - mongo
      - rabbitmq
    env_file:
      - .env

volumes:
  mongo_data:

Running the Application
To build and run the application along with its dependencies, execute the following command in the root directory (invoice-service/):

docker compose up -d


This command will:

Build the Docker image for the invoice-service using the Dockerfile.
Start the mongo and rabbitmq services.
Start the invoice-service container.
The -d flag runs the containers in detached mode.

Accessing the Application
Once all services are up and running:

The NestJS application will be accessible at http://localhost:3000.
The NestJS application with swagger will be accessible at http://localhost:3000/api-docs#/invoices.
The RabbitMQ management interface will be accessible at http://localhost:15672 with the default credentials (guest / guest).


Stopping the Application
To stop and remove all running containers defined in the docker-compose.yml, execute:

docker compose down


This command stops the services and removes the containers.

Troubleshooting
Dockerfile Not Found: Ensure the Dockerfile is present in the root directory (invoice-service/) and is not empty.
Context Path Issues: In the docker-compose.yml, ensure the build context is set correctly. It should be . to denote the current directory.
Environment File Not Found: Ensure the .env file is present in the root directory and contains the necessary environment variables.
For more detailed logs, you can view the logs of a specific service by running:

docker compose logs <service-name>

Replace <service-name> with invoice-service, mongo, or rabbitmq as needed.

By following these steps, you should be able to set up and run the Invoice Service along with its dependencies using Docker Compose.

This `README.md` file provides comprehensive instructions to set up and run your NestJS project using Docker Compose, including the necessary environment variables, Docker configurations, and troubleshooting tips.
::contentReference[oaicite:0]{index=0}