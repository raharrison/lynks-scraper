const path = require("path");

module.exports = (targetPath, resourceType, extension) => {
  const now = new Date().getTime();
  const filename = `${resourceType}_${now}.${extension}`;
  return path.join(targetPath, filename);
}
