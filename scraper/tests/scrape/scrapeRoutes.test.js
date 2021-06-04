const fs = require("fs");
const request = require('supertest');
const app = require('../../app');
const {JPG, TEXT, PNG, PDF, HTML} = require("../../routes/common/extensions");
const {
  SCREENSHOT,
  PREVIEW,
  THUMBNAIL,
  DOCUMENT,
  PAGE,
  READABLE_TEXT,
  READABLE_DOC
} = require("../../routes/common/resourceTypes");

const url = "https://ryanharrison.co.uk/2020/04/12/kotlin-java-ci-with-github-actions.html";

jest.setTimeout(30000);

describe('Scrape endpoint validation', () => {

  it('should fail if no url present', async () => {
    const res = await request(app)
      .post('/api/scrape')
      .send({
        resourceTypes: [PREVIEW, THUMBNAIL],
        targetPath: this.targetPath
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Url is required");
  });

  it('should fail if no resource types present', async () => {
    const res = await request(app)
      .post('/api/scrape')
      .send({
        url: url,
        resourceTypes: [PREVIEW, THUMBNAIL]
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Target path is required");
  });

});

const verifyResource = (generatedResources, type, extension) => {
  const resource = generatedResources.find(i => i.resourceType === type.toUpperCase());
  expect(resource.resourceType).toEqual(type.toUpperCase());
  expect(resource.extension).toEqual(extension);
  expect(fs.existsSync(resource.targetPath)).toBeTruthy();
}

describe('Scrape endpoint', () => {

  const targetPath = `${__dirname}/resources-scrape`;

  afterAll(() => {
    fs.rmdirSync(targetPath, {
      recursive: true
    })
  });

  it('should generate scraped resources', async () => {
    const res = await request(app)
      .post('/api/scrape')
      .send({
        url: url,
        resourceTypes: [SCREENSHOT, PREVIEW, THUMBNAIL, DOCUMENT, PAGE, READABLE_TEXT, READABLE_DOC],
        targetPath: targetPath
      });

    expect(res.statusCode).toEqual(200);

    const generatedResources = res.body;
    expect(generatedResources.length).toEqual(7);

    verifyResource(generatedResources, SCREENSHOT, PNG);
    verifyResource(generatedResources, PREVIEW, JPG);
    verifyResource(generatedResources, THUMBNAIL, JPG);
    verifyResource(generatedResources, DOCUMENT, PDF);
    verifyResource(generatedResources, PAGE, HTML);
    verifyResource(generatedResources, READABLE_TEXT, TEXT);
    verifyResource(generatedResources, READABLE_DOC, HTML);

  });

});
