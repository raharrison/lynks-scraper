const fs = require("fs").promises;
const puppeteer = require("puppeteer-extra");
const logger = require("../common/logger");
const {retrieveImage, IMAGE_SIZE_THRESHOLD} = require("../common/retrieve");
const {
  SCREENSHOT,
  PREVIEW,
  THUMBNAIL,
  DOCUMENT,
  READABLE_TEXT,
  READABLE_DOC,
  PAGE
} = require("../common/resourceTypes");
const generateResourcePath = require("../common/generateResourcePath");
const {PNG, PDF, HTML} = require("../common/extensions");
const {extractReadable, isReadableCompatible} = require("../extract/extractReadable");
const cleanHtml = require("../extract/cleanHtml");
const extractMetadata = require("../extract/extractMetadata");
const extractPreview = require("../extract/extractPreview");
const extractThumbnail = require("../extract/extractThumbnail");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const AdblockPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockPlugin({
  blockTrackers: true
}));

const generateScreenshot = async (page, targetPath) => {
  const outputPath = generateResourcePath(targetPath, SCREENSHOT, PNG);
  logger.info("Writing screenshot to: " + outputPath);
  await page.screenshot({
    path: outputPath,
    encoding: 'binary',
    type: PNG,
    fullPage: true
  });
  return {
    resourceType: SCREENSHOT.toUpperCase(),
    targetPath: outputPath,
    extension: PNG
  };
}

const generatePreview = async (page, targetPath, mainImage) => {
  const sourceImage = mainImage || await page.screenshot({
    encoding: 'binary',
    type: "jpeg",
    quality: 85,
    fullPage: false
  });
  return await extractPreview(sourceImage, targetPath);
}

const generateThumbnail = async (page, targetPath, mainImage) => {
  const sourceImage = mainImage || await page.screenshot({
    encoding: 'binary',
    type: "jpeg",
    quality: 85,
    fullPage: false
  });
  return await extractThumbnail(sourceImage, targetPath);
}

const generateDocument = async (page, targetPath) => {
  const outputPath = generateResourcePath(targetPath, DOCUMENT, PDF);
  logger.info("Writing document to: " + outputPath);
  await page.pdf({
    path: outputPath,
    landscape: true,
    printBackground: true,
    scale: 0.9,
    format: "A3",
    margin: {
      top: "0.1in",
      bottom: "0.1in",
      left: "0.1in",
      right: "0.1in"
    }
  });
  return {
    resourceType: DOCUMENT.toUpperCase(),
    targetPath: outputPath,
    extension: PDF
  };
}

const generateReadable = async (page, targetPath, html, type) => {
  const resolvedUrl = await page.url();
  return await extractReadable(resolvedUrl, html, targetPath, type === READABLE_TEXT);
}

const generatePage = async (page, targetPath, html) => {
  const cleaned = cleanHtml(html);
  const outputPath = generateResourcePath(targetPath, PAGE, HTML);
  logger.info("Writing page to: " + outputPath);
  await fs.writeFile(outputPath, cleaned);
  return {
    resourceType: PAGE.toUpperCase(),
    targetPath: outputPath,
    extension: HTML
  };
}

const scrapeUrl = async (scrapeRequest) => {
  const {url, resourceTypes, targetPath} = scrapeRequest;
  logger.info(`Scraping ${url} for types ${resourceTypes}`);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 720});
    logger.info("Navigating to url..");
    const response = await page.goto(url, {
      waitUntil: 'networkidle0'
    });
    const status = response.status();
    if (status === 403 || status === 404) {
      throw {message: "Unable to load url, got status code: " + status}
    }
    logger.info("Received response status code: " + status);

    const requestedTypes = new Set(resourceTypes.map(e => e.toLowerCase()));
    const html = await page.content();
    const metadata = extractMetadata(url, html);

    const generatedResources = [];
    if (requestedTypes.has(SCREENSHOT)) {
      generatedResources.push(await generateScreenshot(page, targetPath));
    }
    if (requestedTypes.has(PREVIEW) || requestedTypes.has(THUMBNAIL)) {
      if (metadata.image) {
        const mainImage = await retrieveImage(metadata.image);
        if (mainImage > IMAGE_SIZE_THRESHOLD) {
          generatedResources.push(await generatePreview(page, targetPath, mainImage));
          generatedResources.push(await generateThumbnail(page, targetPath, mainImage));
        } else {
          logger.info(`Main image size of ${mainImage.length} is below minimum threshold, falling back`);
          generatedResources.push(await generatePreview(page, targetPath));
          generatedResources.push(await generateThumbnail(page, targetPath));
        }
      } else {
        generatedResources.push(await generatePreview(page, targetPath));
        generatedResources.push(await generateThumbnail(page, targetPath));
      }
    }
    if (requestedTypes.has(DOCUMENT)) {
      generatedResources.push(await generateDocument(page, targetPath));
    }
    if (requestedTypes.has(PAGE)) {
      generatedResources.push(await generatePage(page, targetPath, html));
    }
    if (requestedTypes.has(READABLE_TEXT) || requestedTypes.has(READABLE_DOC)) {
      if (isReadableCompatible(url, html)) {
        if (requestedTypes.has(READABLE_TEXT)) {
          generatedResources.push(await generateReadable(page, targetPath, html, READABLE_TEXT));
        }
        if (requestedTypes.has(READABLE_DOC)) {
          generatedResources.push(await generateReadable(page, targetPath, html, READABLE_DOC));
        }
      } else {
        logger.warn("Url content is not readable compatible");
      }
    }
    return generatedResources;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        logger.error("Unable to close browser: " + err);
      }
    }
  }
}

module.exports = scrapeUrl;
