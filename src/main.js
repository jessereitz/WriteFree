// writeFree.js

import editorBase from './Editor.js';

const defaultContainerStyle = {
  'min-height': '2em',
  'max-width': '100%',
  margin: '1em auto',
  padding: '0em 1.5rem',
  'font-size': '1.25rem',
  'font-family': "'Crimson Text', serif",
  outline: 'none',
  color: '#333',
};

const defaultSectionStyle = {
  'font-size': '1.25rem',
  'max-width': '35rem',
  'margin-left': 'auto',
  'margin-right': 'auto',
};

const defaultLargeHeadingStyle = Object.create(defaultSectionStyle);
defaultLargeHeadingStyle['font-size'] = '2rem';

const defaultSmallHeadingStyle = Object.create(defaultSectionStyle);
defaultSmallHeadingStyle['font-size'] = '1.5rem';

const defaultImgStyle = Object.create(defaultSectionStyle);
defaultImgStyle['max-width'] = '100%';


/**
 * WriteFree - The initialization function used to create instances of the
 *  WriteFree editor.
 *
 * @param {Element} $ctn - The empty HTML Element, usually a div to be used as the
 *  container for the WriteFree editor.
 *
 * @returns {Editor} The WriteFree editor.
 */
function WriteFree($ctn, userOptions = {}) {
  const cssLink = document.createElement('link');
  cssLink.setAttribute('href', './css/site.css');
  cssLink.setAttribute('rel', 'stylesheet');
  cssLink.setAttribute('type', 'text/css');
  document.getElementsByTagName('head')[0].appendChild(cssLink);
  const defaultOptions = {
    divOrPar: 'p',
    sectionClass: '',
    sectionStyle: defaultSectionStyle,
    containerClass: 'wf__editor',
    containerStyle: defaultContainerStyle,
    largeHeadingClass: '',
    largeHeadingStyle: defaultLargeHeadingStyle,
    smallHeadingClass: '',
    smallHeadingStyle: defaultSmallHeadingStyle,
    imgClass: '',
    imgStyle: defaultImgStyle,
  };

  const options = (function setOptions() {
    const globalOptions = Object.create(defaultOptions);
    if (userOptions && typeof userOptions === 'object') {
      Object.keys(userOptions).forEach((option) => {
        globalOptions[option] = userOptions[option];
      });
    }
    return globalOptions;
  }());

  // Create and initialize the editor.
  const Editor = Object.create(editorBase);
  Editor.initWFEditor($ctn, options);

  return {
    html: Editor.html.bind(Editor),
  };
}
export default WriteFree;
