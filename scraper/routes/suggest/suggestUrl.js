const logger = require("../common/logger");
const {retrievePage, retrieveImage, IMAGE_SIZE_THRESHOLD} = require("../common/retrieve");
const {PREVIEW, THUMBNAIL, READABLE_TEXT} = require("../common/resourceTypes");
const {extractReadable, isReadableCompatible} = require("../extract/extractReadable");
const extractMetadata = require("../extract/extractMetadata");
const extractPreview = require("../extract/extractPreview");
const extractThumbnail = require("../extract/extractThumbnail");

const suggestUrl = async (suggestRequest) => {
  const {url, resourceTypes, targetPath} = suggestRequest;
  logger.info(`Generating suggestion for ${url} with types ${resourceTypes}`);

  const retrievedUrl = await retrievePage(url);
  const metadata = extractMetadata(retrievedUrl.resUrl, retrievedUrl.html);

  const requestedTypes = resourceTypes ? new Set(resourceTypes.map(e => e.toLowerCase())) : [];

  const generatedResources = [];
  if (requestedTypes.has(PREVIEW) || requestedTypes.has(THUMBNAIL)) {
    if (metadata.image) {
      const sourceImage = await retrieveImage(metadata.image);
      if (sourceImage.length > IMAGE_SIZE_THRESHOLD) {
        generatedResources.push(await extractThumbnail(sourceImage, targetPath));
        generatedResources.push(await extractPreview(sourceImage, targetPath));
      } else {
        logger.info(`Main image size of ${sourceImage.length} is below minimum threshold, not creating resources`);
      }
    }
  }
  if (requestedTypes.has(READABLE_TEXT)) {
    if (isReadableCompatible(url, retrievedUrl.html)) {
      generatedResources.push(await extractReadable(url, retrievedUrl.html, targetPath, true));
    } else {
      logger.warn("Url content is not readable compatible");
    }
  }

  return {
    details: {
      url: metadata.url,
      title: metadata.title,
      keywords: metadata.keywords,
      description: metadata.description,
      image: metadata.image,
      author: metadata.author,
      published: metadata.published
    },
    resources: generatedResources
  };
};

module.exports = {suggestUrl};
