FROM node:18

# Install FFmpeg
RUN apt-get update && \
apt-get install -y ffmpeg && \
apt-get clean

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Start your app
CMD ["node", "server.js"]
