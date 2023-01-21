const path = require("path");

module.exports = (targetPath, resourceType, extension) => {
  const filename = `${resourceType}.${extension}`;
  return path.join(targetPath, filename);
}
