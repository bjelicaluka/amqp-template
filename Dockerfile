FROM node:12-alpine AS build

WORKDIR /app

COPY . .

RUN npm i

RUN npm run build

FROM node:12-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm ci --production

CMD [ "npm", "start" ]