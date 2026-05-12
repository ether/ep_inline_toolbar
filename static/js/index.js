'use strict';

const iT = {
  hide: () => {
    const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
    const inlineToolbar = padOuter.find('#inline_toolbar');
    $(inlineToolbar).hide();
  },
  show: () => {
    const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
    const inlineToolbar = padOuter.find('#inline_toolbar');
    $(inlineToolbar).show();
  },
};

exports.aceSelectionChanged = (hook, context) => {
  const selStart = context.rep.selStart;
  const selEnd = context.rep.selEnd;
  if ((selStart[0] !== selEnd[0]) || (selStart[1] !== selEnd[1])) {
    iT.show();
  } else {
    iT.hide(); // hide if nothing is selected
  }
};

exports.postAceInit = (hookName, context) => {
  const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
  const padInner = padOuter.contents('iframe').contents().find('body');
  padOuter.on('mouseup', (e) => {
    iT.hide();
  });
  padInner.on('mouseup', (e) => {
    const toolbar = padOuter.find('#inline_toolbar');
    const left = e.pageX + padOuter.find('iframe').offset().left;
    toolbar.css({
      position: 'absolute',
      left,
      top: e.pageY,
    });
  });
};

// Creates the buttons based on settings and draws them hidden on the screen
exports.postToolbarInit = (hook, context) => {
  let buttonsToShow = [];
  if (clientVars.ep_inline_toolbar && clientVars.ep_inline_toolbar.length) {
    buttonsToShow = clientVars.ep_inline_toolbar[0];
  } else {
    buttonsToShow = clientVars.ep_inline_toolbar.left.flat();
  }
  $('#editbar .menu_left').children('[data-key]').each(function () {
    const key = $(this).data('key');
    if (buttonsToShow.indexOf(key) === -1) return;
    // Clone the button into the inline toolbar instead of moving it: the
    // previous logic called `.append(this)` which *moves* the DOM node,
    // so every toolbar item ended up inside #inline_toolbar_menu_items and
    // the main toolbar was left empty (regression for #10, #11, #66).
    // We re-bind the click on the clone because jQuery's event-cloning
    // depends on `withDataAndEvents` support that the registered toolbar
    // commands don't opt into.
    const $original = $(this);
    const $clone = $original.clone();
    $clone.on('click', (evt) => {
      evt.preventDefault();
      $original.trigger('click');
    });
    $('#inline_toolbar_menu_items').append($clone);
  });
  const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
  // The floating toolbar is detached into the ace_outer iframe, which does
  // not load the main page's `.toolbar` stylesheet. Inject a <style> into
  // that iframe so the toolbar gets a solid, theme-aware background:
  // white in light mode and dark in dark mode (mirrors Etherpad's own
  // toolbar colours). Using a stylesheet rather than an inline style lets
  // the browser's prefers-color-scheme media query do the work, so the
  // toolbar automatically adapts without any JS re-evaluation.
  const outerDoc = $('iframe[name="ace_outer"]')[0].contentDocument;
  const $style = $('<style>').text(
      '#inline_toolbar { background-color: #f4f4f4; }\n' +
      '@media (prefers-color-scheme: dark) {\n' +
      '  #inline_toolbar { background-color: #1a1a1a; }\n' +
      '}',
  );
  $(outerDoc.head).append($style);
  $('#inline_toolbar').detach().appendTo(padOuter[0]);
};
