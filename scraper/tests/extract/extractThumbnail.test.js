import fs from "fs";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import extractThumbnail from "../../routes/extract/extractThumbnail.js";
import {JPG} from "../../routes/common/extensions.js";
import {THUMBNAIL} from "../../routes/common/resourceTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Extract thumbnail', () => {

  const targetPath = `${__dirname}/resources-thumbnail`;

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

  it('should extract and save a given thumbnail', async () => {
    const sourceImage = fs.readFileSync(`${__dirname}/sample.png`);
    const thumbnail = await extractThumbnail(sourceImage, targetPath);

    expect(thumbnail.resourceType).toEqual(THUMBNAIL.toUpperCase());
    expect(thumbnail.extension).toEqual(JPG);
    expect(thumbnail.targetPath.length).toBeGreaterThan(0);

    expect(fs.existsSync(thumbnail.targetPath)).toBeTruthy();

  });
});
