FROM node:lts-alpine
ENV NODE_ENV=development
WORKDIR /usr/src
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
EXPOSE 5173
EXPOSE 9230
RUN chown -R node /usr/src
USER node
CMD ["npm", "run", "dev"]
