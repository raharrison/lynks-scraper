import fs from "fs";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import extractPreview from "../../routes/extract/extractPreview.js";
import {JPG} from "../../routes/common/extensions.js";
import {PREVIEW} from "../../routes/common/resourceTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Extract preview', () => {

  const targetPath = `${__dirname}/resources-preview`;

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

  it('should extract and save a given preview image', async () => {
    const sourceImage = fs.readFileSync(`${__dirname}/sample.png`);
    const thumbnail = await extractPreview(sourceImage, targetPath);

    expect(thumbnail.resourceType).toEqual(PREVIEW.toUpperCase());
    expect(thumbnail.extension).toEqual(JPG);
    expect(thumbnail.targetPath.length).toBeGreaterThan(0);

    expect(fs.existsSync(thumbnail.targetPath)).toBeTruthy();

  });
});
