const fs = require('fs');
const extractPreview = require("../../routes/extract/extractPreview");
const {JPG} = require("../../routes/common/extensions");
const {PREVIEW} = require("../../routes/common/resourceTypes");

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
