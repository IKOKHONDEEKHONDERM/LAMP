
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install express pg body-parser cors

COPY index.html server.js ./

EXPOSE 3000


CMD ["node", "server.js"]
