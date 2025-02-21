FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g --force pnpm@9
RUN pnpm install --frozen-lockfile

COPY . .
ENV NODE_OPTIONS="--max_old_space_size=2048"
RUN pnpm build:optimize

FROM node:20-alpine AS runner

WORKDIR /app

# We only need the `.output` directory, which contains everything the app needs to run
COPY --from=builder /app/.output .output
COPY --from=builder /app/package.json .

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
