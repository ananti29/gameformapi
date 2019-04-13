FROM node:11-alpine
COPY . .
RUN npm install
EXPOSE 3001
CMD ["node", "./src/app.js"]