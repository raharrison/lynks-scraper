[![Build](https://github.com/raharrison/lynks-scraper/actions/workflows/build.yml/badge.svg)](https://github.com/raharrison/lynks-scraper/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/raharrison/lynks-scraper/branch/master/graph/badge.svg?token=ZPH979TW7H)](https://codecov.io/gh/raharrison/lynks-scraper)

# Lynks Scraper

Scraping component for the [Lynks project](https://github.com/raharrison/lynks-server) to extract content from specified
webpages. Provides a simple web API to generate a number of resources or page metadata from a given URL.

## Key Features

- extract thumbnail and preview images from headless Chrome sessions
- generate full page screenshots and PDF documents from pages
- extract key page content (articles) and generate 'readable' versions
- extract metadata from a given page, including title, keywords, description, author, publish date etc

## Libraries Used

- [Express](https://expressjs.com/) - minimalist web framework
- [Puppeteer](https://github.com/puppeteer/puppeteer) (and plugins
  from [extra](https://github.com/berstend/puppeteer-extra)) - headless Chrome sessions
- [JSDom](https://github.com/jsdom/jsdom) and [DomPurify](https://github.com/cure53/DOMPurify) - create and sanitize
  DOM's in Node.js
- [Readability](https://github.com/mozilla/readability) - create 'reader view' versions of webpages without the clutter
- [Sharp](https://github.com/lovell/sharp) - fast image resizing
- [Winston](https://github.com/winstonjs/winston) - logging
- [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest) - testing

## Routes

### Available Resource Types

Pass in as payload into each endpoint to define which resources should be generated:

- `SCREENSHOT` - full page screenshot as `PNG`
- `THUMBNAIL` - primary extracted image from page or small screenshot as `320x180` `JPG`
- `PREVIEW` - partial page screenshot from primary image or headless session as `640x360` `JPG`
- `PAGE` - full `HTML` page after sanitization
- `DOCUMENT` - full page `PDF`
- `READABLE_DOC` - reader view of page as `HTML` (with images)
- `READABLE_TEXT`- reader view of page as text only

### Suggest

Extract key metadata and simple preview/thumbnail to support the Lynks suggest functionality. This endpoint is
user-facing and so does not use headless Chrome for performance purposes. Instead, the full page is downloaded as HTML
and then analyzed. As no session is created, the thumbnail and preview images are extracted from the primary page
image (if present). Only a subset of the overall resource types are available.

`POST /api/suggest` --> generate a suggestion and number of resources from a given URL

```json
{
  "url": "https://foojay.io/today/demystifying-jvm-memory-management/",
  "resourceTypes": [
    "PREVIEW",
    "THUMBNAIL",
    "READABLE_TEXT"
  ],
  "targetPath": "/where/to/save/resources"
}
```

- `url` - the URL to generate a suggestion for
- `resourceTypes` - a subset of resource types to generate and save to the specified path. Headless Chrome is not used
  to generate these resources. Only `PREVIEW`, `THUMBNAIL` and `READABLE_TEXT` types are available
- `targetPath` - the absolute path to the directory in which to save the specified resources to. The directory will be
  created if it doesn't already exist

Response is a `details` object containing metadata alongside list of `resource` objects with type, extension and the
absolute path to the target location on the filesystem:

```json
{
  "details": {
    "url": "https://deepu.tech/memory-management-in-jvm/",
    "title": "Demystifying Java Virtual Machine Memory Management",
    "keywords": [
      "java",
      "memory",
      "management"
    ],
    "description": "I aim to demystify the concepts behind memory management and take a look at memory management in some of the modern programming languages.",
    "image": "https://i.imgur.com/Kv9ichJ.gif",
    "author": "Deepu K Sasidharan",
    "published": "2021-05-20T07:26:37+00:00"
  },
  "resources": [
    {
      "resourceType": "PREVIEW",
      "targetPath": "/where/to/save/resources/preview_1623084013177.jpg",
      "extension": "jpg"
    },
    {
      "resourceType": "THUMBNAIL",
      "targetPath": "/where/to/save/resources/thumbnail_1623084013199.jpg",
      "extension": "jpg"
    },
    {
      "resourceType": "READABLE_TEXT",
      "targetPath": "/where/to/save/resources/readable_text_1623084013805.txt",
      "extension": "txt"
    }
  ]
}
```

### Scrape

Perform a full scrape of the target URL using a headless Chrome session. Output a set of resources, including
screenshots, readable versions, previews and PDF's to the provided target path.

`POST /api/scrape` --> scrape the target URL and generate a number of resources

```json
{
  "url": "https://foojay.io/today/demystifying-jvm-memory-management",
  "resourceTypes": [
    "SCREENSHOT",
    "PREVIEW",
    "DOCUMENT",
    "READABLE_TEXT",
    "READABLE_DOC",
    "PAGE",
    "THUMBNAIL"
  ],
  "targetPath": "/where/to/save/resources"
}
```

- `url` - the URL to scrape
- `resourceTypes` - a subset of resource types to generate and save to the specified path. Headless Chrome will be used
  to generate these resources
- `targetPath` - the absolute path to the directory in which to save the specified resources to. The directory will be
  created if it doesn't already exist

Response is a list of `resource` objects with type, extension and the absolute path to the target location on the
filesystem:

```json
[
  {
    "resourceType": "SCREENSHOT",
    "targetPath": "/where/to/save/resources/screenshot_1623084226610.png",
    "extension": "png"
  },
  {
    "resourceType": "PREVIEW",
    "targetPath": "/where/to/save/resources/preview_1623084227744.jpg",
    "extension": "jpg"
  },
  {
    "resourceType": "THUMBNAIL",
    "targetPath": "/where/to/save/resources/thumbnail_1623084227757.jpg",
    "extension": "jpg"
  },
  {
    "resourceType": "DOCUMENT",
    "targetPath": "/where/to/save/resources/document_1623084227766.pdf",
    "extension": "pdf"
  },
  {
    "resourceType": "PAGE",
    "targetPath": "/where/to/save/resources/page_1623084228844.html",
    "extension": "html"
  },
  {
    "resourceType": "READABLE_TEXT",
    "targetPath": "/where/to/save/resources/readable_text_1623084229416.txt",
    "extension": "txt"
  },
  {
    "resourceType": "READABLE_DOC",
    "targetPath": "/where/to/save/resources/readable_doc_1623084229749.html",
    "extension": "html"
  }
]
```
