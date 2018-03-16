FROM node:9.8.0
RUN apt-get install git
COPY . /usr/api-server

WORKDIR /usr/api-server
RUN npm install
RUN npm install pm2 -g

EXPOSE 3000

CMD ["pm2-runtime", "index.js", "--name", "api-server"]
