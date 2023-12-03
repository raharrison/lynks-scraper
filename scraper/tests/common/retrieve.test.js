import {retrieveImage, retrievePage} from "../../routes/common/retrieve.js";

describe('Page Retrieval', () => {

  it('should successfully download page contents as HTML', async () => {
    const url = "https://ryanharrison.co.uk/2020/04/12/kotlin-java-ci-with-github-actions.html";
    const page = await retrievePage(url);
    expect(page.url).toEqual(url);
    expect(page.resUrl).toEqual(url);
    expect(page.html.length).toBeGreaterThan(0);
  });

  it('should fail with invalid url', async () => {
    try {
      await retrievePage("https://ryanharrison.co.uk/invalid");
      fail("Error was not thrown");
    } catch (e) {
      expect(e).toHaveProperty("message");
    }
  });

  it('should fail with invalid content type', async () => {
    try {
      await retrievePage("https://ryanharrison.co.uk/images/avatar.png");
      fail("Error was not thrown");
    } catch (e) {
      expect(e).toHaveProperty("message");
    }
  });

});

describe('Image Retrieval', () => {

  it('should successfully download image', async () => {
    const image = await retrieveImage("https://ryanharrison.co.uk/images/avatar.png");
    expect(image.toString().length).toBeGreaterThan(0);
  });

  it('should fail with invalid url', async () => {
    try {
      await retrieveImage("https://ryanharrison.co.uk/invalid");
      fail("Error was not thrown");
    } catch (e) {
      expect(e).toHaveProperty("message");
    }
  });

});
