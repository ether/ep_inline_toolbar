var _, $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie;
var globalKey = 0;

iT = {
  hide: function(){
    var padOuter = $('iframe[name="ace_outer"]').contents().find("body");
    var inlineToolbar = padOuter.find("#inline_toolbar");
    $(inlineToolbar).hide();
  },
  show: function(selStart, selEnd){
    var XY = getXYOffsetOfRep(selStart, selEnd);
    this.draw(XY);
    var padOuter = $('iframe[name="ace_outer"]').contents().find("body");
    var inlineToolbar = padOuter.find("#inline_toolbar");
    $(inlineToolbar).show();
  },
  draw: function(XY){
    drawAt(XY);
  }
}

exports.aceSelectionChanged = function(hook, context){
  var selStart = context.rep.selStart;
  var selEnd = context.rep.selEnd;
  if((selStart[0] !== selEnd[0]) || (selStart[1] !== selEnd[1])){
    // console.log("selection made, showing inline toolbar");
    iT.show(selStart, selEnd);
  }else{
    iT.hide();
  }
}

exports.aceEditorCSS = function(hook, context){
}

// Given a rep we get the X and Y px offset
function getXYOffsetOfRep(selStart, selEnd){
  var padOuter = $('iframe[name="ace_outer"]').contents();
  var padInner = padOuter.find('iframe[name="ace_inner"]');
  var x = selStart[1];
  var y = selEnd[0];
  y = y+1;
  var inner = $('iframe[name="ace_outer"]').contents().find('iframe');
  var innerWidth = inner.contents().find('#innerdocbody').width();

  // it appears on apple devices this might not be set properly?
  if($(inner)[0]){
    var leftOffset = $(inner)[0].offsetLeft +3;
  }else{
    var leftOffset = 0;
  }

  var stickUp = false;
  var stickLeft = true;

  // Get the target Line
  var div = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').find("div:nth-child("+y+")");
  var divWidth = div.width();

  // Is the line visible yet?
  if ( div.length !== 0 ) {
    var top = $(div).offset().top -10; // A standard generic offset

    // Get the HTML
    var html = $(div).html();

    // if Div contains block attribute IE h1 or H2 then increment by the number
    if ( $(div).children("span").length < 1 ){ x = x - 1; }// This is horrible but a limitation because I'm parsing HTML

    // Get the new string but maintain mark up
    var newText = html_substr(html, (x));

    // A load of fugly HTML that can prolly be moved ot CSS
    var newLine = "<span style='width:"+divWidth+"px' id='hiddenWorker' class='ghettoCursorXPos'>"+newText+"</span>";
    // GlobalKey
    globalKey = 0;

    // Add the HTML to the DOM
    var worker = $('iframe[name="ace_outer"]').contents().find('#outerdocbody').append(newLine);

    // Get the worker element
    var worker = $('iframe[name="ace_outer"]').contents().find('#outerdocbody').find("#hiddenWorker");

    // add some CSS to the worker
    $(worker).css({
      "white-space":"pre-wrap",
      "word-wrap":"break-word",
      "z-index":"99999",
      "background":"red",
      "position":"fixed",
      "top":"80px",
      "left":"33px",
      "margin-right":"10px",
      "font-size":"12px",
      "line-height":"16px"
    })

    // Wrap teh HTML in spans so we cna find a char
    $(worker).html(wrap($(worker), true));
    // console.log($(worker).html(), x);

    // Get the Left offset of the x span
    var span = $(worker).find("[data-key="+(x-1)+"]");

    // Get the width of the element (This is how far out X is in px);
    if(span.length !== 0){
      var left = span.position().left;
    }else{
      var left = 0;
    }

    // Get the height of the element minus the inner line height
    var height = worker.height(); // the height of the worker
    top = top + height - span.height(); // plus the top offset minus the actual height of our focus span

    if(top <= 0){  // If the tooltip wont be visible to the user because it's too high up
      stickUp = true;
      top = top + (span.height()*2);
      if(top < 0){ top = 0; } // handle case where caret is in 0,0
    }

    // Add the innerdocbody offset
    left = left + leftOffset;

    // Add support for page view margins
    var divMargin = $(div).css("margin-left");
    var innerdocbodyMargin = $(div).parent().css("margin-left"); 
    if(innerdocbodyMargin){
      innerdocbodyMargin = innerdocbodyMargin.replace("px", "");
      innerdocbodyMargin = parseInt(innerdocbodyMargin);
    }else{
      innerdocbodyMargin = 0;
    }
    if(divMargin){
      divMargin = divMargin.replace("px", "");
      // console.log("Margin is ", divMargin);
      divMargin = parseInt(divMargin);
      if((divMargin + innerdocbodyMargin) > 0){
        // console.log("divMargin", divMargin);
        left = left + divMargin;
      }
    }

    // Remove the element
    $('iframe[name="ace_outer"]').contents().find('#outerdocbody').contents().remove("#hiddenWorker");
    return [left, top];
  }
}

// Draws the toolbar onto the screen
function drawAt(XY){
  var padOuter = $('iframe[name="ace_outer"]').contents().find("body");
  var toolbar = padOuter.find("#inline_toolbar");
  if(toolbar.length === 0){
    padOuter.append("<div id='inline_toolbar' class='toolbar'></div>");
    var toolbar = padOuter.find("#inline_toolbar");
    $('.menu_left').clone(true, true).appendTo(toolbar);
    $(toolbar).find(".menu_left").css("right", "0px");
    $(toolbar).find(".menu_left").css("margin-left", "0px");
    $(toolbar).css("background", "none");
    $(toolbar).css("border-bottom", "none");
    $(toolbar).css("max-width", "30%");
  }
  var toolbar = padOuter.find("#inline_toolbar");

  toolbar.css({
    "position": "absolute"
  });
  $(toolbar).css("left", XY[0]);
  $(toolbar).css("top", XY[1]-20);
}



function html_substr( str, count ) {
  if( browser.msie ) return ""; // IE can't handle processing any of the X position stuff so just return a blank string
  // Basically the recursion makes IE run out of memory and slows a pad right down, I guess a way to fix this would be to
  // only wrap the target / last span or something or stop it destroying and recreating on each change..  
  // Also IE can often inherit the wrong font face IE bold but not apply that to the whole document ergo getting teh width wrong
  var div = document.createElement('div');
  div.innerHTML = str;

  walk( div, track );

  function track( el ) {
    if( count > 0 ) {
      var len = el.data.length;
      count -= len;
      if( count <= 0 ) {
        el.data = el.substringData( 0, el.data.length + count );
      }
    } else {
      el.data = '';
    }
  }

  function walk( el, fn ) {
    var node = el.firstChild;
    if(!node) return;
    do {
      if( node.nodeType === 3 ) {
        fn(node);
        //          Added this >>------------------------------------<<
      } else if( node.nodeType === 1 && node.childNodes && node.childNodes[0] ) {
        walk( node, fn );
      }
    } while( node = node.nextSibling );
  }
  return div.innerHTML;
}

function wrap(target, key) { // key can probably be removed here..
 var newtarget = $("<div></div>");
  nodes = target.contents().clone(); // the clone is critical!
  if(key === true){ // We can probably remove all of thise..
    var key = 0; // Key allows us to increemnt an index inside recursion
  }
  nodes.each(function() {
    if (this.nodeType == 3) { // text
      var newhtml = "";
      var text = this.wholeText; // maybe "textContent" is better?
      for (var i=0; i < text.length; i++) {
        if (text[i] == ' '){
          newhtml += "<span data-key="+globalKey+"> </span>";
        }
        else
        { 
          newhtml += "<span data-key="+globalKey+">" + text[i] + "</span>";
        }
        key++;
        globalKey++;
      }
      newtarget.append($(newhtml));
    }
    else { // recursion FTW!
      // console.log("recursion"); // IE handles recursion badly
      $(this).html(wrap($(this), key)); // This really hurts doing any sort of count..
      newtarget.append($(this));
    }
  });
  return newtarget.html();
}
