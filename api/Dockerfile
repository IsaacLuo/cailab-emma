FROM node:14
WORKDIR /app
EXPOSE 8000
ADD ./package.json .
ADD ./yarn.lock* .
RUN yarn install
ADD . .
RUN yarn build
CMD ["yarn", "run production"]

