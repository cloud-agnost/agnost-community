FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY /src .
COPY /manifests /manifests

EXPOSE 3000

CMD ["npm", "-d", "start"]
