#build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

#production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]