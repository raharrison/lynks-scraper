const {retrievePage, retrieveImage} = require("../common/retrieve");
const {PREVIEW, THUMBNAIL, READABLE_TEXT} = require("../common/resourceTypes");
const extractMetadata = require("../extract/extractMetadata");
const extractReadable = require("../extract/extractReadable");
const extractPreview = require("../extract/extractPreview");
const extractThumbnail = require("../extract/extractThumbnail");

const suggestUrl = async (suggestRequest) => {
  const {url, resourceTypes, targetPath} = suggestRequest;

  const retrievedUrl = await retrievePage(url);
  const metadata = extractMetadata(retrievedUrl.resUrl, retrievedUrl.html);

  const requestedTypes = resourceTypes ? new Set(resourceTypes.map(e => e.toLowerCase())) : [];

  const generatedResources = {};
  if (requestedTypes.has(PREVIEW) || requestedTypes.has(THUMBNAIL)) {
    if (metadata.image) {
      const sourceImage = await retrieveImage(metadata.image);
      generatedResources[PREVIEW] = await extractPreview(sourceImage, targetPath);
      generatedResources[THUMBNAIL] = await extractThumbnail(sourceImage, targetPath);
    }
  }
  if (requestedTypes.has(READABLE_TEXT)) {
    generatedResources[READABLE_TEXT] = await extractReadable(url, retrievedUrl.html, targetPath, true);
  }

  return {
    url: metadata.url,
    title: metadata.title,
    keywords: metadata.keywords,
    description: metadata.description,
    image: metadata.image,
    author: metadata.author,
    published: metadata.published,
    resources: generatedResources
  };
};

module.exports = {suggestUrl};
