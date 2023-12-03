import fs from "fs";
import request from "supertest";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import app from "../../app.js";
import {JPG, TEXT} from "../../routes/common/extensions.js";
import {PREVIEW, READABLE_TEXT, THUMBNAIL} from "../../routes/common/resourceTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Suggest endpoint validation', () => {

  it('should fail if no url present', async () => {
    const res = await request(app)
      .post('/api/suggest')
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Url is required");
  });

  it('should fail if url does not have correct protocol', async () => {
    const res = await request(app)
      .post('/api/suggest')
      .send({
        url: "ftp://something.com"
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Invalid url");
  });

});

describe('Suggest endpoint', () => {

  const url = "https://www.bbc.com/news/technology-57324917";
  const targetPath = `${__dirname}/resources-suggest`;

  afterAll(() => {
    fs.rmdirSync(targetPath, {
      recursive: true
    })
  });

  it('should generate suggestion resources and metadata', async () => {
    const res = await request(app)
      .post('/api/suggest')
      .send({
        url: url,
        targetPath: targetPath,
        resourceTypes: [PREVIEW, THUMBNAIL, READABLE_TEXT]
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("details");
    expect(res.body).toHaveProperty("resources");

    const details = res.body.details;
    expect(details.url).toEqual(url);
    expect(details.title).toEqual("East of England broadband boost for 1 million planned");
    expect(details.description).toBeTruthy();
    expect(details.author).toEqual("@BBCWorld");

    const generatedResources = res.body.resources;
    expect(generatedResources.length).toEqual(3);

    const thumb = generatedResources.find(i => i.resourceType === THUMBNAIL.toUpperCase());
    expect(thumb.resourceType).toEqual(THUMBNAIL.toUpperCase());
    expect(thumb.extension).toEqual(JPG);
    expect(fs.existsSync(thumb.targetPath)).toBeTruthy();

    const preview = generatedResources.find(i => i.resourceType === PREVIEW.toUpperCase());
    expect(preview.resourceType).toEqual(PREVIEW.toUpperCase());
    expect(preview.extension).toEqual(JPG);
    expect(fs.existsSync(preview.targetPath)).toBeTruthy();

    const readable = generatedResources.find(i => i.resourceType === READABLE_TEXT.toUpperCase());
    expect(readable.resourceType).toEqual(READABLE_TEXT.toUpperCase());
    expect(readable.extension).toEqual(TEXT);
    expect(fs.existsSync(readable.targetPath)).toBeTruthy();

  });

});
