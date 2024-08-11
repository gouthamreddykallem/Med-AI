# // frontend/Dockerfile
FROM node:21
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

ENV NEXT_PUBLIC_API_URL=http://backend:8000