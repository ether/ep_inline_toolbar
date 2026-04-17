![Publish Status](https://github.com/ether/ep_inline_toolbar/workflows/Node.js%20Package/badge.svg) [![Backend Tests Status](https://github.com/ether/ep_inline_toolbar/actions/workflows/test-and-release.yml/badge.svg)](https://github.com/ether/ep_inline_toolbar/actions/workflows/test-and-release.yml)

![Screenshot](https://user-images.githubusercontent.com/220864/107128330-a6657100-68b4-11eb-96f1-eec53579b1fd.png)

# Inline toolbar for Etherpad

A simple way to add the toolbar buttons inline on the editor.  These buttons only appear when you highlight text.

# Usage
To change the visible buttons, the buttons must be added to settings.json in the toolbar section as a section called ``inline`` else all formatting buttons will be visible.

For example..

```
  "toolbar": {
    "left": [
      ["bold", "italic", "underline", "strikethrough"],
      ["orderedlist", "unorderedlist", "indent", "outdent"],
      ["undo", "redo"],
      ["clearauthorship"]
    ],
    "right": [
      ["importexport", "timeslider", "savedrevision"],
      ["settings", "embed"],
      ["showusers"]
    ],
    "timeslider": [
      ["timeslider_export", "timeslider_returnToPad"]
    ],
    "inline":[["bold", "italic"]]
  },
```

The above example will make bold and italic show up inline.

# License

Apache 2

## Installation

Install from the Etherpad admin UI (**Admin → Manage Plugins**,
search for `ep_inline_toolbar` and click *Install*), or from the Etherpad
root directory:

```sh
pnpm run plugins install ep_inline_toolbar
```

> ⚠️ Don't run `npm i` / `npm install` yourself from the Etherpad
> source tree — Etherpad tracks installed plugins through its own
> plugin-manager, and hand-editing `package.json` can leave the
> server unable to start.

After installing, restart Etherpad.
