FROM node:alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm ci
EXPOSE 7001
CMD ["npm","run","dev"]