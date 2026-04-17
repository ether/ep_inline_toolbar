'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', '..', '..', '..', 'static', 'js', 'index.js');

describe(__filename, function () {
  it('postToolbarInit clones buttons instead of moving them (regression #10 #11 #66)',
      function () {
        const src = fs.readFileSync(indexPath, 'utf8');
        const postToolbar = src.match(/exports\.postToolbarInit\s*=\s*[\s\S]*?\n\};/);
        assert(postToolbar, 'expected postToolbarInit export in static/js/index.js');
        const body = postToolbar[0];
        // The original bug was `.append(this)` inside the `.each` loop, which
        // moves the <li> out of the main editbar and leaves it empty. The
        // only append we allow now must operate on a clone ("$clone" or
        // similar), not on "this".
        assert(!/#inline_toolbar_menu_items['"]\)\.append\(this\)/.test(body),
            'postToolbarInit must not .append(this) into #inline_toolbar_menu_items — that moves ' +
            'the buttons out of the main editbar. Clone them instead.');
        assert(/\.clone\(/.test(body),
            'postToolbarInit should use .clone() so the main toolbar keeps its buttons');
      });

  it('does not hide buttons that are absent from the inline toolbar config', function () {
    const src = fs.readFileSync(indexPath, 'utf8');
    const postToolbar = src.match(/exports\.postToolbarInit\s*=\s*[\s\S]*?\n\};/);
    const body = postToolbar[0];
    // Previous code called `.css('display', 'none')` on every button not in
    // the config, which caused main-toolbar buttons to vanish when the
    // plugin was active (#10, #66).
    assert(!/\.css\(\s*['"]display['"]\s*,\s*['"]none['"]\s*\)/.test(body),
        'postToolbarInit must not hide main-toolbar buttons with display:none');
  });
});
