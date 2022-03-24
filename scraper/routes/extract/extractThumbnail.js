const sharp = require("sharp");
const logger = require("../common/logger");
const generateResourcePath = require("../common/generateResourcePath");
const {THUMBNAIL} = require("../common/resourceTypes");
const {JPG} = require("../common/extensions");

module.exports = async (sourceImage, targetPath) => {
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
