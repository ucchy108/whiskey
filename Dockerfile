FROM node:f6908ff3eb35a5d0c8fc60086fd29ae16e3abdba

WORKDIR /app

COPY ./my-app/package.json /app/package.json

RUN npm install
