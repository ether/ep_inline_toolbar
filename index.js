var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = require('ep_etherpad-lite/node/utils/Settings');

exports.eejsBlock_dd_insert = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_inline_toolbar/templates/menuButtons.ejs");
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

