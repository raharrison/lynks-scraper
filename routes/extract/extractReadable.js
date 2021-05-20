const path = require("path");
const fs = require("fs").promises;
const {JSDOM} = require("jsdom");
const {Readability} = require("@mozilla/readability");
const createDOMPurify = require('dompurify');
const {READABLE} = require("../extract/resourceTypes");
const {HTML, TEXT} = require("../extract/extensions");

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
  const outputPath = path.join(targetPath, `${READABLE}.${extension}`);
  console.log("Writing readable to: " + outputPath);
  const content = textContent ? article.textContent.trim() : article.content;
  await fs.writeFile(outputPath, content);
  return {
    resourceType: READABLE.toUpperCase(),
    targetPath: outputPath,
    extension: extension
  };
}

