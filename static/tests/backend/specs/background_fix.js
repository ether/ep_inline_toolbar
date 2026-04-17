'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', '..', '..', '..', 'static', 'js', 'index.js');

describe(__filename, function () {
  it('postToolbarInit no longer forces background-color: transparent (#9)', function () {
    const src = fs.readFileSync(indexPath, 'utf8');
    // Strip comments before scanning so explanatory text doesn't trip the
    // check. The real bug was a `.css('background-color', 'transparent')`
    // call in the postToolbarInit hook body.
    const code = src
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
    const badCall = /\.css\(\s*['"]background-color['"]\s*,\s*['"]transparent['"]\s*\)/;
    assert(!badCall.test(code),
        'index.js must not force a transparent background on #inline_toolbar, which left the ' +
        'floating toolbar invisible when detached into the ace_outer iframe');
    assert(/#inline_toolbar['"\s\S]{0,200}background-color/.test(code),
        'index.js should explicitly set a background-color on #inline_toolbar so it is visible ' +
        'in the ace_outer iframe where the default .toolbar stylesheet is not loaded');
  });
});
