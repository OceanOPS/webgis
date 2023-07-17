FROM nginx:alpine

WORKDIR /

COPY . .

COPY ./nginx.conf /etc/nginx/nginx.conf