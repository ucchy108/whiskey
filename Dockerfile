FROM node:23.8.0-bookworm

WORKDIR /app

COPY ./my-app/package.json /app/package.json

RUN npm install