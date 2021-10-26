# posledniy

This is the repository for posledniy, an open-source text expander for chrome.



## Design goals

  * Pico weight - extremely light, <100 lines of code.
  * Easy to modify
  * Easy to audit - no minification, no obfuscation, no bullshit.
  * Manifest V3 - this requires Chrome 88 or higher, but is reasonably future proof.
  * Minimal permissions - by design, can not access your browsing history or other data.

## Installation

1. Clone this project
2. In Chrome | Extensions, enable Developer Mode.
3. Click "load unpacked", choose the project folder.

## License

**BSD**

This was designed to be a drop-in library for other extensions - if you are interested
in bundling posledniy with your extension, please pay special attention to the 3rd clause
of the BSD license.

Other licenses may be granted on request.


