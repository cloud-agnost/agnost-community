# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app
COPY . /app

RUN npm install

RUN npm run build

# Stage 2: Final image
FROM nginx:mainline-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
