FROM node:{{nodeJsVersion}}

WORKDIR /usr/src/app
COPY package*.json ./

CMD npm config set cache-min 9999999 && \
    npm install && \
    npm run start:dev