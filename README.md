## Prerequisites
Docker / Docker Compose
Curl

## How to Build and Run
docker compose up --build

## How to Test
./test/smoke.sh

## Available API Endpoints 
curl http://localhost:3000/convert?lbs={insert parameter}
curl http://localhost:3000/stats
curl http://localhost:3000/health

# How to View Logs
docker compose logs

# How to Stop and Clean Application 
docker compose down -v 

## Design Decisions
