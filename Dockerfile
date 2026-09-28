FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
FROM node:20-alpine
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /usr/apps/my-application
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/package.json ./package.json
USER node
EXPOSE ${PORT}
CMD ["node", "src/server.js"]