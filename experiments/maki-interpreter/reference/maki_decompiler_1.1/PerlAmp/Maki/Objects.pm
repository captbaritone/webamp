package PerlAmp::Maki::Objects;

# this file contains MAKI object definitions and
# convinience functions.

use strict;

my %classes = (
          'E90DC47B840D4ae7B02C040BD275F7FC' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Layout',
                                                                                         'newlayout'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSwitchToLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Layout',
                                                                                         'oldlayout'
                                                                                       ],
                                                                                       [
                                                                                         'Layout',
                                                                                         'newlayout'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onBeforeSwitchToLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'param'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setXmlParam',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Layout',
                                                                                         '_layout'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onHideLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Layout',
                                                                                         '_layout'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onShowLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'layout_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getLayout',
                                                                     'result' => 'Layout'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumLayouts',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'num'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumLayout',
                                                                     'result' => 'Layout'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'layout_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'switchToLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'show',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'hide',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'close',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'toggle',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isDynamic',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'name'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setName',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurLayout',
                                                                     'result' => 'Layout'
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'Container'
                                                },
          '698EDDCD8F1E4fec9B12F944F909FF45' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'activated'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onActivate',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onLeftClick',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onRightClick',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setActivated',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setActivatedNoCallback',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getActivated',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'leftClick',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'rightClick',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Button'
                                                },
          'A8C2200D51EB4b2aBA7F5D4BC65D4C71' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'url'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'navigateUrl',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'back',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'forward',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'stop',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'refresh',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'home',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'targetname'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setTargetName',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'url'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'flags'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'targetframename'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onBeforeNavigate',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'url'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onDocumentComplete',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Browser'
                                                },
          '6129FEC1DAB74d51916501CA0C1B70DB' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumItems',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getWantAutoDeselect',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'want'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setWantAutoDeselect',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'show'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSetVisible',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'dosort'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAutoSort',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'next',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'selectCurrent',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'selectFirstEntry',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'previous',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'pagedown',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'pageup',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'home',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'end',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'reset',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'name'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'width'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'numeric'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'addColumn',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumColumns',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'column'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getColumnWidth',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'column'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'newwidth'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setColumnWidth',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'column'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getColumnLabel',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'column'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'newlabel'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setColumnLabel',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'column'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getColumnNumeric',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'column'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'isdynamic'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setColumnDynamic',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'column'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'isColumnDynamic',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'size'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setMinimumSize',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'label'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'addItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'label'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'insertItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getLastAddedItemPos',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'subpos'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'txt'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSubItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'deleteAllItems',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'deleteByPos',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'subpos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getItemLabel',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         '_text'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setItemLabel',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getItemSelected',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'isItemFocused',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getItemFocused',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setItemFocused',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'ensureItemVisible',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'invalidateColumns',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'scrollAbsolute',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'scrollRelative',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'lines'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'scrollLeft',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'lines'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'scrollRight',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'lines'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'scrollUp',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'lines'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'scrollDown',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'subpos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getSubitemText',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getFirstItemSelected',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'lastpos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getNextItemSelected',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'selectAll',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'deselectAll',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'invertSelection',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'invalidateItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getFirstItemVisible',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getLastItemVisible',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'size'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setFontSize',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getFontSize',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'c'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'jumpToNext',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'scrollToItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'resort',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSortDirection',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSortColumn',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'col'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSortColumn',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'dir'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSortDirection',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getItemCount',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSelectionStart',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSelectionEnd',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'selected'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSelected',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'setfocus'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'toggleSelection',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getHeaderHeight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getPreventMultipleSelection',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'val'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setPreventMultipleSelection',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'from'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'to'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'moveItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onSelectAll',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onDelete',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'itemnum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onDoubleClick',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'itemnum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onLeftClick',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'itemnum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSecondLeftClick',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'itemnum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onRightClick',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'col'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onColumnDblClick',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'col'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onColumnLabelClick',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'itemnum'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'selected'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onItemSelection',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'GuiList'
                                                },
          'B4DCCFFF81FE4bcc961B720FD5BE0FFF' => {
                                                  'functions' => [
                                                                  {
                                                                   'parameters' => [
                                                                                    ['Boolean', # note, std.mi does not have this parameter!
                                                                                     'onoff'
                                                                                    ],
                                                                                   ],
                                                                   'name' => 'onToggle',
                                                                   'result' => ''
                                                                  },
                                                                  # note, my std.mi did not contain this!
                                                                  {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurCfgVal',
                                                                     'result' => 'Int'
                                                                   }
                                                                 ],
                                                  'parent' => 'Button',
                                                  'name' => 'ToggleButton'
                                                },
          '1D8631C880D047929F98BD5D36B49136' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onOpenMenu',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onCloseMenu',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSelectItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'openMenu',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'closeMenu',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'MenuButton'
                                                },
          '9B3B4B82667A420e8FFC794115809C02' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumChildren',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'label'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setLabel',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getLabel',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'ensureVisible',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'nth'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getNthChild',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getChild',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         '_item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getChildSibling',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSibling',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getParent',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'editLabel',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'hasSubItems',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'issorted'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSorted',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'haschildtab'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setChildTab',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isSorted',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isCollapsed',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isExpanded',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'invalidate',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isSelected',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isHilited',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'ishilited'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setHilited',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'collapse',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'expand',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getTree',
                                                                     'result' => 'GuiTree'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onTreeAdd',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onTreeRemove',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onSelect',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onDeselect',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onLeftDoubleClick',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onRightDoubleClick',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'key'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onChar',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onExpand',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onCollapse',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onBeginLabelEdit',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'newlabel'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onEndLabelEdit',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onContextMenu',
                                                                     'result' => 'Int'
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'TreeItem'
                                                },
          'CE4F97BE77B04e199956D49833C96C27' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onFrame',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRealtime',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getRealtime',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getMode',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'mode'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setMode',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'nextMode',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Vis'
                                                },
          '00C074A0FEA249a0BE8DFABBDB161640' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuid',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getName',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'cmd'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'param1'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'param2'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'param3'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'sendCommand',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'show',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'hide',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isVisible',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'notifstr'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'a'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'b'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onNotify',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onShow',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onHide',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setStatusBar',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getStatusBar',
                                                                     'result' => 'Boolean'
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'Wac'
                                                },
          '64E4BBFA81F449d9B0C0A85B2EC3BCFD' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onEnter',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onAbort',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onIdleEditUpdate',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onEditUpdate',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'txt'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setText',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAutoEnter',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getAutoEnter',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getText',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'selectAll',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'enter',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setIdleEnabled',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getIdleEnabled',
                                                                     'result' => 'Int'
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Edit'
                                                },
          'C7ED319953194798986360B15A298CAA' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'newstate'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onToggle',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'checked'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setChecked',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isChecked',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'txt'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setText',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getText',
                                                                     'result' => 'String'
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'CheckBox'
                                                },
          'EFAA8672310E41faB7DC85A9525BCB4B' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'txt'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setText',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'txt'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAlternateText',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getText',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getTextWidth',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'newtxt'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onTextChanged',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Text'
                                                },
          '403ABCC06F224bd68BA410C829932547' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Wac',
                                                                                         'wacobj'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onGetWac',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Wac',
                                                                                         'wacobj'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onGiveUpWac',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuid',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getWac',
                                                                     'result' => 'Wac'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Map',
                                                                                         'regionmap'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'threshold'
                                                                                       ],
                                                                                       [
                                                                                         'Boolean',
                                                                                         'reverse'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRegionFromMap',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Region',
                                                                                         'reg'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRegion',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAcceptWac',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getContent',
                                                                     'result' => 'GuiObject'
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Component'
                                                },
          '5AB9FA159A7D4557ABC86557A6C67CA9' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'w'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'h'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onBeginResize',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'w'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'h'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onEndResize',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_onInit',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_onFrame',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'r'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'd'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_onGetPixelR',
                                                                     'result' => 'Double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'r'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'd'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_onGetPixelD',
                                                                     'result' => 'Double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'r'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'd'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_onGetPixelX',
                                                                     'result' => 'Double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'r'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'd'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_onGetPixelY',
                                                                     'result' => 'Double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'r'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'd'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_onGetPixelA',
                                                                     'result' => 'Double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Map',
                                                                                         'regionmap'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'threshold'
                                                                                       ],
                                                                                       [
                                                                                         'boolean',
                                                                                         'reverse'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRegionFromMap',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Region',
                                                                                         'reg'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRegion',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setEnabled',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getEnabled',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setWrap',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getWrap',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setRect',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getRect',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setBgFx',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getBgFx',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setClear',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getClear',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'msperframe'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setSpeed',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getSpeed',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setRealtime',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getRealtime',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setLocalized',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getLocalized',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setBilinear',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getBilinear',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setAlphaMode',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_getAlphaMode',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'fx_setGridSize',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_update',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'fx_restart',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Layer'
                                                },
          '62B65E3F375E408d8DEA76814AB91B77' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'newpos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSetPosition',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'newpos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onPostedPosition',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSetFinalPosition',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setPosition',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getPosition',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'lock',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'unlock',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Slider'
                                                },
          'F4787AF4B2BB4ef79CFBE74BA9BEA88D' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'PopupMenu',
                                                                                         'submenu'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'submenutext'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'addSubMenu',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'cmdtxt'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'cmd_id'
                                                                                       ],
                                                                                       [
                                                                                         'Boolean',
                                                                                         'checked'
                                                                                       ],
                                                                                       [
                                                                                         'Boolean',
                                                                                         'disabled'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'addCommand',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'addSeparator',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'popAtXY',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'popAtMouse',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumCommands',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'cmd_id'
                                                                                       ],
                                                                                       [
                                                                                         'boolean',
                                                                                         'check'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'checkCommand',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'cmd_id'
                                                                                       ],
                                                                                       [
                                                                                         'boolean',
                                                                                         'disable'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'disableCommand',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'PopupMenu'
                                                },
          '9B2E341B6C9840fa8B850C1B6EE89405' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'GuiObject',
                                                                                         'o'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRedirection',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getRedirection',
                                                                     'result' => 'GuiObject'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Map',
                                                                                         'regionmap'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'threshold'
                                                                                       ],
                                                                                       [
                                                                                         'Boolean',
                                                                                         'reverse'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRegionFromMap',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Region',
                                                                                         'reg'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRegion',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'MouseRedir'
                                                },
          '80F0F8BD1BA542a6A0933236A00C8D4A' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'cfgGetInt',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'intvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'cfgSetInt',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'cfgGetString',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'cfgGetFloat',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Float',
                                                                                         'floatvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'cfgSetFloat',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'strvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'cfgSetString',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onCfgChanged',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'cfgGetGuid',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'cfgGetName',
                                                                     'result' => 'String'
                                                                   }
                                                                 ],
                                                  'parent' => 'Group',
                                                  'name' => 'CfgGroup'
                                                },
          '8D1EBA38489E483eB9608D1F43C5C405' => {
                                                  'functions' => [],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'EqVis'
                                                },
          '60906D4E537E482eB004CC9461885672' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onDock',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onUndock',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Double',
                                                                                         'newscalevalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onScale',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getScale',
                                                                     'result' => 'Double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Double',
                                                                                         'scalevalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setScale',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setDesktopAlpha',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getDesktopAlpha',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getContainer',
                                                                     'result' => 'Container'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'center',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onMove',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onEndMove',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'w'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'h'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onUserResize',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'left'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'top'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'right'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'bottom'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'snapAdjust',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSnapAdjustTop',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSnapAdjustRight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSnapAdjustLeft',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSnapAdjustBottom',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'wantredrawonresize'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRedrawOnResize',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'beforeRedock',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'redock',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isTransparencySafe',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isLayoutAnimationSafe',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onMouseEnterLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onMouseLeaveLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onSnapAdjustChanged',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'Group',
                                                  'name' => 'Layout'
                                                },
          '01E28CE1B05911d5979FE4DE6F51760A' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'group_id'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'num_groups'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'instantiate',
                                                                     'result' => 'Group'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumItems',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'num'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumItem',
                                                                     'result' => 'Group'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'removeAll',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'percent'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'scrollToPercent',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'GroupList'
                                                },
          'D59514F7ED3645e8980F3F4EA0522CD9' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onWantAutoContextMenu',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'clicked'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'lines'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onMouseWheelUp',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'clicked'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'lines'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onMouseWheelDown',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onContextMenu',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'c'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onChar',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onItemRecvDrop',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onLabelChange',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onItemSelected',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onItemDeselected',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumRootItems',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'which'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumRootItem',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'c'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'jumpToNext',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'ensureItemVisible',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getContentsWidth',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getContentsHeight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'par'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'sorted'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'haschildtab'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'addTreeItem',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'removeTreeItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'newparent'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'moveTreeItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'deleteAllItems',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'expandItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'expandItemDeferred',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'collapseItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'collapseItemDeferred',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'selectItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'selectItemDeferred',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'delItemDeferred',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'hiliteItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'unhiliteItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurItem',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'hitTest',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'editItemLabel',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'destroyit'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'cancelEditLabel',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'ae'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAutoEdit',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getAutoEdit',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'name'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getByLabel',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'dosort'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSorted',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSorted',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'sortTreeItems',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getSibling',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'doautocollapse'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAutoCollapse',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'newsize'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setFontSize',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getFontSize',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'c'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getNumVisibleChildItems',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumVisibleItems',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'n'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumVisibleItems',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'c'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'n'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumVisibleChildItems',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'n'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumAllItems',
                                                                     'result' => 'TreeItem'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getItemRectX',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getItemRectY',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getItemRectW',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'TreeItem',
                                                                                         'item'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getItemRectH',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getItemFromPoint',
                                                                     'result' => 'TreeItem'
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'GuiTree'
                                                },
          '0F08C940AF394b2380F3B8C48F7EBB59' => {
                                                  'functions' => [],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Status'
                                                },
          '6B64CD275A264c4b8C59E6A70CF6493A' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onPlay',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onPause',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onResume',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onStop',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'framenum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onFrame',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'msperframe'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setSpeed',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'framenum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'gotoFrame',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'framenum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setStartFrame',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'framenum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setEndFrame',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAutoReplay',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'play',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'stop',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'pause',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isPlaying',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isPaused',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isStopped',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getStartFrame',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getEndFrame',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getLength',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getDirection',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getAutoReplay',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurFrame',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setRealtime',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'Layer',
                                                  'name' => 'AnimatedLayer'
                                                },
          'B2023AB5434D4ba1BEAE59637503F3C6' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Any',
                                                                                         '_object'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'addItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'removeItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumItem',
                                                                     'result' => 'Any'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Any',
                                                                                         '_object'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'findItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumItems',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'removeAll',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'List'
                                                },
          '97AA3E4DF4D04fa8817B0AF22A454983' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getMaxHeight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getMaxWidth',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setScroll',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getScroll',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumChildren',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'n'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumChildren',
                                                                     'result' => 'GuiObject'
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'ComponentBucket'
                                                },
          'B5BAA53505B34dcbADC1E618D28F6896' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurPage',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'a'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setCurPage',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'TabSheet'
                                                },
          '5D0C5BB67DE14b1fA70F8D1659941941' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onTimer',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'millisec'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setDelay',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getDelay',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'start',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'stop',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isRunning',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSkipped',
                                                                     'result' => 'Int'
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'Timer'
                                                },
          '516549710D874a5191E3A6B53235F3E7' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getClassName',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getId',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'command'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'param'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'a'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'b'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onNotify',
                                                                     'result' => 'Int'
                                                                   }
                                                                 ],
                                                  'parent' => '@{00000000-0000-0000-0000-000000000000}@',
                                                  'name' => 'Object'
                                                },
          'CDCB785D81F242538F0561B872283CFA' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onResetQuery',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'QueryList'
                                                },
          'D6F50F6493FA49b793F1BA66EFAE3E98' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onScriptLoaded',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onScriptUnloading',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onQuit',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'param'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSetXuiParam',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'key'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onKeyDown',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'action'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'section'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'key'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onAccelerator',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Layout',
                                                                                         '_layout'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onCreateLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Layout',
                                                                                         '_layout'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onShowLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Layout',
                                                                                         '_layout'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onHideLayout',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onStop',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onPlay',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onPause',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onResume',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'newtitle'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onTitleChange',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'newtitle2'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onTitle2Change',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'info'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onInfoChange',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'msg'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onStatusMsg',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'band'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'newvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onEqBandChanged',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'newvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onEqPreampChanged',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'newstatus'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onEqChanged',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'newvol'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onVolumeChanged',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'newpos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSeek',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'container_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getContainer',
                                                                     'result' => 'Container'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'container_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'newDynamicContainer',
                                                                     'result' => 'Container'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'group_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'newGroup',
                                                                     'result' => 'Group'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'group_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'newGroupAsLayout',
                                                                     'result' => 'Layout'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumContainers',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'num'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumContainer',
                                                                     'result' => 'Container'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'wac_guid'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getWac',
                                                                     'result' => 'Wac'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'message'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'msgtitle'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'flag'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'notanymore_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'messageBox',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getPlayItemString',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getPlayItemLength',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'metadataname'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getPlayItemMetaDataString',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getPlayItemDisplayTitle',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'ext'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getExtFamily',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'playitem'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'playFile',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getLeftVuMeter',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getRightVuMeter',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getVolume',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'vol'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setVolume',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'play',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'stop',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'pause',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'next',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'previous',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'eject',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'pos'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'seekTo',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getPosition',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'band'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setEqBand',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setEqPreamp',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setEq',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'band'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getEqBand',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getEqPreamp',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getEq',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getMousePosX',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getMousePosY',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'integerToString',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'StringToInteger',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'float',
                                                                                         'value'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'ndigits'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'floatToString',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'stringToFloat',
                                                                     'result' => 'Float'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'integerToLongTime',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'integerToTime',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'dateToTime',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'dateToLongTime',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'formatDate',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'formatLongDate',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateYear',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateMonth',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateDay',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateDow',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateDoy',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateHour',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateMin',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateSec',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'datetime'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getDateDst',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getDate',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'str'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'start'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'len'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'strmid',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'nchars'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'Strleft',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'nchars'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'strright',
                                                                     'result' => 'string'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ],
                                                                                       [
                                                                                         'string',
                                                                                         'substr'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'strsearch',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'strlen',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'strupper',
                                                                     'result' => 'string'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'strlower',
                                                                     'result' => 'string'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'url'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'urlEncode',
                                                                     'result' => 'string'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'removePath',
                                                                     'result' => 'string'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getPath',
                                                                     'result' => 'string'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getExtension',
                                                                     'result' => 'string'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'str'
                                                                                       ],
                                                                                       [
                                                                                         'string',
                                                                                         'separator'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'tokennum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getToken',
                                                                     'result' => 'string'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'sin',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'cos',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'tan',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'asin',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'acos',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'atan',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'y'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'x'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'atan2',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ],
                                                                                       [
                                                                                         'double',
                                                                                         'pvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'pow',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'sqr',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'sqrt',
                                                                     'result' => 'double'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'max'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'random',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'section'
                                                                                       ],
                                                                                       [
                                                                                         'string',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'string',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setPrivateString',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'string',
                                                                                         'section'
                                                                                       ],
                                                                                       [
                                                                                         'string',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setPrivateInt',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'section'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'defvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getPrivateString',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'section'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'defvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getPrivateInt',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setPublicString',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setPublicInt',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'defvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getPublicString',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'item'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'defvalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getPublicInt',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getParam',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getScriptGroup',
                                                                     'result' => 'Group'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getViewportWidth',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getViewportWidthFromPoint',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getViewportHeight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getViewportHeightFromPoint',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getViewportLeft',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getViewportLeftFromPoint',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getViewportTop',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getViewportTopFromPoint',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'str'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'severity'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'debugString',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'application'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'command'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'mininterval'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'ddeSend',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'guid'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onLookForComponent',
                                                                     'result' => 'Component'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurAppLeft',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurAppTop',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurAppWidth',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCurAppHeight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isAppActive',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSkinName',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'skinname'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'switchSkin',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isLoadingSkin',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'lockUI',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'unlockUI',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getMainBrowser',
                                                                     'result' => 'Browser'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'popMainBrowser',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'url'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'navigateUrl',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Object',
                                                                                         'o'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'isObjectValid',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Double',
                                                                                         'd'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'integer',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Double',
                                                                                         'd'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'frac',
                                                                     'result' => 'Double'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getTimeOfDay',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'alphavalue'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setMenuTransparency',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'guid'
                                                                                       ],
                                                                                       [
                                                                                         'boolean',
                                                                                         'goingvisible'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onGetCancelComponent',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getStatus',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'vk_code'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'isKeyDown',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         '_text'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setClipboardText',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'charnum'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'Chr',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'extlist'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'id'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'prev_filename'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'selectFile',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'systemMenu',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'windowMenu',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'GuiObject',
                                                                                         'context'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'actionname'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'actionparam'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'triggerAction',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'guidorgroupid'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'preferedcontainer'
                                                                                       ],
                                                                                       [
                                                                                         'Boolean',
                                                                                         'transient'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'showWindow',
                                                                     'result' => 'GuiObject'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'GuiObject',
                                                                                         'hw'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'hideWindow',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'guidorgroup'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'hideNamedWindow',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'guidorgroup'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'isNamedWindowVisible',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'atomname'
                                                                                       ],
                                                                                       [
                                                                                         'Object',
                                                                                         'object'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAtom',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'atomname'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getAtom',
                                                                     'result' => 'Object'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'invokeDebugger',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isVideo',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isVideoFullscreen',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getIdealVideoWidth',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getIdealVideoHeight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isMinimized',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'minimizeApplication',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'restoreApplication',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'activateApplication',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getPlaylistLength',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getPlaylistIndex',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isDesktopAlphaAvailable',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isTransparencyAvailable',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onShowNotification',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSongInfoText',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'channel'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'band'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getVisBand',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getRuntimeVersion',
                                                                     'result' => 'Double'
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'System'
                                                },
          '3A370C023CBF439f84F186885BCF1E36' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Region',
                                                                                         'reg'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'add',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Region',
                                                                                         'reg'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'sub',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'offset',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'double',
                                                                                         'r'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'stretch',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Region',
                                                                                         'reg'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'copy',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Map',
                                                                                         'regionmap'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'threshold'
                                                                                       ],
                                                                                       [
                                                                                         'Boolean',
                                                                                         'reversed'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'loadFromMap',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'bitmapid'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'loadFromBitmap',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getBoundingBoxX',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getBoundingBoxY',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getBoundingBoxW',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getBoundingBoxH',
                                                                     'result' => 'Int'
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'Region'
                                                },
          '36D59B7103FD4af897950502B7DB267A' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getItemSelected',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'id'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'hover'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSelect',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'h'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setListHeight',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'openList',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'closeList',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'lotsofitems'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setItems',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         '_text'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'addItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'delItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         '_text'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'findItem',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumItems',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'id'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'hover'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'selectItem',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getItemText',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSelected',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getSelectedText',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getCustomText',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'deleteAllItems',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'txt'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setNoItemText',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'DropDownList'
                                                },
          '2D2D1376BE0A4CB9BC0C57E6E4C999F5' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getContentsHeight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'groupname'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'newCell',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'nextRow',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'deleteAll',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Form'
                                                },
          '4EE3E199C6364bec97CD78BC9C8628B0' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'show',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'hide',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isVisible',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onSetVisible',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'alpha'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setAlpha',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getAlpha',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onLeftButtonUp',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onLeftButtonDown',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onRightButtonUp',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onRightButtonDown',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onRightButtonDblClk',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onLeftButtonDblClk',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onMouseMove',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onEnterArea',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onLeaveArea',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setEnabled',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getEnabled',
                                                                     'result' => 'boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'boolean',
                                                                                         'onoff'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onEnable',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'w'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'h'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'resize',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'w'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'h'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onResize',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'isMouseOver',
                                                                     'result' => 'boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getLeft',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getTop',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getWidth',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getHeight',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setTargetX',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setTargetY',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'w'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setTargetW',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'r'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setTargetH',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'alpha'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setTargetA',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'float',
                                                                                         'insecond'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setTargetSpeed',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'gotoTarget',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onTargetReached',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'cancelTarget',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'reverse'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'reverseTarget',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onStartup',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isGoingToTarget',
                                                                     'result' => 'boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'param'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'value'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setXmlParam',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'param'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getXmlParam',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Group',
                                                                                         'parent'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'init',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'bringToFront',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'bringToBack',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'GuiObject',
                                                                                         'guiobj'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'bringAbove',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'GuiObject',
                                                                                         'guiobj'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'bringBelow',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuiX',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuiY',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuiW',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuiH',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuiRelatX',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuiRelatY',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuiRelatW',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getGuiRelatH',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isActive',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getParent',
                                                                     'result' => 'GuiObject'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getParentLayout',
                                                                     'result' => 'Layout'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getTopParent',
                                                                     'result' => 'GuiObject'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'runModal',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'retcode'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'endModal',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'findObject',
                                                                     'result' => 'GuiObject'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'findObjectXY',
                                                                     'result' => 'GuiObject'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getName',
                                                                     'result' => 'String'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'clientToScreenX',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'clientToScreenY',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'w'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'clientToScreenW',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'h'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'clientToScreenH',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'screenToClientX',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'screenToClientY',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'w'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'screenToClientW',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'h'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'screenToClientH',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getAutoWidth',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getAutoHeight',
                                                                     'result' => 'int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'setFocus',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'c'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onChar',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'accel'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onAccelerator',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isMouseOverRect',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'interface_guid'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getInterface',
                                                                     'result' => 'Object'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'vk_code'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onKeyDown',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'vk_code'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onKeyUp',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onGetFocus',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'onKillFocus',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'action'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'param'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'p1'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'p2'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'sendAction',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'action'
                                                                                       ],
                                                                                       [
                                                                                         'String',
                                                                                         'param'
                                                                                       ],
                                                                                       [
                                                                                         'Int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'p1'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'p2'
                                                                                       ],
                                                                                       [
                                                                                         'GuiObject',
                                                                                         'source'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onAction',
                                                                     'result' => 'Int'
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'GuiObject'
                                                },
          '38603665461B42a7AA75D83F6667BF73' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getValue',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'int',
                                                                                         'x'
                                                                                       ],
                                                                                       [
                                                                                         'int',
                                                                                         'y'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'inRegion',
                                                                     'result' => 'Boolean'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'bitmapid'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'loadMap',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getWidth',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getHeight',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getRegion',
                                                                     'result' => 'Region'
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'Map'
                                                },
          'A5376FA14E94411a83F605EC5EEA5F0A' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'feed_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'setFeed',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'releaseFeed',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'new_feeddata'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onFeedChange',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'Object',
                                                  'name' => 'FeedWatcher'
                                                },
          '7FD5F210ACC448dfA6A05451576CDC76' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'str'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'callme',
                                                                     'result' => ''
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'LayoutStatus'
                                                },
          '7DFD324437514e7cBF4082AE5F3ADC33' => {
                                                  'functions' => [],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Title'
                                                },
          '45BE95E520724191935CBB5FF9F117FD' => {
                                                  'functions' => [
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'String',
                                                                                         'object_id'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'getObject',
                                                                     'result' => 'GuiObject'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getNumObjects',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'Int',
                                                                                         'num'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'enumObject',
                                                                     'result' => 'GuiObject'
                                                                   },
                                                                   {
                                                                     'parameters' => [
                                                                                       [
                                                                                         'GuiObject',
                                                                                         'newobj'
                                                                                       ]
                                                                                     ],
                                                                     'name' => 'onCreateObject',
                                                                     'result' => ''
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getMousePosX',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'getMousePosY',
                                                                     'result' => 'Int'
                                                                   },
                                                                   {
                                                                     'parameters' => [],
                                                                     'name' => 'isLayout',
                                                                     'result' => 'Boolean'
                                                                   }
                                                                 ],
                                                  'parent' => 'GuiObject',
                                                  'name' => 'Group'
                                                },

               # and some objects I found in a file called config.mi from http://bluemars.planet-d.net/sdk/maki/
               'D40302823AAB4d87878D12326FADFCD5' => {
                                                      'functions' => [
                                                                      {
                                                                       'parameters' => [
                                                                                        [
                                                                                         'String',
                                                                                         'attr_name'
                                                                                        ]
                                                                                       ],
                                                                       'name' => 'getAttribute',
                                                                       'result' => 'ConfigAttribute'
                                                                      },
                                                                      {
                                                                       'parameters' => [
                                                                                        [
                                                                                         'String',
                                                                                         'attr_name'
                                                                                        ],
                                                                                        [
                                                                                         'String',
                                                                                         'default_val'
                                                                                        ]
                                                                                       ],
                                                                       'name' => 'newAttribute',
                                                                       'result' => 'ConfigAttribute'
                                                                      },
                                                                      {
                                                                       'parameters' => [
                                                                                        [
                                                                                         'String',
                                                                                         'attr_name'
                                                                                        ]
                                                                                       ],
                                                                       'name' => 'getGuid',
                                                                       'result' => 'String'
                                                                      }
                                                                     ],
                                                      'parent' => 'Object',
                                                      'name' => 'ConfigItem'
                                                     },
               '593DBA22D0774976B952F4713655400B' => {
                                                      'functions' => [
                                                                      {
                                                                       'parameters' => [
                                                                                        [
                                                                                         'String',
                                                                                         'item_name'
                                                                                        ]
                                                                                       ],
                                                                       'name' => 'getItem',
                                                                       'result' => 'ConfigItem'
                                                                      },
                                                                      {
                                                                       'parameters' => [
                                                                                        [
                                                                                         'String',
                                                                                         'item_guid'
                                                                                        ]
                                                                                       ],
                                                                       'name' => 'getItemByGuid',
                                                                       'result' => 'ConfigItem'
                                                                      },
                                                                      {
                                                                       'parameters' => [
                                                                                        [
                                                                                         'String',
                                                                                         'item_name'
                                                                                        ],
                                                                                        [
                                                                                         'String',
                                                                                         'item_guid'
                                                                                        ]
                                                                                       ],
                                                                       'name' => 'newItem',
                                                                       'result' => 'ConfigItem'
                                                                      }
                                                                     ],
                                                      'parent' => 'Object',
                                                      'name' => 'Config'
                                                     },

               '24DEC283B76E4a368CCC9E24C46B6C73' => {
                                                      'functions' => [
                                                                      {
                                                                       'parameters' => [
                                                                                        [
                                                                                         'String',
                                                                                         'value'
                                                                                        ]
                                                                                       ],
                                                                       'name' => 'setData',
                                                                       'result' => ''
                                                                      },
                                                                      {
                                                                       'parameters' => [],
                                                                       'name' => 'getData',
                                                                       'result' => 'String'
                                                                      },
                                                                      {
                                                                       'parameters' => [],
                                                                       'name' => 'onDataChanged',
                                                                       'result' => ''
                                                                      },
                                                                      {
                                                                       'parameters' => [],
                                                                       'name' => 'getParentItem',
                                                                       'result' => 'ConfigItem'
                                                                      },
                                                                      {
                                                                       'parameters' => [],
                                                                       'name' => 'getAttributeName',
                                                                       'result' => 'String'
                                                                      }
                                                                     ],
                                                      'parent' => 'Object',
                                                      'name' => 'ConfigAttribute'
                                                     },

              );


# make some more keys..
my @ids = keys( %classes );
foreach ( @ids ) {
  $classes{ $classes{$_}->{'name'} } = $classes{$_};
  $classes{ lc($_) } = $classes{$_};
}

# dereference the parent class
foreach ( @ids ) {
  $classes{$_}->{'parent'} = $classes{$classes{$_}->{'parent'}};
}

#d6f50f64-49b7-93fa-66ba-f193-983e-aeef
#D6F50F64-93FA-49b7-93F1-BA66-EFAE-3E98

# returns a class object for an id
sub getClass {
  my $name = lc(shift);
#print "getName $name \n";
  $name =~ s/(........)(....)(....)(..)(..)(..)(..)(..)(..)(..)(..)/$1$3$2$7$6$5$4$11$10$9$8/;
#print "   Name $name \n";
#print "is a ".$classes{ $name }->{name}."\n";
  return $classes{ $name };
}

sub countParentFunctions {
  my $class = shift;
  my $count = 0;

  while ( $class->{'parent'} ) {
    $class = $class->{'parent'};
    my $functionss = $class->{'functions'};
    $count += scalar( @{$functionss} );
  }

  return $count;
}


sub getFunction {
  my $class = shift;
  my $funcNum = shift;
  my $parentCount = countParentFunctions( $class );

  if ( $class->{'parent'} &&
       $parentCount >= $funcNum ) {
    getFunction( getClass( $class->{'parent'} ), $funcNum );
  }

  if ( exists( $class->{'functions'}->[$funcNum-$parentCount] ) ) {
    return $class->{'functions'}->[$funcNum-$parentCount];
  } else {
    return undef;
  }
}


sub getObjectFunction {
  my $class = shift;
  my $funcName = lc(shift);

  foreach( @{ $class->{functions} } ) {
    return $_ if( lc($_->{name}) eq $funcName );
  }

  return undef if( ! defined( $class->{parent} ) );
  return getObjectFunction( $class->{parent}, $funcName );
}

#sub getFunctionByName {
#  my $name = shift;
#  return $functions{$name};
#}

1;
