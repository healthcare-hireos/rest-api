FROM node:14.15.1-alpine as development
WORKDIR /usr/src/app
COPY package*.json ./
RUN rm -rf node_modules
RUN npm install glob rimraf
RUN npm install
COPY . .
RUN npm run build

FROM node:14.15.1-alpine as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm cache clean --force
RUN npm install --only=production
COPY . .
COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "dist/main"]