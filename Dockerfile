# Use Node.js LTS as the base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build Next.js app
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

# Set environment to production
ENV NODE_ENV=production

# Expose Next.js default port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
