'use strict';

const {template} = require('ep_plugin_helpers');

const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');

exports.loadSettings = (hookName, context, cb) => {
  cb();
};

exports.clientVars = (hookName, context, callback) => {
  const settingsObj = settings.toolbar.inline || settings.toolbar;
  callback({
    ep_inline_toolbar: settingsObj,
  });
};

exports.eejsBlock_body =
    template('ep_inline_toolbar/templates/menuButtons.ejs');

exports.eejsBlock_mySettings =
    template('ep_inline_toolbar/templates/settings.ejs');

exports.eejsBlock_scripts = (hookName, args, cb) => {
  cb();
};


// not used
exports.eejsBlock_styles =
    template('ep_inline_toolbar/templates/styles.html');
