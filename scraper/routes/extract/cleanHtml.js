import createDOMPurify from "dompurify";
import {JSDOM} from "jsdom";

export default (html) => {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  return removeStyles(DOMPurify.sanitize(html));
}

export const removeStyles = (html) => {
  return html?.replace(/<style([\S\s]*?)>([\S\s]*?)<\/style>/gim, '')?.replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gim, '');
}
