#build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm
RUN npm cache clean --force
RUN npm ci

COPY . .

RUN npm run build && npm prune --production

#production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV production

RUN npm install -g npm
RUN npm i -g typescript
RUN npm ci --only=production && npm cache clean --force

COPY --from=build /app/package*.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/notifications/templates ./src/notifications/templates

EXPOSE 3000

CMD ["node", "dist/main.js"]