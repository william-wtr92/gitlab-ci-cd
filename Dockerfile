FROM node:21.1.0-alpine AS builder

WORKDIR /app 

COPY package.json package-lock.json ./
RUN npm ci

COPY jsconfig.json ./
COPY public ./public
COPY src ./src
COPY data/emb-data ./data/emb-data
COPY data/modif-data ./data/modif-data

RUN npm run build && \
  npm prune --production


FROM node:21.1.0-slim

WORKDIR /app

RUN useradd -m core


COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/jsconfig.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/data/modif-data ./data/modif-data
COPY --from=builder /app/data/emb-data ./data/emb-data

RUN chown -R core:core /app
USER core

ENV PORT 3000
EXPOSE $PORT


ENTRYPOINT ["sh", "-c"]
CMD ["npm run dev"]
