var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = require('ep_etherpad-lite/node/utils/Settings');

var _ = require('underscore');

var inlineMenuItems;
var inlineButtons = [];

exports.loadSettings = function (hook_name, context) {
    inlineMenuItems = context.settings.toolbar.inline;
};

exports.clientVars = function(hook, context, callback)
{
  // tell the client which year we are in
  return callback({ "ep_inline_toolbar": settings.ep_inline_toolbar });
};

exports.padInitToolbar = function (hook_name, context) {
    var availableButtons = context.toolbar.availableButtons;

    inlineButtons = [];
    inlineMenuItems.forEach(function (inlineBlock) {
        if (_.isArray(inlineBlock)) {
            var buttons = [];
            inlineBlock.forEach(function (buttonName) {
              var buttonType = null;
              var buttonTitle = null;
              var localizationId = null;
                if (_.isObject(buttonName)) {
                  var objKey = Object.keys(buttonName)[0];
                  var keySettings = buttonName[objKey];
                  buttonType = keySettings.buttonType;
                  buttonTitle = keySettings.title;
                  localizationId = keySettings.localizationId;
                  buttonName = objKey;
                }

                if (availableButtons[buttonName]) {
                    var buttonItem = availableButtons[buttonName];
                    if (availableButtons[buttonName].attributes) {
                      buttonItem = availableButtons[buttonName].attributes;
                    }

                    if (localizationId) {
                      buttonItem.localizationId = localizationId;
                      buttonTitle = localizationId;
                    }
                    buttonItem = context.toolbar.button(buttonItem);
                    
                    var buttonHtml = buttonItem.render();

                    if (buttonType === 'link') {
                      buttonHtml = buttonHtml.replace('<button', '<span').replace('</button>', '</span>').replace('data-type="button"', 'data-type="link"');
                    }

                    if (buttonTitle) {
                      buttonHtml = buttonHtml.replace('</span>', buttonTitle +'</span>');
                    }

                    buttons.push(buttonHtml);
                }   
              });

            inlineButtons.push(buttons);
        }
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
