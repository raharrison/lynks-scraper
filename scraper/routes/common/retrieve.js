const logger = require("./logger");
const fetch = require('node-fetch');

const retrievePage = async (url) => {
  const res = await fetch(url, {
    timeout: 30 * 1000,
    redirect: 'follow',
    compress: true,
    agent: false,
  });
  if (!res.ok) {
    throw {message: `Got ${res.status} error code from "${url}"`};
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType || !contentType.startsWith('text/')) {
    throw {message: `Got invalid content-type (${contentType}) from "${url}"`};
  }

  logger.info(`Loaded remote HTML content from "${url}"`);
  const html = await res.text();
  const resUrl = res.url;

  return {
    url,
    resUrl,
    html,
  };
};

const retrieveImage = async (url) => {
  const res = await fetch(url, {
    timeout: 30 * 1000,
    redirect: 'follow',
    compress: true,
    agent: false,
  });
  if (!res.ok) {
    throw {message: `Got ${res.status} error code from "${url}"`};
  }
  logger.info(`Loaded remote image content from "${url}"`);
  return await res.buffer();
};

module.exports = {retrievePage, retrieveImage};
