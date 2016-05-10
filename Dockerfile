FROM node:4.4.2

ENV MOCK_NOTIFICATION_URL https://your-url.here
ENV MOCK_NOTIFICATION_USERNAME your-username
ENV MOCK_NOTIFICATION_PASSWORD your-password

RUN curl -fL https://github.com/krallin/tini/releases/download/v0.6.0/tini -o /tini \
    && chmod +x /tini
RUN npm install -g npm@3.8.5

WORKDIR /opt/actano/http-mock

ADD src /opt/actano/http-mock
ADD var /opt/actano/http-mock/var

RUN npm install

EXPOSE 8082
ENTRYPOINT ["/tini", "--", "npm", "run"]

CMD ["start"]
