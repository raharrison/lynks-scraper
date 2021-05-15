const puppeteer = require("puppeteer");
const {SCREENSHOT, DOCUMENT, PAGE} = require("./resourceTypes");

const generateScreenshot = async (page) => {
  return await page.screenshot({
    encoding: 'binary',
    type: 'jpeg',
    quality: 85,
    fullPage: true
  });
}

const generateDocument = async (page) => {
  return await page.pdf({
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
}

const generatePage = async (page) => {
  return await page.document.content()
}

const scrapeUrl = async (scrapeRequest) => {
  const {url, resourceTypes} = scrapeRequest;
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
      generatedResources[SCREENSHOT] = await generateScreenshot(page);
    }
    if (requestedTypes.has(DOCUMENT)) {
      generatedResources[DOCUMENT] = await generateDocument(page);
    }
    if (requestedTypes.has(PAGE)) {
      generatedResources[PAGE] = await generatePage(page);
    }
    return generatedResources;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeUrl;
