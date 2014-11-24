<a name="module_HeaderFooterLayout"></a>
#HeaderFooterLayout
Three part layout consisting of a top-header, bottom-footer and middle part.

|options|type|description|
|---|---|---|
|`[headerSize]`|Number|Height of the header|
|`[footerSize]`|Number|Height of the footer|
|`[margins]`|Number/Array|Margins|

Example:

```javascript
var HeaderFooterLayout = require('famous-flex/layouts/HeaderFooterLayout');

new LayoutController({
  layout: HeaderFooterLayout,
  layoutOptions: {
    headerSize: 60,    // header has height of 60 pixels
    footerSize: 20     // footer has height of 20 pixels
  },
  dataSource: {
	   header: new Surface({content: 'This is the header surface'}),
	   content: new Surface({content: 'This is the content surface'}),
	   footer: new Surface({content: 'This is the footer surface'})
  }
})
```

