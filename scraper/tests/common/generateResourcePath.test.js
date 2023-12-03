import generateResourcePath from "../../routes/common/generateResourcePath.js";
import {PNG} from "../../routes/common/extensions.js";
import {SCREENSHOT} from "../../routes/common/resourceTypes.js";

describe('Resource Path Generation', () => {
  it('should generate a valid resource path', async () => {
    const targetPath = "/tmp/resources";
    const path = generateResourcePath(targetPath, SCREENSHOT, PNG);
    expect(path.match(".+?screenshot.png")).toHaveLength(1);
  });
});
