const path = require("path");
const fs = require("fs").promises;
const {JSDOM} = require("jsdom");
const {Readability} = require("@mozilla/readability");
const createDOMPurify = require('dompurify');
const {READABLE_TEXT, READABLE_DOC} = require("../common/resourceTypes");
const {HTML, TEXT} = require("../common/extensions");

module.exports = async (url, html, targetPath, textContent) => {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  const cleaned = DOMPurify.sanitize(html);

  const doc = new JSDOM(cleaned, {
    url: url
  });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  const extension = textContent ? TEXT : HTML
  const type = textContent ? READABLE_TEXT : READABLE_DOC;
  const outputPath = path.join(targetPath, `${type}.${extension}`);
  console.log("Writing readable to: " + outputPath);
  const content = textContent ? article.textContent.trim() : article.content;
  await fs.writeFile(outputPath, content);
  return {
    resourceType: type.toUpperCase(),
    targetPath: outputPath,
    extension: extension
  };
}

