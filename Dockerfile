FROM node:16 as build

ARG GA_API_KEY
ENV REACT_APP_GA_API_KEY=$GA_API_KEY

WORKDIR /app
COPY . .
RUN sh build.sh

FROM nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY ./vhost.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
