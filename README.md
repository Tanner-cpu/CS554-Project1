## Prerequisites
- Docker / Docker Compose
- Curl

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
The application locates Redis via a private container network that is handled away from the host. It locates Redis with environment variables, configuration files, and its given service name. It is not exposed to the host because it acts as an internal service within the application for security and isolation reasons (preventing data leaks or unauthorized access). The Redis volume is separate from the Redis container to assist with maintenance and enforce data persistence. A containerized design is a lighter weight solution in comaprison to a VM, which means we save resources, like memory and storage, with a containerized application. One limitation to having this application containerized rather than directly on a VM is that this solution offers less security, since the cotainers share the underlying host OS kernel. If this application was implemented on a VM, one major tradeoff would be setup time and portability. The setup time for containerized environments are minimal when compared to the setup time of a VM. An entire replication of a VM with the proper dependencies would be required to run this application if directly on a VM. Another trade off would be the automated process management that a containerized environment offers. A VM would require configuration of OS tools to provide proper restart policies or logging. 

## Service Restart Policy 
This Service Restart Policy tells Docker to reboot Node.js if the app crashes with a non-zero exit code with a limit of 5 attempts. This policy does not apply if an admin uses docker compose down or docker stop. One failure scenario is if the Redis container crashes, leaving the database completely inaccessible. The /stats API endpoint would fail with a 503 error. It would also result in not allowing the applied conversions to properly update the Redis counter. 

## Required Operational Demonstration 
1. Build The Application Image
   <img width="891" height="516" alt="Screenshot 2026-09-27 223738" src="https://github.com/user-attachments/assets/d595b300-bdbd-40e3-ac6d-8a693fd41e5a" />

3. 
