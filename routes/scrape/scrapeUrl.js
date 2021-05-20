const path = require("path");
const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const {Readability} = require('@mozilla/readability');
const sharp = require("sharp");
const {SCREENSHOT, PREVIEW, THUMBNAIL, DOCUMENT, READABLE, PAGE} = require("./resourceTypes");
const {PNG, JPG, PDF, HTML} = require("./extensions");

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
  const rawPreview = await page.screenshot({
    encoding: 'binary',
    type: "jpeg",
    quality: 85,
    fullPage: false
  });
  const outputPath = path.join(targetPath, `${PREVIEW}.${JPG}`);
  console.log("Writing preview to: " + outputPath);
  await sharp(rawPreview)
    .resize(640, 360)
    .toFile(outputPath);
  return {
    resourceType: PREVIEW.toUpperCase(),
    targetPath: outputPath,
    extension: JPG
  };
}

const generateThumbnail = async (page, targetPath) => {
  const rawThumbnail = await page.screenshot({
    encoding: 'binary',
    type: "jpeg",
    quality: 85,
    fullPage: false
  });
  const outputPath = path.join(targetPath, `${THUMBNAIL}.${JPG}`);
  console.log("Writing thumbnail to: " + outputPath);
  await sharp(rawThumbnail)
    .resize(320, 180)
    .toFile(outputPath);
  return {
    resourceType: THUMBNAIL.toUpperCase(),
    targetPath: outputPath,
    extension: JPG
  };
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
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  const cleaned = DOMPurify.sanitize(dirty);

  const doc = new JSDOM(cleaned, {
    url: resolvedUrl
  });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  const outputPath = path.join(targetPath, `${READABLE}.${HTML}`);
  console.log("Writing readable to: " + outputPath);
  await fs.writeFile(outputPath, article.content);
  return {
    resourceType: READABLE.toUpperCase(),
    targetPath: outputPath,
    extension: HTML
  };
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
      generatedResources[THUMBNAIL] = await generatePreview(page, targetPath);
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
