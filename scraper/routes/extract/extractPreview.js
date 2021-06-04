const sharp = require("sharp");
const generateResourcePath = require("../common/generateResourcePath");
const {PREVIEW} = require("../common/resourceTypes");
const {JPG} = require("../common/extensions");

module.exports = async (sourceImage, targetPath) => {
  const outputPath = generateResourcePath(targetPath, PREVIEW, JPG);
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
