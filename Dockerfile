FROM geekykaran/headless-chrome-node-docker:latest

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm i

COPY . /app
RUN npm link

RUN google-chrome \
 --headless \
 --hide-scrollbars \
 --disable-gpu \
 --no-sandbox

ENTRYPOINT ["/usr/local/bin/siteaudit"]

