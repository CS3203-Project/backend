

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

# Expose the service port
EXPOSE 3000

# Start the API
CMD ["npm", "start"]
