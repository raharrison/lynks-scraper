const path = require("path");
const sharp = require("sharp");
const {THUMBNAIL} = require("./resourceTypes");
const {JPG} = require("./extensions");

module.exports = async (sourceImage, targetPath) => {
  const outputPath = path.join(targetPath, `${THUMBNAIL}.${JPG}`);
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
