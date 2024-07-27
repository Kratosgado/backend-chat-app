FROM node:18-alpine AS development

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbackend
ENV JWTSECRET=lkdsjfllfjj29u40927497yq2hundhjofds98807458fdshg4875802efgdxgfg846d49v84dsg676

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate

###########################
# Build for production
###########################
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

COPY --from=development /app/node_modules ./node_modules

COPY . .

RUN yarn run build

RUN yarn install --frozen-lockfile --only=production && yarn cache clean --force

############################
# Production
###########################
FROM node:18-alpine AS production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD [ "node", "dist/main.js"]