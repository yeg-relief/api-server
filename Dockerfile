FROM node:9.8.0

COPY . /usr/api-server
WORKDIR /usr/api-server

RUN npm install
RUN npm install pm2 -g
RUN npm run prestart:prod

EXPOSE 3000

CMD ["pm2-runtime", "dist/server.js", "--name", "api-server"]
