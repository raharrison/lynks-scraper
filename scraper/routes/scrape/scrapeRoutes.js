const fs = require("fs");
const scrapeUrl = require("./scrapeUrl");

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
  scrape
}
