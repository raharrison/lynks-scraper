import fs from "fs";

import logger from "../common/logger.js";
import {scrapeUrl} from "./scrapeUrl.js";

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

export const scrape = async (req, res) => {
  try {
    const start = new Date().getTime();
    validateScrapeRequest(req);
    const resources = await scrapeUrl(req.body);
    const end = new Date().getTime();
    logger.info(`Successfully processed page in ${end - start}ms`)
    return res.status(200).json(resources);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({error: err.message || err});
  }
}
