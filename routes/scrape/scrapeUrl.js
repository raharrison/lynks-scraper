const path = require("path");
const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const {SCREENSHOT, PREVIEW, THUMBNAIL, DOCUMENT, READABLE, PAGE} = require("../extract/resourceTypes");
const {PNG, PDF, HTML} = require("../extract/extensions");
const extractReadable = require("../extract/extractReadable");
const extractPreview = require("../extract/extractPreview");
const extractThumbnail = require("../extract/extractThumbnail");

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

const generatePreview = async (page, targetPath) => {
  const sourceImage = await page.screenshot({
    encoding: 'binary',
    type: "jpeg",
    quality: 85,
    fullPage: false
  });
  return extractPreview(sourceImage, targetPath);
}

const generateThumbnail = async (page, targetPath) => {
  const sourceImage = await page.screenshot({
    encoding: 'binary',
    type: "jpeg",
    quality: 85,
    fullPage: false
  });
  return extractThumbnail(sourceImage, targetPath);
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

const generateReadable = async (page, targetPath) => {
  const dirty = await page.content();
  const resolvedUrl = await page.url();
  return extractReadable(resolvedUrl, dirty, targetPath);
}

const generatePage = async (page, targetPath) => {
  const html = await page.content();
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
    await page.goto(url, {
      waitUntil: 'networkidle0'
    });

    const requestedTypes = new Set(resourceTypes.map(e => e.toLowerCase()));

    const generatedResources = {};
    if (requestedTypes.has(SCREENSHOT)) {
      generatedResources[SCREENSHOT] = await generateScreenshot(page, targetPath);
    }
    if (requestedTypes.has(PREVIEW)) {
      generatedResources[PREVIEW] = await generatePreview(page, targetPath);
    }
    if (requestedTypes.has(THUMBNAIL)) {
      generatedResources[THUMBNAIL] = await generateThumbnail(page, targetPath);
    }
    if (requestedTypes.has(DOCUMENT)) {
      generatedResources[DOCUMENT] = await generateDocument(page, targetPath);
    }
    if (requestedTypes.has(READABLE)) {
      generatedResources[READABLE] = await generateReadable(page, targetPath);
    }
    if (requestedTypes.has(PAGE)) {
      generatedResources[PAGE] = await generatePage(page, targetPath);
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
