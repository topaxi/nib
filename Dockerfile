FROM node:10-alpine

ENV TZ=Europe/Zurich

RUN adduser -D nib
WORKDIR /home/nib

COPY bin/ ./bin/
COPY lib/ ./lib/
COPY plugins/ ./plugins/
COPY package.json package-lock.json* ./
COPY index.js ./

RUN chown -R nib:nib .
USER nib

RUN npm install

CMD ["./bin/nib.js"]
