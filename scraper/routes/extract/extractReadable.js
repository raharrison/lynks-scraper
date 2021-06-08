const fs = require("fs").promises;
const {JSDOM} = require("jsdom");
const {Readability, isProbablyReaderable} = require("@mozilla/readability");
const logger = require("../common/logger");
const generateResourcePath = require("../common/generateResourcePath");
const {READABLE_TEXT, READABLE_DOC} = require("../common/resourceTypes");
const cleanHtml = require("./cleanHtml");
const {HTML, TEXT} = require("../common/extensions");

const isReadableCompatible = (url, html) => {
  const cleaned = cleanHtml(html);
  const doc = new JSDOM(cleaned, {
    url: url
  });
  return isProbablyReaderable(doc.window.document);
};

const extractReadable = async (url, html, targetPath, textContent) => {
  const cleaned = cleanHtml(html);
  const doc = new JSDOM(cleaned, {
    url: url
  });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  const extension = textContent ? TEXT : HTML
  const type = textContent ? READABLE_TEXT : READABLE_DOC;
  const outputPath = generateResourcePath(targetPath, type, extension);
  logger.info("Writing readable to: " + outputPath);
  const content = textContent ? article.textContent.trim() : article.content;
  await fs.writeFile(outputPath, content);
  return {
    resourceType: type.toUpperCase(),
    targetPath: outputPath,
    extension: extension
  };
}

module.exports = {isReadableCompatible, extractReadable}
