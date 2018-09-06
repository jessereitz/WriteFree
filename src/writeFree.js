// writeFree.js

import editorBase from './Editor.js';

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
  const defaultOptions = {
    divOrPar: 'p',
    sectionClass: null,
    sectionStyle: null,
    containerClass: 'wf__editor',
    containerStyle: null,
    largeHeadingClass: null,
    largeHeadingStyle: null,
    smallHeadingClass: null,
    smallHeadingStyle: null,
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
  window.options = options;

  /**
   * Editor - The main object representing the WriteFree editor.
   *
   * @property {Element} $ctn - The outermost container of the WriteFree editor.
   *  $ctn is passed in to the WriteFree instantiation function.
   * @property {Element} $innerCtn - The actual contetneditable-div in which the
   *  user can write
   */
  const Editor = Object.create(editorBase);

  Editor.initWFEditor($ctn, options);
  return {
    getHTML: Editor.getHTML.bind(Editor),
  };
}

const options = {
  divOrPar: 'div',
  sectionClass: 'testSection',
  sectionStyle: {
    // color: '#fff',
  },
  containerClass: 'testContainer',
  containerStyle: {
    // background: '#333',
  },
};

window.wf = WriteFree(document.getElementById('WriteFreeCtn'), options);
