import fs from "fs";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import extractMetadata from "../../routes/extract/extractMetadata.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Extract metadata', () => {

  const url = "https://ryanharrison.co.uk/2020/04/12/kotlin-java-ci-with-github-actions.html";

  it('should extract metadata from given page', async () => {
    const sourceHtml = fs.readFileSync(`${__dirname}/sample.html`);

    const metadata = extractMetadata(url, sourceHtml);

    expect(metadata.url).toEqual("https://ryanharrison.co.uk/2020/04/12/kotlin-java-ci-with-github-actions.html");
    expect(metadata.title).toEqual("Kotlin & Java CI with Github Actions");
    expect(metadata.description.startsWith("If you have a Kotlin/Java project of any reasonable size, you probably want some kind of CI")).toBeTruthy();
    expect(metadata.author).toEqual("Ryan Harrison");
    expect(metadata.published).toEqual("2020-04-12T00:00:00+01:00");
    expect(metadata.keywords).toHaveLength(7);
    expect(metadata.image).toEqual("/images/sample.png");
  });

});
