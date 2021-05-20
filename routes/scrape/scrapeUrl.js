const path = require("path");
const fs = require("fs").promises;
const puppeteer = require("puppeteer-extra");
const {retrieveImage} = require("../common/retrieve");
const {
  SCREENSHOT,
  PREVIEW,
  THUMBNAIL,
  DOCUMENT,
  READABLE_TEXT,
  READABLE_DOC,
  PAGE
} = require("../common/resourceTypes");
const {PNG, PDF, HTML} = require("../common/extensions");
const extractMetadata = require("../extract/extractMetadata");
const extractReadable = require("../extract/extractReadable");
const extractPreview = require("../extract/extractPreview");
const extractThumbnail = require("../extract/extractThumbnail");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const AdblockPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockPlugin({
  blockTrackers: true
}));

const generateScreenshot = async (page, targetPath) => {
  const outputPath = path.join(targetPath, `${SCREENSHOT}.${PNG}`);
  console.log("Writing screenshot to: " + outputPath);
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
  const outputPath = path.join(targetPath, `${DOCUMENT}.${PDF}`);
  console.log("Writing document to: " + outputPath);
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
  const outputPath = path.join(targetPath, `${PAGE}.${HTML}`);
  console.log("Writing page to: " + outputPath);
  await fs.writeFile(outputPath, html);
  return {
    resourceType: PAGE.toUpperCase(),
    targetPath: outputPath,
    extension: HTML
  };
}

const scrapeUrl = async (scrapeRequest) => {
  const {url, resourceTypes, targetPath} = scrapeRequest;
  console.log(`Scraping ${url} for types ${resourceTypes}`);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-gpu",
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 720});
    const response = await page.goto(url, {
      waitUntil: 'networkidle0'
    });
    const status = response.status();
    if (status === 403 || status === 404) {
      throw {message: "Unable to load url, got status code: " + status}
    }

    const requestedTypes = new Set(resourceTypes.map(e => e.toLowerCase()));
    const html = await page.content();
    const metadata = extractMetadata(url, html);

    const generatedResources = {};
    if (requestedTypes.has(SCREENSHOT)) {
      generatedResources[SCREENSHOT] = await generateScreenshot(page, targetPath);
    }
    if (requestedTypes.has(PREVIEW) || requestedTypes.has(THUMBNAIL)) {
      if (metadata.image) {
        const mainImage = await retrieveImage(metadata.image);
        generatedResources[PREVIEW] = await generatePreview(page, targetPath, mainImage);
        generatedResources[THUMBNAIL] = await generateThumbnail(page, targetPath, mainImage);
      } else {
        generatedResources[PREVIEW] = await generatePreview(page, targetPath);
        generatedResources[THUMBNAIL] = await generateThumbnail(page, targetPath);
      }
    }
    if (requestedTypes.has(DOCUMENT)) {
      generatedResources[DOCUMENT] = await generateDocument(page, targetPath);
    }
    if (requestedTypes.has(READABLE_TEXT)) {
      generatedResources[READABLE_TEXT] = await generateReadable(page, targetPath, html, READABLE_TEXT);
    }
    if (requestedTypes.has(READABLE_DOC)) {
      generatedResources[READABLE_DOC] = await generateReadable(page, targetPath, html, READABLE_DOC);
    }
    if (requestedTypes.has(PAGE)) {
      generatedResources[PAGE] = await generatePage(page, targetPath, html);
    }
    return generatedResources;
  } finally {
    try {
      await browser.close();
    } catch (err) {
      console.log("Unable to close browser: " + err);
    }
  }
}

module.exports = scrapeUrl;
