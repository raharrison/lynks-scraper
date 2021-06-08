FROM node:14-buster-slim

ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && apt-get autoremove \
    && apt-get autoclean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ADD package.json package-lock.json ./

RUN npm ci --production \
    && groupadd -r lynksuser && useradd -r -g lynksuser -G audio,video lynksuser \
    && mkdir -p /home/lynksuser/Downloads \
    && chown -R lynksuser:lynksuser /home/lynksuser \
    && chown -R lynksuser:lynksuser /app

USER lynksuser

COPY ./scraper/ ./scraper/

EXPOSE 3000

CMD ["npm", "start"]

# docker build -t raharrison/lynks-scraper .

# docker run -i -p 3000:3000 --init --rm --cap-add=SYS_ADMIN --name lynks-scraper raharrison/lynks-scraper
