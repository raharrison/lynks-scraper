const puppeteer = require("puppeteer");

async function takeScreenshot(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-gpu",
    ]
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });
  const screenData = await page.screenshot({encoding: 'binary', type: 'jpeg', quality: 85});

  await page.close();
  await browser.close();

  // Binary data of an image
  return screenData;
}

const screenshot = async (req, res, next) => {
  const {url} = req.query;
  if (!url || url.length === 0) {
    return res.status(400).json({error: 'url query parameter is required'});
  }

  try {
    const imageData = await takeScreenshot(url);
    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Length', imageData.length);
    res.send(imageData);
  } catch (e) {
    next(e);
    //return res.status(500).json({error: e.message});
  }
};

const welcome = async (req, res) => {
  res.status(200).json({message: 'Welcome to Lynks Scraper'});
};

module.exports = {
  welcome, screenshot
}
