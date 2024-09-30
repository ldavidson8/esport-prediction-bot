# Stage 1: Build
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Production
FROM node:20-slim AS production

# Set working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm install -g pnpm && pnpm install --prod

# Copy ecosystem.config.cjs for PM2
COPY ecosystem.config.cjs ./

# Expose the port the bot will run on
EXPOSE 3000

# Start the bot using PM2
CMD ["pm2-runtime", "ecosystem.config.cjs"]