const {JSDOM} = require("jsdom");
const createDOMPurify = require('dompurify');

module.exports = (html) => {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  return DOMPurify.sanitize(html);
}
