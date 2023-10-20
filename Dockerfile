#build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

#production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV production

# RUN npm ci --production
RUN npm ci --only=production && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]