FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN apk add --no-cache python3 make g++
RUN npm install --legacy-peer-deps --force
RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

# Comando por defecto para producción. Idealmente ejecutar migraciones antes.
CMD ["npm", "run", "start:prod"]
