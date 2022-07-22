FROM node:16 AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install -g vite
RUN npm ci
COPY . ./
RUN npm run build

EXPOSE 5173
CMD ["npm", "start"]