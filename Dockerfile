# Using Node as opposed to a Hugo base image, thus making sure
# the Hugo version from the npm dependency (package.json)
# is being used
# Keep the container build on the same Node major as CI and local development.
FROM node:22-slim AS base-build

RUN apt-get update && \
    apt-get install --yes --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json /site/
COPY scripts/install-hugo.mjs /site/scripts/install-hugo.mjs

WORKDIR /site

RUN npm ci

COPY ./ /site

FROM base-build AS build-staging

RUN node_modules/.bin/hugo/hugo --environment staging

FROM base-build AS build-production

RUN node_modules/.bin/hugo/hugo --environment production

#Copy static files to Nginx
FROM nginx:stable-alpine

COPY --from=build-staging /site/public /usr/share/nginx/html-staging
COPY --from=build-production /site/public /usr/share/nginx/html-production

COPY /nginx/staging /usr/staging
COPY /nginx/production /usr/production

COPY /nginx/set-static-folder.sh /docker-entrypoint.d/99-set-static-folder.sh

WORKDIR /usr/share/nginx/html
