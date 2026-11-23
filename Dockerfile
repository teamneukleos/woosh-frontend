# Woosh web (Next.js BFF) — production image for ECS Fargate.
#
# NEXT_PUBLIC_* values are inlined at build time, and Next embeds the Server
# Actions key in the build output, so all three must be supplied here:
#   docker build \
#     --build-arg NEXT_PUBLIC_APP_URL=https://app.example.com \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api \
#     --secret id=server_actions_key,src=./server-actions-key \
#     -t woosh-web .

FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN --mount=type=secret,id=server_actions_key,required=true \
  NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/server_actions_key)" \
  npm run build

FROM node:20-bookworm-slim
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
# Full tree (incl. tsx) so the production config gate runs before `next start`.
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/tsx scripts/check-production-config.ts && exec node_modules/.bin/next start"]
