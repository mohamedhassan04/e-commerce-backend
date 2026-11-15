FROM node:26.12.1-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:26.12.1-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=8080 \
    UPLOADS_DIR=/app/uploads

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force \
    && mkdir -p /app/uploads \
    && chown -R node:node /app

COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 0555 /usr/local/bin/entrypoint.sh

USER node
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/main.js"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8080)).then(() => process.exit(0)).catch(() => process.exit(1))"
