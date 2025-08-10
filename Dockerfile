FROM node:24-bookworm

RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./my-app/package.json /app/package.json

RUN npm install
