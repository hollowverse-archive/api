FROM node:9-alpine

RUN apk update -q && apk add git -q

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Set working directory to project root so
# all the following commands are run relative to
# it
WORKDIR /api
# Copy runtime secrets
COPY ./secrets/ ./secrets/

# Copy environment file, generated at build time by deploy.js
COPY ./env.json ./

# Install production dependencies
COPY package.json yarn.lock ./
RUN yarn --prod

COPY ./dist ./dist/

COPY ./schema.graphql ./
COPY ./firebaseExport.json ./

CMD yarn start
