FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
COPY --from=builder ../client/dist ./dist
COPY --from=builder ../client/package.json ./
COPY --from=builder ../client/package-lock.json ./
COPY --from=builder ../app.js ./server.js
RUN npm install --production=false --silent
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/
USER node
CMD ["npm", "start"]
