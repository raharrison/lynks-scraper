import fs from "fs";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {extractReadable, isReadableCompatible} from "../../routes/extract/extractReadable.js";
import {HTML, TEXT} from "../../routes/common/extensions.js";
import {READABLE_DOC, READABLE_TEXT} from "../../routes/common/resourceTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Extract readable', () => {

  const url = "https://ryanharrison.co.uk/2020/04/12/kotlin-java-ci-with-github-actions.html";
  const targetPath = `${__dirname}resources-readable`;

  beforeAll(() => {
    fs.mkdirSync(targetPath, {
      recursive: true
    });
  });

  afterAll(() => {
    fs.rmdirSync(targetPath, {
      recursive: true
    })
  });

  it('should extract readable doc', async () => {
    const sourceHtml = fs.readFileSync(`${__dirname}/sample.html`);
    const readable = await extractReadable(url, sourceHtml, targetPath, false);

    expect(readable.resourceType).toEqual(READABLE_DOC.toUpperCase());
    expect(readable.extension).toEqual(HTML);
    expect(readable.targetPath.length).toBeGreaterThan(0);

    expect(fs.existsSync(readable.targetPath)).toBeTruthy();
  });

  it('should extract readable text', async () => {
    const sourceHtml = fs.readFileSync(`${__dirname}/sample.html`);
    const readable = await extractReadable(url, sourceHtml, targetPath, true);

    expect(readable.resourceType).toEqual(READABLE_TEXT.toUpperCase());
    expect(readable.extension).toEqual(TEXT);
    expect(readable.targetPath.length).toBeGreaterThan(0);

    expect(fs.existsSync(readable.targetPath)).toBeTruthy();
  });

  it("should determine if content is readable", () => {
    const sourceHtml = fs.readFileSync(`${__dirname}/sample.html`);
    expect(isReadableCompatible(url, sourceHtml)).toBeTruthy();

    expect(isReadableCompatible(url, `<div>content</div>`)).toBeFalsy();
  });

});
