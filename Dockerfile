#build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm
RUN npm ci --verbose

COPY . .

RUN npm run build && npm prune --production

#production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV production

COPY --from=build /app/package*.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/notifications/templates ./src/notifications/templates

EXPOSE 3000

CMD ["node", "dist/main.js"]