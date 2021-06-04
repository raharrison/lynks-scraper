const cleanHtml = require("../../routes/extract/cleanHtml");

describe('Clean HTML', () => {
  it('should clean provided HTML', async () => {
    expect(cleanHtml('<img src=x onerror=alert(1)//>')).toEqual('<img src="x">');
    expect(cleanHtml('<svg><g/onload=alert(2)//<p>')).toEqual('<svg><g></g></svg>');
    expect(cleanHtml('<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>')).toEqual('<p>abc</p>');
    expect(cleanHtml('<TABLE><tr><td>HELLO</tr></TABL>')).toEqual('<table><tbody><tr><td>HELLO</td></tr></tbody></table>');
    expect(cleanHtml('<UL><li><A HREF=//google.com>click</UL>')).toEqual('<ul><li><a href="//google.com">click</a></li></ul>');
  });
});
