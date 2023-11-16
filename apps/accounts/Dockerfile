FROM node:20-alpine as build

WORKDIR /app

COPY ./package.json package.json

RUN npm i

COPY ./src ./src

RUN npm run build

FROM node:20-alpine as runner

WORKDIR /app

COPY --from=build /app/node_modules/ node_modules/
COPY --from=build /app/package.json package.json
COPY --from=build /app/package-lock.json package-lock.json
COPY --from=build /app/dist dist

CMD ["npm", "run", "start"]
