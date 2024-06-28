FROM node:22-alpine3.19
ENV MONGODB_URI=${MONGO_URI}
RUN echo $MONGODB_URI
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ls
EXPOSE 3000
ENTRYPOINT ["node", "app.js"]
