'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');
const _ = require('ep_etherpad-lite/node_modules/underscore');

let inlineMenuItems;
let inlineButtons = [];

exports.loadSettings = function (hook_name, context) {
  inlineMenuItems = context.settings.toolbar.inline;
};

exports.clientVars = function (hook, context, callback) {
  // tell the client which year we are in
  createInlineToolbar();
  return callback({ep_inline_toolbar: settings.ep_inline_toolbar || {}, inlineButtons});
};

var createInlineToolbar = function () {
  const toolbar = this.toolbar;
  if (toolbar) {
    const availableButtons = toolbar.availableButtons;
    inlineButtons = [];
    if(inlineButtons.length === 0) return;
    inlineMenuItems.forEach((inlineBlock) => {
      if (_.isArray(inlineBlock)) {
        const buttons = [];
        inlineBlock.forEach((buttonName) => {
          let buttonType = null;
          let buttonTitle = null;
          let localizationId = null;
          if (_.isObject(buttonName)) {
            const objKey = Object.keys(buttonName)[0];
            const keySettings = buttonName[objKey];
            buttonType = keySettings.buttonType;
            buttonTitle = keySettings.title;
            localizationId = keySettings.localizationId;
            buttonName = objKey;
          }

          if (availableButtons[buttonName]) {
            let buttonItem = availableButtons[buttonName];
            if (availableButtons[buttonName].attributes) {
              buttonItem = availableButtons[buttonName].attributes;
            }

            if (localizationId) {
              buttonItem.localizationId = localizationId;
              buttonTitle = localizationId;
            }
            buttonItem = toolbar.button(buttonItem);

            let buttonHtml = buttonItem.render();

            if (buttonType === 'link') {
              buttonHtml = buttonHtml.replace('<button', '<span').replace('</button>', '</span>').replace('data-type="button"', 'data-type="link"');
            }

            if (buttonTitle) {
              buttonHtml = buttonHtml.replace('</span>', `${buttonTitle}</span>`);
            }

            buttons.push(buttonHtml);
          }
        });

        inlineButtons.push(buttons);
      }
    });
  }
};


exports.padInitToolbar = function (hook_name, context) {
  createInlineToolbar = _(createInlineToolbar).bind(context);
};


exports.eejsBlock_body = function (hook_name, args, cb) {
  args.content += eejs.require('ep_inline_toolbar/templates/menuButtons.ejs');

  return cb();
};

exports.eejsBlock_mySettings = function (hook_name, args, cb) {
  args.content += eejs.require('ep_inline_toolbar/templates/settings.ejs');
  return cb();
};

exports.eejsBlock_scripts = function (hook_name, args, cb) {
  return cb();
};


// not used
exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content += eejs.require('ep_inline_toolbar/templates/styles.html', {}, module);
  return cb();
};
