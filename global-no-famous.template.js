if (typeof ijzerenhein === 'undefined') {
    ijzerenhein = {};
}

ijzerenhein.FlexScrollView = require('./src/FlexScrollView');
ijzerenhein.FlowLayoutNode = require('./src/FlowLayoutNode');
ijzerenhein.LayoutContext = require('./src/LayoutContext');
ijzerenhein.LayoutController = require('./src/LayoutController');
ijzerenhein.LayoutNode = require('./src/LayoutNode');
ijzerenhein.LayoutNodeManager = require('./src/LayoutNodeManager');
ijzerenhein.LayoutUtility = require('./src/LayoutUtility');
ijzerenhein.ScrollController = require('./src/ScrollController');
ijzerenhein.VirtualViewSequence = require('./src/VirtualViewSequence');
//ijzerenhein.ScrollView = require('./src/ScrollView');

ijzerenhein.widgets = ijzerenhein.widgets || {};
ijzerenhein.widgets.DatePicker = require('./src/widgets/DatePicker');
ijzerenhein.widgets.TabBar = require('./src/widgets/TabBar');

ijzerenhein.layout = ijzerenhein.layout || {};
ijzerenhein.layout.CollectionLayout = require('./src/layouts/CollectionLayout');
ijzerenhein.layout.CoverLayout = require('./src/layouts/CoverLayout');
ijzerenhein.layout.CubeLayout = require('./src/layouts/CubeLayout');
ijzerenhein.layout.GridLayout = require('./src/layouts/GridLayout');
ijzerenhein.layout.HeaderFooterLayout = require('./src/layouts/HeaderFooterLayout');
ijzerenhein.layout.ListLayout = require('./src/layouts/ListLayout');
ijzerenhein.layout.NavBarLayout = require('./src/layouts/NavBarLayout');
ijzerenhein.layout.ProportionalLayout = require('./src/layouts/ProportionalLayout');
ijzerenhein.layout.WheelLayout = require('./src/layouts/WheelLayout');

ijzerenhein.helpers = ijzerenhein.helpers || {};
ijzerenhein.helpers.LayoutDockHelper = require('./src/helpers/LayoutDockHelper');
