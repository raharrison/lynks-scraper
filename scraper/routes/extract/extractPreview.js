import sharp from "sharp";

import logger from "../common/logger.js";
import generateResourcePath from "../common/generateResourcePath.js";
import {PREVIEW} from "../common/resourceTypes.js";
import {JPG} from "../common/extensions.js";

export default async (sourceImage, targetPath) => {
  const outputPath = generateResourcePath(targetPath, PREVIEW, JPG);
  logger.info("Writing preview to: " + outputPath);
  await sharp(sourceImage)
    .resize(640, 360)
    .toFile(outputPath);
  return {
    resourceType: PREVIEW.toUpperCase(),
    targetPath: outputPath,
    extension: JPG
  };
}
