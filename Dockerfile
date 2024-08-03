# Development stage
FROM node:18-alpine AS development

ENV JWTSECRET=${JWTSECRET}
ENV DATABASE_URL=${DATABASE_URL}
ENV PORT=4000

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

RUN yarn install --frozen-lockfile --only=production && yarn cache clean --force

RUN yarn build

############################
# Production
############################
FROM node:18-alpine AS production

ENV NODE_ENV=production
ENV JWTSECRET=${JWTSECRET}
ENV DATABASE_URL=${DATABASE_URL}
ENV PORT=${PORT}

WORKDIR /app

# COPY package.json yarn.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE ${PORT}

CMD ["node", "dist/src/main"]
