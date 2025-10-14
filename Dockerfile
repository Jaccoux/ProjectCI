# Phase de build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

# Phase de production
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY index.js .

EXPOSE 3000
CMD ["npm", "start"]