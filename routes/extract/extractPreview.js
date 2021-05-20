const path = require("path");
const sharp = require("sharp");
const {PREVIEW} = require("./resourceTypes");
const {JPG} = require("./extensions");

module.exports = async (sourceImage, targetPath) => {
  const outputPath = path.join(targetPath, `${PREVIEW}.${JPG}`);
  console.log("Writing preview to: " + outputPath);
  await sharp(sourceImage)
    .resize(640, 360)
    .toFile(outputPath);
  return {
    resourceType: PREVIEW.toUpperCase(),
    targetPath: outputPath,
    extension: JPG
  };
}
