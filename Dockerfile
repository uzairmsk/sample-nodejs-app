FROM node:22-alpine3.19

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ls
EXPOSE 3000
ENTRYPOINT ["node", "app.js"]
