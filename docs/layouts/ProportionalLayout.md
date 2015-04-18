<a name="module_ProportionalLayout"></a>
## ProportionalLayout
Lays-out renderables sequentially based on size-ratios (similar to the stock famo.us FlexibleLayout view).

|options|type|description|
|---|---|---|
|`ratios`|Array|Size-ratios of the renderables.|

Example:

```javascript
var ProportionalLayout = require('famous-flex/layouts/ProportionalLayout');

var layoutController = new LayoutController({
  layout: ProportionalLayout,
  layoutOptions: {
    ratios: [1, 1, 2, 1],      // total size: 5
  },
  dataSource: [
    new Surface({content: 'item 1'}), // 20%
    new Surface({content: 'item 2'}), // 20%
    new Surface({content: 'item 3'}), // 40%
    new Surface({content: 'item 4'})  // 20%
  ]
});
```

