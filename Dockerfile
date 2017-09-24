FROM node:alpine

RUN apk update && apk add git

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

CMD yarn start
