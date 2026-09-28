## Prerequisites
Docker / Docker Compose
Curl

## How to Build and Run
docker compose up --build

## How to Test
./test/smoke.sh

## Available API Endpoints 
- curl http://localhost:3000/convert?lbs={parameter}
- curl http://localhost:3000/stats
- curl http://localhost:3000/health

## How to View Logs
docker compose logs

## How to Stop and Clean Application 
docker compose down -v 

## Design Decisions
The application locates Redis via a private container network that is handled away from the host. It locates Redis with environment variables, configuration files, and its given service name. It is not exposed to the host because it acts as an internal service within the application for security and isolation reasons (preventing data leaks or unauthorized access). The Redis volume is separate from the Redis container to assist with mainetence and enforce data persistence. A containerized design is a lighter weight solution in comaprison to a VM, which means we save resources, like memory and storage, with a containerized application. One limitation to having this application containerized rather than directly on a VM is that this solution offers less security, since the cotainers share the underlying host OS kernel. 

## Service Restart Policy 
