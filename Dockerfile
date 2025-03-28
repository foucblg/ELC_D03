FROM node:20-alpine
WORKDIR /rplace

COPY package*.json .
RUN npm install
COPY . .

EXPOSE 3000

CMD ["node", "back/server.js"]