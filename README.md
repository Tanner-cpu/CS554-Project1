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
- docker compose down 
- docker compose down -v (remove volumes)

## Design Decisions
The application locates Redis via a private container network that is handled away from the host. It locates Redis with environment variables, configuration files, and its given service name. It is not exposed to the host because it acts as an internal service within the application for security and isolation reasons (preventing data leaks or unauthorized access). The Redis volume is separate from the Redis container to assist with maintenance and enforce data persistence. A containerized design is a lighter weight solution in comaprison to a VM, which means we save resources, like memory and storage, with a containerized application. One limitation to having this application containerized rather than directly on a VM is that this solution offers less security, since the cotainers share the underlying host OS kernel. If this application was implemented on a VM, one major tradeoff would be setup time and portability. The setup time for containerized environments are minimal when compared to the setup time of a VM. An entire replication of a VM with the proper dependencies would be required to run this application if directly on a VM. Another trade off would be the automated process management that a containerized environment offers. A VM would require configuration of OS tools to provide proper restart policies or logging. 

## Service Restart Policy 
This Service Restart Policy tells Docker to reboot Node.js if the app crashes with a non-zero exit code with a limit of 5 attempts. This policy does not apply if an admin uses docker compose down or docker stop. One failure scenario is if the Redis container crashes, leaving the database completely inaccessible. The /stats API endpoint would fail with a 503 error. It would also result in not allowing the applied conversions to properly update the Redis counter. 

## Required Operational Demonstration 
1. Build The Application Image
   <img width="891" height="516" alt="Screenshot 2026-09-27 223738" src="https://github.com/user-attachments/assets/d595b300-bdbd-40e3-ac6d-8a693fd41e5a" />

2. Start The Complete System With One Compose Command
   <img width="1228" height="885" alt="Screenshot 2026-09-27 223603" src="https://github.com/user-attachments/assets/c2813011-0393-4949-a660-59ada2c0821a" />

3. Verify The Application Health Endpoint
   <img width="808" height="55" alt="Screenshot 2026-09-27 224109" src="https://github.com/user-attachments/assets/33cef5a0-7a63-4610-92e8-17827b8b3b57" />

4. Perform At Least Two Successful Conversions
   <img width="810" height="104" alt="Screenshot 2026-09-27 224235" src="https://github.com/user-attachments/assets/52d98101-adf0-43d7-bb9d-50fee477bb4c" />

5. Verify /stats Reports The Expected Count
   <img width="806" height="54" alt="Screenshot 2026-09-27 224320" src="https://github.com/user-attachments/assets/ea1266cb-74ab-4763-bbc3-681d65b884ac" />

6. Inspect Application Logs
   <img width="1249" height="257" alt="Screenshot 2026-09-27 224408" src="https://github.com/user-attachments/assets/d1a7b4ac-a976-4dbc-8c65-52721bf81b02" />

7. Stop And Remove The Application Containers Without Deleting The Named Volume 
   <img width="822" height="113" alt="Screenshot 2026-09-27 224529" src="https://github.com/user-attachments/assets/ea29060d-5d6a-4880-877e-b5edb962bae6" />
   <img width="651" height="183" alt="Screenshot 2026-09-27 224701" src="https://github.com/user-attachments/assets/79c89c90-d2da-4102-bd6d-ae53275e7515" />

8. Recreate The System
   <img width="909" height="550" alt="Screenshot 2026-09-27 224803" src="https://github.com/user-attachments/assets/b391338b-25d0-4194-ba0d-be221ef88343" />

9. Verify /stats Still Reports The Previous Count
   <img width="791" height="50" alt="Screenshot 2026-09-27 224906" src="https://github.com/user-attachments/assets/178c34dc-6502-4751-a821-1bc26e8e4bcf" />

10. Cleanly Remove All Project Resources
   <img width="780" height="135" alt="Screenshot 2026-09-27 225021" src="https://github.com/user-attachments/assets/bf394f3d-0242-420d-9e1b-fe7dd4f1f7a0" />




