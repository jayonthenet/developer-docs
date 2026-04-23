# Using Node as opposed to a Hugo base image, thus making sure
# the Hugo version from the npm dependency (package.json)
# is being used
# FYI: node:slim is not sufficient due to missing SSL certs required for integrating external content
FROM node AS base-build

COPY package.json package-lock.json /site/

WORKDIR /site

RUN npm ci

COPY ./ /site

FROM base-build AS build-staging

RUN node_modules/.bin/hugo/hugo --environment staging

FROM base-build AS build-production

RUN node_modules/.bin/hugo/hugo --environment production

#Copy static files to Nginx
FROM nginx:alpine

COPY --from=build-staging /site/public /usr/share/nginx/html-staging
COPY --from=build-production /site/public /usr/share/nginx/html-production

COPY /nginx/staging /usr/staging
COPY /nginx/production /usr/production

COPY /nginx/set-static-folder.sh /docker-entrypoint.d/99-set-static-folder.sh

WORKDIR /usr/share/nginx/html
