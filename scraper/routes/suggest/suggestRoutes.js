import fs from "fs";
import {parse} from "url";

import logger from "../common/logger.js";
import {suggestUrl} from "./suggestUrl.js";

const validateSuggestRequest = (request) => {
  const {url, targetPath} = request.body;
  if (!url || url.length === 0) {
    throw {message: "Url is required", status: 400};
  }
  if (targetPath) {
    fs.mkdirSync(targetPath, {
      recursive: true
    });
  }
  const pros = ['http:', 'https:'];
  const {
    protocol,
    host,
    hostname,
  } = parse(url);

  if (!host || !hostname || !pros.includes(protocol)) {
    throw {message: "Invalid url", status: 400};
  }
}

export const suggest = async (req, res) => {
  try {
    const start = new Date().getTime();
    validateSuggestRequest(req);
    const suggestion = await suggestUrl(req.body);
    const end = new Date().getTime();
    logger.info(`Successfully created suggestion in ${end - start}ms`)
    return res.status(200).json(suggestion);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({error: err.message || err});
  }
}
