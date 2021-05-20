const fs = require("fs");
const scrapeUrl = require("./scrapeUrl");

const screenshot = async (req, res) => {
  const {url} = req.query;
  if (!url || url.length === 0) {
    return res.status(400).json({error: 'url query parameter is required'});
  }

  try {
    const resources = await scrapeUrl({url, resourceTypes: ["SCREENSHOT"]});
    const imageData = resources["screenshot"];
    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Length', imageData.length);
    res.send(imageData);
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
};

const welcome = async (req, res) => {
  res.status(200).json({message: 'Welcome to Lynks Scraper'});
};

const validateScrapeRequest = (request) => {
  const {url, resourceTypes, targetPath} = request.body;
  if (!url || url.length === 0) {
    throw {message: "Url is required", status: 400};
  }
  if (!resourceTypes || resourceTypes.length === 0) {
    throw {message: "Resource types are required", status: 400};
  }
  if (!targetPath || targetPath.length === 0) {
    throw {message: "Target path is required", status: 400};
  }
  // verify target path directories are created
  fs.mkdirSync(targetPath, {
    recursive: true
  });
}

const scrape = async (req, res) => {
  try {
    const start = new Date().getTime();
    validateScrapeRequest(req);
    const resources = await scrapeUrl(req.body);
    const end = new Date().getTime();
    console.log(`Successfully processed page in ${end - start}ms`)
    return res.status(200).json(resources);
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({error: err.message || err});
  }
}

module.exports = {
  welcome, screenshot, scrape
}
