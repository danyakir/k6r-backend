FROM registry.example.com/k6r/node-prisma:20 AS builder

USER root

ARG APP_VERSION

ENV APP_VERSION=${APP_VERSION}

LABEL app.version=${APP_VERSION}

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY tsconfig.json .

COPY prisma prisma

COPY src src

RUN npm run build

CMD ["npm", "run", "start"]
