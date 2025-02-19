FROM node:slim

RUN apt-get update -y \
  && apt-get install -y openssl

RUN npm i -g pnpm

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

COPY . .

RUN pnpm install --force --no-frozen-lockfile

CMD ["sh", "-c", "pnpm run db:deploy && pnpm run start:dev"]