import path from "path";

export default (targetPath, resourceType, extension) => {
  const filename = `${resourceType}.${extension}`;
  return path.join(targetPath, filename);
}
