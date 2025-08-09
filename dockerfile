FROM node:18-alpine

# App directory
WORKDIR /app


# Install dependencies first (better cache use)
COPY package*.json ./
RUN npm install         

# Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Rest of the source
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# Transpile TypeScript to JavaScript
RUN npx tsc

# Expose the service port
EXPOSE 3000

# Run the transpiled JavaScript file
CMD ["node", "dist/index.js"]
