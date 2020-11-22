var _, $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie;
var padEditBar = require('ep_etherpad-lite/static/js/pad_editbar').padeditbar;
var Security = require('ep_etherpad-lite/static/js/security');

var globalKey = 0;

iT = {
  hide() {
    const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
    const inlineToolbar = padOuter.find('#inline_toolbar');
    $(inlineToolbar).hide();
  },
  show(selStart, selEnd) {
    const XY = getXYOffsetOfRep(selStart, selEnd);
    this.draw(XY);
    const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
    const inlineToolbar = padOuter.find('#inline_toolbar');
    $(inlineToolbar).show();
  },
  draw(XY) {
    drawAt(XY);
  },
};

exports.aceSelectionChanged = function (hook, context) {
  const selStart = context.rep.selStart;
  const selEnd = context.rep.selEnd;
  if ((selStart[0] !== selEnd[0]) || (selStart[1] !== selEnd[1])) {
    iT.show(selStart, selEnd);
  } else {
    iT.hide();
  }
};

exports.aceEditorCSS = function (hook, context) {
};

// Given a rep we get the X and Y px offset
function getXYOffsetOfRep(selStart, selEnd) {
  let viewPosition = 'top';
  if (clientVars.ep_inline_toolbar && clientVars.ep_inline_toolbar.position) {
    viewPosition = clientVars.ep_inline_toolbar.position;
  }
  const padOuter = $('iframe[name="ace_outer"]').contents();
  const padInner = padOuter.find('iframe[name="ace_inner"]');
  const topCorrection = padInner.offset().top;
  const x = selStart[1];
  let y = selEnd[0];
  y += 1;
  const inner = $('iframe[name="ace_outer"]').contents().find('iframe');
  const innerWidth = inner.contents().find('#innerdocbody').width();

  // it appears on apple devices this might not be set properly?
  if ($(inner)[0]) {
    var leftOffset = $(inner)[0].offsetLeft + 3;
  } else {
    var leftOffset = 0;
  }

  let stickUp = false;
  const stickLeft = true;

  // Get the target Line
  let line = getSelectedLineElement();
  const divEl = $(line.lineNode);
  const div = divEl.clone();
  inner.contents().find('body').append(div);
  div.css({position: 'absolute'});
  div.css(divEl.offset());
  const divWidth = div.width();

  // Is the line visible yet?
  if (divEl.length !== 0) {
    let top = divEl.offset().top + topCorrection; // A standard generic offset
    // Get the HTML
    const html = $(div).html();
    let text = $(div).text();
    text = Security.escapeHTML(text).split('');

    let workerIndex;
    if (viewPosition === 'right') {
      if (selEnd[0] > selStart[0] && selEnd[1] === 0) {
        line = getLineAtIndex(selEnd[0] - 1);
        workerIndex = $(line.lineNode).text().length - 1;
      } else {
        workerIndex = selEnd[1];
      }
    } else {
      workerIndex = selStart[1];
    }
    text.splice(workerIndex, 0, '</span>');
    text.splice(workerIndex, 0, '<span id="selectWorker">');
    const heading = isHeading();
    text = text.join('');

    if (heading) {
      text = `<${heading}>${text}</${heading}>`;
    }

    $(div).html(text);
    const worker = $(div).find('#selectWorker');
    const workerPosition = worker.position();

    // Get the width of the element (This is how far out X is in px);
    let left = workerPosition.left || 0;

    // Get the height of the element minus the inner line height
    // Add the innerdocbody offset
    left += leftOffset;

    // Add support for page view margins
    let divMargin = $(divEl).css('margin-left');
    let innerdocbodyMargin = $(divEl).parent().css('margin-left');
    if (innerdocbodyMargin) {
      innerdocbodyMargin = innerdocbodyMargin.replace('px', '');
      innerdocbodyMargin = parseInt(innerdocbodyMargin);
    } else {
      innerdocbodyMargin = 0;
    }
    if (divMargin) {
      divMargin = divMargin.replace('px', '');
      divMargin = parseInt(divMargin);
      if ((divMargin + innerdocbodyMargin) > 0) {
        left += divMargin;
      }
    }
    // adjust position
    if (viewPosition === 'top') {
      top -= padOuter.find('#inline_toolbar').height();

      if (top <= 0) { // If the tooltip wont be visible to the user because it's too high up
        stickUp = true;
        top += padOuter.find('#inline_toolbar').height();
        if (top < 0) { top = 0; } // handle case where caret is in 0,0
      }
    } else if (viewPosition === 'bottom') {
      top += divEl.height();

      if (top >= padOuter.height()) { // If the tooltip wont be visible to the user because it's too high up
        stickUp = true;
        top -= (padOuter.find('#inline_toolbar').height() * 2);
      }
    } else if (viewPosition === 'right') {
      top += ($(div).height() / 2);
    } else if (viewPosition === 'left') {
      left -= padOuter.find('#inline_toolbar').width();
      top += ($(div).height() / 2);
    }
    // Remove the element
    $(div).remove();
    return [left, top];
  }
}

// Draws the toolbar onto the screen
function drawAt(XY) {
  const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
  const toolbar = padOuter.find('#inline_toolbar');

  toolbar.show();
  toolbar.css({
    position: 'absolute',
    left: XY[0],
    top: XY[1],
  });
}


function html_substr(str, count) {
  if (browser.msie) return ''; // IE can't handle processing any of the X position stuff so just return a blank string
  // Basically the recursion makes IE run out of memory and slows a pad right down, I guess a way to fix this would be to
  // only wrap the target / last span or something or stop it destroying and recreating on each change..
  // Also IE can often inherit the wrong font face IE bold but not apply that to the whole document ergo getting teh width wrong
  const div = document.createElement('div');
  div.innerHTML = str;

  walk(div, track);

  function track(el) {
    if (count > 0) {
      const len = el.data.length;
      count -= len;
      if (count <= 0) {
        el.data = el.substringData(0, el.data.length + count);
      }
    } else {
      el.data = '';
    }
  }

  function walk(el, fn) {
    let node = el.firstChild;
    if (!node) return;
    do {
      if (node.nodeType === 3) {
        fn(node);
        //          Added this >>------------------------------------<<
      } else if (node.nodeType === 1 && node.childNodes && node.childNodes[0]) {
        walk(node, fn);
      }
    } while (node = node.nextSibling);
  }
  return div.innerHTML;
}

function wrap(target, key) { // key can probably be removed here..
  const newtarget = $('<div></div>');
  nodes = target.contents().clone(); // the clone is critical!
  if (key === true) { // We can probably remove all of thise..
    var key = 0; // Key allows us to increemnt an index inside recursion
  }
  nodes.each(function () {
    if (this.nodeType == 3) { // text
      let newhtml = '';
      const text = this.wholeText; // maybe "textContent" is better?
      for (let i = 0; i < text.length; i++) {
        if (text[i] == ' ') {
          newhtml += `<span data-key=${globalKey}> </span>`;
        } else {
          newhtml += `<span data-key=${globalKey}>${text[i]}</span>`;
        }
        key++;
        globalKey++;
      }
      newtarget.append($(newhtml));
    } else { // recursion FTW!
      $(this).html(wrap($(this), key)); // This really hurts doing any sort of count..
      newtarget.append($(this));
    }
  });
  return newtarget.html();
}

exports.postAceInit = function (hook_name, context) {
  iT.hide();
  const ace = context.ace;
  const pad = context.pad;

  const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
  padOuter.on('click', () => {
    iT.hide();
  });
  $('#inline_toolbar [data-key]').each(function () {
    $(this).unbind('click');
    const command = $(this).data('key');

    if ($(this).data('type') === 'link') {
      $(this).addClass('link');
      const spanItem = $(this).find('span.buttonicon')[0];
      const translationId = $(spanItem).data('l10n-id');

      $(spanItem).html(html10n.get(translationId));
    }
    $(this).on('click', function () {
      iT.hide();
      padEditBar.triggerCommand(command, $(this));
    });
  });

  $('#inline_toolbar').detach().appendTo(padOuter[0]);
};

var lastLineSelectedIsEmpty = function (rep, lastLineSelected) {
  const line = rep.lines.atIndex(lastLineSelected);
  // when we've a line with line attribute, the first char line position
  // in a line is 1 because of the *, otherwise is 0
  const firstCharLinePosition = (line.lineMarker === 1) ? 1 : 0;
  const lastColumnSelected = rep.selEnd[1];

  return lastColumnSelected === firstCharLinePosition;
};

var getLastLine = function (rep) {
  const firstLine = rep.selStart[0];
  let lastLineSelected = rep.selEnd[0];

  if (lastLineSelected > firstLine) {
    // Ignore last line if the selected text of it it is empty
    if (lastLineSelectedIsEmpty(rep, lastLineSelected)) {
      lastLineSelected--;
    }
  }
  return lastLineSelected;
};

var getLineAtIndex = function (index) {
  return this.rep.lines.atIndex(index);
};

var isHeading = function (index) {
  var index;
  if (clientVars.ep_inline_toolbar.position === 'top') {
    index = this.rep.selStart[0];
  } else {
    index = getLastLine(this.rep);
  }
  const attribs = this.documentAttributeManager.getAttributesOnLine(index);
  for (let i = 0; i < attribs.length; i++) {
    if (attribs[i][0] === 'heading') {
      const value = attribs[i][1];
      i = attribs.length;
      return value;
    }
  }
  return false;
};

var getSelectedLineElement = function () {
  let index;
  if (clientVars.ep_inline_toolbar.position === 'top') {
    index = this.rep.selStart[0];
  } else {
    index = getLastLine(this.rep);
  }

  const selectedLine = this.rep.lines.atIndex(index);
  return selectedLine;
};

exports.aceInitialized = function (hook, context) {
  getSelectedLineElement = _(getSelectedLineElement).bind(context);
  getLineAtIndex = _(getLineAtIndex).bind(context);
  isHeading = _(isHeading).bind(context);
};

exports.postToolbarInit = function (hook, context) {
  if (clientVars.inlineButtons && clientVars.inlineButtons.length) {
    $.each(clientVars.inlineButtons, (key, item) => {
      $('#inline_toolbar_menu_items').append(item);
    });
  }
};
