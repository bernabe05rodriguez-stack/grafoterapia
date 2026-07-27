FROM node:20-slim

WORKDIR /app
COPY package.json ./
RUN npm install --production && npm cache clean --force
COPY server.js ./
COPY index.html ./

EXPOSE 80
CMD ["node", "server.js"]
