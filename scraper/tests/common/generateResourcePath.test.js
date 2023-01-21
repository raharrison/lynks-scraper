const generateResourcePath = require("../../routes/common/generateResourcePath");
const {PNG} = require("../../routes/common/extensions");
const {SCREENSHOT} = require("../../routes/common/resourceTypes");

describe('Resource Path Generation', () => {
  it('should generate a valid resource path', async () => {
    const targetPath = "/tmp/resources";
    const path = generateResourcePath(targetPath, SCREENSHOT, PNG);
    expect(path.match(".+?screenshot.png")).toHaveLength(1);
  });
});
