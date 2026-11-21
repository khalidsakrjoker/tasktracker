FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev && npx prisma generate

COPY dist ./dist
COPY client/dist ./client/dist

RUN chown -R node:node /app

USER node

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3005/health || exit 1

CMD ["node", "dist/server.js"]
