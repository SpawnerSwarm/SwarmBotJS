FROM node:carbon-slim
RUN apt-get -y update
RUN apt-get -y install git python make g++ linux-libc-dev mysql-client

ARG version="2.5.0"
ARG source="https://github.com/spawnerswarm/swarmbotjs"

LABEL version=${version}
LABEL name="SwarmBot"
LABEL maintainer="Sumner Rittby <sumner@crunchyintheory.com>"
LABEL source=${source}

ENV VERIONS=${version}
ENV SOURCE=${source}

#Needed environment vars at runtime: #!
#!ENV TOKEN
#!ENV HAVEN_BAZAAR
#!ENV MAROO_BAZAAR
#!ENV DEADLY_RUNNERS
ENV PREFIX "!"

#!ENV OWNER
ENV MYSQL_HOST "mysql.local"
ENV MYSQL_PORT 3306
ENV MYSQL_USER "swarmbot"
#!ENV MYSQL_PASSWORD
ENV MYSQL_DB "SWARM"

ENV LOG_LEVEL "DEBUG"
ENV WORLDSTATE_TIMEOUT "60000"
ENV SHARDS 1
ENV LOCAL_SHARDS 1
ENV SHARD_OFFSET 0
#ENV GM_URL ""

ENV USE_MAGNIFY 1
ENV MAGNIFY_URL "magnify.local"

#!ENV OCR_KEY
ENV SHOULD_PESTER 1

#!ENV GOOGLE_KEY
ENV SQL_CSV_REQUESTS "/etc/swarmbot/requests.sql"
ENV SQL_CSV_OUT "/tmp/swarmbot.csv"
#!ENV GOOGLE_URL

COPY dist /bin/swarmbot
COPY src/package.json /bin/swarmbot/package.json

WORKDIR /bin/swarmbot
RUN yarn install
RUN apt-get -y remove make g++
RUN apt-get -y autoremove

COPY etc /etc/swarmbot
ENTRYPOINT node main.js
