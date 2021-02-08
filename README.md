![Publish Status](https://github.com/ether/ep_inline_toolbar/workflows/Node.js%20Package/badge.svg) ![Backend Tests Status](https://github.com/ether/ep_inline_toolbar/workflows/Backend%20tests/badge.svg)

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
