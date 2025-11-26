FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

ENV PORT=5001
ENV SQLITE_DATABASE=database.sqlite

EXPOSE 5001

CMD ["node", "src/server.js"]

