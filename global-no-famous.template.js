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
ijzerenhein.ScrollView = require('./src/ScrollView');

ijzerenhein.layout = ijzerenhein.layout || {};

ijzerenhein.layout.CollectionLayout = require('./src/layouts/CollectionLayout');
ijzerenhein.layout.CoverLayout = require('./src/layouts/CoverLayout');
ijzerenhein.layout.CubeLayout = require('./src/layouts/CubeLayout');
ijzerenhein.layout.GridLayout = require('./src/layouts/GridLayout');
ijzerenhein.layout.HeaderFooterLayout = require('./src/layouts/HeaderFooterLayout');
ijzerenhein.layout.ListLayout = require('./src/layouts/ListLayout');
ijzerenhein.layout.NavBarLayout = require('./src/layouts/NavBarLayout');
ijzerenhein.layout.TableLayout = require('./src/layouts/TableLayout');

ijzerenhein.helpers = ijzerenhein.helpers || {};

ijzerenhein.helpers.LayoutDockHelper = require('./src/helpers/LayoutDockHelper');
