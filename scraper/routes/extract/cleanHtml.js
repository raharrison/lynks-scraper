import createDOMPurify from "dompurify";
import {JSDOM} from "jsdom";

export default (html) => {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  return DOMPurify.sanitize(html);
}
