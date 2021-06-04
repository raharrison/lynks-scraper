const retrieve = require("../../routes/common/retrieve");

describe('Page Retrieval', () => {

  it('should successfully download page contents as HTML', async () => {
    const url = "https://ryanharrison.co.uk/2020/04/12/kotlin-java-ci-with-github-actions.html";
    const page = await retrieve.retrievePage(url);
    expect(page.url).toEqual(url);
    expect(page.resUrl).toEqual(url);
    expect(page.html.length).toBeGreaterThan(0);
  });

  it('should fail with invalid url', async () => {
    try {
      await retrieve.retrievePage("https://ryanharrison.co.uk/invalid");
      fail("Error was not thrown");
    } catch (e) {
      expect(e).toHaveProperty("message");
    }
  });

  it('should fail with invalid content type', async () => {
    try {
      await retrieve.retrievePage("https://ryanharrison.co.uk/images/avatar.png");
      fail("Error was not thrown");
    } catch (e) {
      expect(e).toHaveProperty("message");
    }
  });

});

describe('Image Retrieval', () => {

  it('should successfully download image', async () => {
    const image = await retrieve.retrieveImage("https://ryanharrison.co.uk/images/avatar.png");
    expect(image.toString().length).toBeGreaterThan(0);
  });

  it('should fail with invalid url', async () => {
    try {
      await retrieve.retrieveImage("https://ryanharrison.co.uk/invalid");
      fail("Error was not thrown");
    } catch (e) {
      expect(e).toHaveProperty("message");
    }
  });

});
