FROM node:16-alpine as builder

ENV NODE_ENV build
ARG BACKEND_URL

USER node
WORKDIR /home/node

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

COPY --chown=node:node . .
RUN REACT_APP_BACKEND_URL=${BACKEND_URL} yarn build


FROM nginx:1-alpine
WORKDIR /usr/share/nginx/html
RUN sed -i '/^        index /a \\        try_files $uri /index.html;' /etc/nginx/conf.d/default.conf
ENV TZ=Asia/Omsk
RUN apk add --update tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    rm -rf /var/cache/apk/*
COPY --from=builder /home/node/build/ ./