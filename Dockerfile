FROM node:15.7.0-alpine AS build
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

WORKDIR /usr/src/app/
RUN npm install

CMD [ "npx", "nodemon", "index.js" ]