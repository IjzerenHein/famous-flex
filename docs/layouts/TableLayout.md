<a name="module_TableLayout"></a>
#TableLayout
Lays out a sections and cells and makes the section stick to the top (or left) side
of the scollview.

|options|type|description|
|---|---|---|
|`[isSectionCallback]`|Function|Callback that is called in order to check if a render-node is a section rather than a cell.|
|`[itemSize]`|Number/Function|Height or width in pixels of an item (used when renderNode has no size)|
|`[setCallback]`|Function|Callback that is called prior to setting size, translate, etc...: `function(renderNode, set)`.|

Example:

```javascript
var ScrollController = require('famous-flex/ScrollController');
var TableLayout = require('famous-flex/layouts/TableLayout');

var tableView = new ScrollController({
  layout: TableLayout,
  layoutOptions: {
    isSectionCallback: _isSection,
  },
  dataSource: [
    // first section
    _createSection(),
    _createCell(),
    _createCell(),
    // second section
    _createSection(),
    _createCell(),
  ]
});
this.add(tableView);

function _createCell() {
  return new Surface({
    size: [undefined, 50],
    content: 'my cell'
  });
}

function _createSection() {
  var section = new Surface({
    size: [undefined, 30],
    content: 'my sticky section'
  });
  section.isSection = true; // mark renderNode as section
  return section;
}

function _isSection(renderNode) {
  return renderNode.isSection;
}
```

