FROM node

WORKDIR /api

ADD ./dist/build .

ENV NODE_ENV=production

RUN yarn install

EXPOSE 8080

CMD [ "node", "index.js" ]