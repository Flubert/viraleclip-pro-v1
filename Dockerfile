# Créer le Dockerfile
Set-Content -Path "Dockerfile" -Value @"
FROM node:20-slim

RUN apt-get update && apt-get install -y \`
    python3 \`
    python3-pip \`
    ffmpeg \`
    curl \`
    && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \`
    && chmod a+x /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
"@

# Pousser sur GitHub
git add Dockerfile
git commit -m "Add Dockerfile for Render deployment"
git push# Render deployment

# Build date: 05/14/2026 19:56:05
