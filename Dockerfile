FROM node:17.5.0

#path to app in container
WORKDIR /usr/src/app

COPY .. .
RUN npm install

EXPOSE 5000

CMD ["npm", "start"]
