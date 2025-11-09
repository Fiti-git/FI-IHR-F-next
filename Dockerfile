# ---- Build Stage ----
FROM node:18-slim AS builder
WORKDIR /app

# Copy dependency files first for better Docker caching
COPY package*.json ./

# Use npm ci for faster, deterministic installs (especially in CI/CD)
RUN npm ci

# Copy only what's needed for the build
COPY . .

# Build the Next.js app
RUN npm run build

# ---- Production Stage ----
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary files for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expose port 3000
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
