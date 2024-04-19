FROM node:18.20.2-alpine3.18

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY /src .
COPY /manifests /manifests
COPY /templates /templates

EXPOSE 3000

CMD ["npm", "-d", "start"]
