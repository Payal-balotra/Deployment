FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
ENV DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb"

EXPOSE 3000
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]