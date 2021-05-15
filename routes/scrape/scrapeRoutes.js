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
  const {url, resourceTypes} = request.body;
  if (!url || url.length === 0) {
    throw {message: "Url is required"}
  }
  if (!resourceTypes || resourceTypes.length === 0) {
    throw {message: "Resource types are required"}
  }
}

const scrape = async (req, res) => {
  try {
    validateScrapeRequest(req);
    await scrapeUrl(req);
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
}

module.exports = {
  welcome, screenshot, scrape
}
