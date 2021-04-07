FROM node:12.10.0-alpine

WORKDIR /usr/src/app

ENV PORT=3000

RUN yarn global add dotenv-cli

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

EXPOSE $PORT

CMD [ "yarn", "start:prod" ]
