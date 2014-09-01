<a name="module_HeaderFooterLayout"></a>
#HeaderFooterLayout
Three part layout consiting of a top-header, bottom-footer and middle part.

|options|type|description|
|---|---|---|
|`[headerHeight]`|Number|Height of the header|
|`[footerHeight]`|Number|Height of the footer|

Example:

```javascript
new LayoutController({
  layout: HeaderFooterLayout,
  layoutOptions: {
    headerHeight: 60,    // header has height of 60 pixels
    footerHeight: 20     // footer has height of 20 pixels
  },
  dataSource: {
	   header: new Surface({content: 'This is the header surface'}),
	   content: new Surface({content: 'This is the content surface'}),
	   footer: new Surface({content: 'This is the footer surface'})
  }
})
```

