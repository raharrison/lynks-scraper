import {JSDOM} from "jsdom";
import {unescape} from "html-escaper";
import {removeStyles} from "./cleanHtml.js";

const descriptionAttrs = [
  'description',
  'og:description',
  'twitter:description',
];
const imageAttrs = [
  'og:image',
  'twitter:image',
  'twitter:image:src',
];
const authorAttrs = [
  'author',
  'creator',
  'og:creator',
  'og:article:author',
  'twitter:creator',
  'dc.creator',
];
const urlAttrs = [
  'og:url',
  'twitter:url',
];
const publishedTimeAttrs = [
  'article:published_time',
];
const keywordAttrs = [
  'keywords'
]

const strLower = (s) => {
  return s ? s.toLowerCase() : '';
};

const getTitle = function (document) {
  let title = unescape(findMetaTitle(document) || document.title);

  // replace all 3 types of line breaks with a space
  title = title.replace(/(\r\n|\n|\r)/gm, ' ');

  // replace all double white spaces with single spaces
  title = title.replace(/\s+/g, ' ');
  const original = title;

  for (let delimiter of [" | ", " - ", " :: ", " / "]) {
    if (title.includes(delimiter)) {
      const parts = title.split(delimiter);
      if (parts[0].split(" ").length >= 4) {
        title = parts[0];
        break;
      } else if (parts[parts.length - 1].split(" ").length >= 4) {
        title = parts[parts.length - 1];
        break;
      }
    }
  }
  if (title.length < 15) {
    return original;
  }
  return title;
}

const findMetaTitle = function (document) {
  const metaTags = document.getElementsByTagName('meta');
  for (const tag of metaTags) {
    if (strLower(tag.getAttribute('property')) === 'og:title' || strLower(tag.getAttribute('name')) === 'twitter:title') {
      return tag.getAttribute('content');
    }
  }
  return null;
}

export default (target, html) => {
  const dom = new JSDOM(removeStyles(html));

  const metadata = {
    url: '',
    title: '',
    description: null,
    image: null,
    author: null,
    published: null,
    keywords: []
  };

  const metaTags = dom.window.document.getElementsByTagName('meta');
  for (const tag of metaTags) {
    const tagContent = tag.getAttribute('content');
    const content = tagContent ? unescape(tagContent) : tagContent;
    const property = strLower(tag.getAttribute('property'));
    const name = strLower(tag.getAttribute('name'));

    if (urlAttrs.includes(property) || urlAttrs.includes(name)) {
      metadata.url = content;
    }
    if (descriptionAttrs.includes(property) || descriptionAttrs.includes(name)) {
      metadata.description = content;
    }
    if (imageAttrs.includes(property) || imageAttrs.includes(name)) {
      metadata.image = content;
    }
    if (authorAttrs.includes(property) || authorAttrs.includes(name)) {
      metadata.author = content;
    }
    if (publishedTimeAttrs.includes(property) || publishedTimeAttrs.includes(name)) {
      metadata.published = content;
    }
    if (keywordAttrs.includes(property) || keywordAttrs.includes(name)) {
      metadata.keywords = content ? content.split(",").map(e => e.trim()) : [];
    }
  }

  metadata.title = getTitle(dom.window.document);
  metadata.url = metadata.url || target;

  return metadata;
};
