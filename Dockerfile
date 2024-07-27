FROM node:18-alpine AS development
WORKDIR /app


ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbackend
ENV JWTSECRET=lkdsjfllfjj29u40927497yq2hundhjofds98807458fdshg4875802efgdxgfg846d49v84dsg676

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile
# Install bcrypt dependencies and rebuild bcrypt
COPY . .

RUN yarn run gen


###########################
# Build for production
###########################
FROM node:18-alpine AS production

WORKDIR /app

COPY package.json yarn.lock ./

COPY --from=development /app/node_modules ./node_modules

COPY . .

RUN yarn install --frozen-lockfile --only-production && yarn cache clean --force

EXPOSE ${PORT}

CMD [ "node", "dist/main"]