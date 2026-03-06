FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source
COPY . .

# Build the Next.js app
RUN npm run build

EXPOSE 3001

ENV PORT=3001

CMD ["npm", "start"]
