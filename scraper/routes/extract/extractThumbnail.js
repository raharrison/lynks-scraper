import sharp from "sharp";

import logger from "../common/logger.js";
import generateResourcePath from "../common/generateResourcePath.js";
import {THUMBNAIL} from "../common/resourceTypes.js";
import {JPG} from "../common/extensions.js";

export default async (sourceImage, targetPath) => {
  const outputPath = generateResourcePath(targetPath, THUMBNAIL, JPG);
  logger.info("Writing thumbnail to: " + outputPath);
  await sharp(sourceImage)
    .resize(160, 90)
    .toFile(outputPath);
  return {
    resourceType: THUMBNAIL.toUpperCase(),
    targetPath: outputPath,
    extension: JPG
  };
}
