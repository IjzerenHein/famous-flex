<a name="module_TabBarLayout"></a>
## TabBarLayout
Tab-bar layout supporting both horizontal (default) and vertical orientation.

|options|type|description|
|---|---|---|
|`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
|`[spacing]`|Number|Space in between items|
|`[zIncrement]`|Number|Z-translation increment used to stack the elements correctly (default: 2)|
|`[itemSize]`|Number/Bool|Width or height of the item (see below)|

`itemSize` can have of the following values:

|itemSize|description|
|---|---|---|
|`undefined`|When itemSize is undefined or omitted, all items are spread out equally over the full size.|
|`Number`|Size of the item.|
|`true`|Use the size of the renderable (calls `getSize` on the item).|

Example:

```javascript
var TabBarLayout = require('famous-flex/layouts/TabBarLayout');

var layout = new LayoutController({
  layout: TabBarLayout,
  layoutOptions: {
    itemSize: undefined,   // undefined = fill equally to full width
    margins: [5, 1, 5, 1], // margins to utilize
    spacing: 10            // space in between items
  },
  dataSource: {
    background: new Surface({properties: {backgroundColor: 'black'}}),
    items: [
      new Surface({ content: 'one' }),
      new Surface({ content: 'two' }),
      new Surface({ content: 'three' })
    ],
    spacers: [ // spacers in between the items
      new Surface({properties: {backgroundColor: 'gray'}}),
      new Surface({properties: {backgroundColor: 'gray'}})
    ],
    selectedItemOverlay: {
      new Surface({ properties: {borderBottom: '4px solid blue'}})
    }
  }
});
```

