const fs = require('fs');
const extractThumbnail = require("../../routes/extract/extractThumbnail");
const {JPG} = require("../../routes/common/extensions");
const {THUMBNAIL} = require("../../routes/common/resourceTypes");

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
