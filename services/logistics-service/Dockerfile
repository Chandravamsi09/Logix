FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
COPY packages/common ./packages/common
COPY services/logistics-service ./services/logistics-service
RUN npm ci
RUN npm run build:common
RUN npm run --workspace=services/logistics-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/services/logistics-service/dist ./services/logistics-service/dist
COPY --from=builder /app/services/logistics-service/package.json ./services/logistics-service/package.json
RUN npm ci --omit=dev
EXPOSE 4004
CMD ["node", "services/logistics-service/dist/server.js"]
