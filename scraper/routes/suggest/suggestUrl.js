const {retrievePage, retrieveImage} = require("../common/retrieve");
const {PREVIEW, THUMBNAIL, READABLE_TEXT} = require("../common/resourceTypes");
const {extractReadable, isReadableCompatible} = require("../extract/extractReadable");
const extractMetadata = require("../extract/extractMetadata");
const extractPreview = require("../extract/extractPreview");
const extractThumbnail = require("../extract/extractThumbnail");

const suggestUrl = async (suggestRequest) => {
  const {url, resourceTypes, targetPath} = suggestRequest;
  console.log(`Generating suggestion for ${url} with types ${resourceTypes}`);

  const retrievedUrl = await retrievePage(url);
  const metadata = extractMetadata(retrievedUrl.resUrl, retrievedUrl.html);

  const requestedTypes = resourceTypes ? new Set(resourceTypes.map(e => e.toLowerCase())) : [];

  const generatedResources = [];
  if (requestedTypes.has(PREVIEW) || requestedTypes.has(THUMBNAIL)) {
    if (metadata.image) {
      const sourceImage = await retrieveImage(metadata.image);
      generatedResources.push(await extractPreview(sourceImage, targetPath));
      generatedResources.push(await extractThumbnail(sourceImage, targetPath));
    }
  }
  if (requestedTypes.has(READABLE_TEXT)) {
    if (isReadableCompatible(url, retrievedUrl.html)) {
      generatedResources.push(await extractReadable(url, retrievedUrl.html, targetPath, true));
    } else {
      console.log("Url content is not readable compatible");
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
