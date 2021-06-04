const sharp = require("sharp");
const generateResourcePath = require("../common/generateResourcePath");
const {THUMBNAIL} = require("../common/resourceTypes");
const {JPG} = require("../common/extensions");

module.exports = async (sourceImage, targetPath) => {
  const outputPath = generateResourcePath(targetPath, THUMBNAIL, JPG);
  console.log("Writing thumbnail to: " + outputPath);
  await sharp(sourceImage)
    .resize(320, 180)
    .toFile(outputPath);
  return {
    resourceType: THUMBNAIL.toUpperCase(),
    targetPath: outputPath,
    extension: JPG
  };
}
