FROM markhobson/node-chrome:latest

WORKDIR /app

RUN npm install --global yarn
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn

COPY . /app
RUN yarn link

RUN google-chrome \
  --headless \
  --hide-scrollbars \
  --disable-gpu \
  --no-sandbox

ENTRYPOINT ["/usr/local/bin/siteaudit"]

