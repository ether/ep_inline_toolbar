var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = require('ep_etherpad-lite/node/utils/Settings');

var _ = require('underscore');

var inlineMenuItems;
var inlineButtons = [];

exports.loadSettings = function (hook_name, context) {
    inlineMenuItems = context.settings.toolbar.inline;
};

exports.padInitToolbar = function (hook_name, context) {
    var availableButtons = context.toolbar.availableButtons;
    inlineButtons = [];
    inlineMenuItems.forEach(function (inlineBlock) {
        if (_.isArray(inlineBlock)) {
            var buttons = [];
            inlineBlock.forEach(function (buttonName) {
                if (availableButtons[buttonName]) {
                    var buttonItem = context.toolbar.button(availableButtons[buttonName]);

                    buttons.push(buttonItem.render());
                }   
              });

            inlineButtons.push(buttons);
        }
        console.log(inlineButtons);
    });
};

exports.eejsBlock_body = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_inline_toolbar/templates/menuButtons.ejs", {
    buttons: inlineButtons
  });
  return cb();
};

exports.eejsBlock_mySettings = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_inline_toolbar/templates/settings.ejs");
  return cb();
};

exports.eejsBlock_scripts = function (hook_name, args, cb) {
  return cb();
};


// not used
exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_inline_toolbar/templates/styles.html", {}, module);
  return cb();
};


// not used
exports.clientVars = function (hook, context, cb) {
  var displayCommentAsIcon = settings.ep_inline_toolbar ? settings.ep_inline_toolbar.displayCommentAsIcon : false;
  return cb({ "displayCommentAsIcon": displayCommentAsIcon });
};

