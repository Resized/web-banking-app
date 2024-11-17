# Stage 1: Build the Vite React app
FROM node:lts-alpine AS builder
WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

# Stage 2: Serve the built files with an Express server
FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app/client/dist ./client/dist
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --only=production
COPY server ./server

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server/bin/www"]
