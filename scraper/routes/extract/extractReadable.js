import {promises as fs} from "fs";

import {HTML, TEXT} from "../common/extensions.js";
import cleanHtml from "./cleanHtml.js";
import {READABLE_DOC, READABLE_TEXT} from "../common/resourceTypes.js";
import generateResourcePath from "../common/generateResourcePath.js";
import logger from "../common/logger.js";
import {isProbablyReaderable, Readability} from "@mozilla/readability";
import {JSDOM} from "jsdom";

export const isReadableCompatible = (url, html) => {
  const cleaned = cleanHtml(html);
  const doc = new JSDOM(cleaned, {
    url: url
  });
  return isProbablyReaderable(doc.window.document);
};

export const extractReadable = async (url, html, targetPath, textContent) => {
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
