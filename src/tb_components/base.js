import {
  generateElement,
} from '../writeFreeLib.js';

import tbClass from './tbClasses.js';
import ToolbarInput from './tbInput.js';


// The number of pixels by which to offset the top of the toolbar.
const toolbarOffset = 5;

/**
 * Toolbar - The toolbar used for editing text in the WFEditor.
 *
 * @property {Element} $ctn - The div containing the toolbar. This div is
 *  created in the initToolbar method.
 * @property {Element} $boldBtn - When clicked, bolds current selection.
 * @property {Element} $italicBtn - When clicked, italicizes current selection.
 * @property {Element} $headingBtn - When clicked, changes the section of the
 *  current selection to a heading (h3).
 * @property {Element} linkBtn - When clicked, presents a box for inserting a
 *  URL, then uses that URL to turn current selection into a hyperlink.
 */
const BaseToolbar = {

  /**
   * initToolbar - Initializes the Toolbar.
   *
   * @returns {Toolbar} Returns this.
   */
  initToolbar(editor, options) {
    this.options = options;
    this.editor = editor;
    this.$ctn = generateElement(
      'div',
      [tbClass.main, 'hide'],
      { contenteditable: false },
    );
    this.$btnCtn = generateElement('div', tbClass.btnCtn);
    this.$ctn.appendChild(this.$btnCtn);

    // this.createToolbarBtns();
    this.input = Object.create(ToolbarInput);
    this.editor.$ctn.appendChild(this.$ctn);
    return this;
  },

  /**
   * hideButtons - Hides the buttons contained within the Toolbar so the input
   *  can be displayed.
   *
   */
  hideButtons() {
    this.$btnCtn.classList.add(tbClass.hideUp);
    this.$ctn.classList.add(tbClass.wide);
  },

  /**
   * displayButtons - Displays the buttons in the Toolbar.
   *
   */
  displayButtons() {
    this.$btnCtn.classList.remove(tbClass.hideUp);
    this.$ctn.classList.remove(tbClass.wide);
  },

  /**
  * positionToolbar - Positions the Toolbar at the appropriate place based on
  *  the current range.
  *
  */
  positionToolbar() {
    const rect = this.currentRange.getBoundingClientRect();
    this.$ctn.style.top = `${rect.bottom + toolbarOffset}px`;
    this.$ctn.style.left = `${rect.left}px`;
  },

  /**
   * display - Optionally display the Toolbar next to the given selection.
   *  The Toolbar is always returned as an HTML element.
   *
   * @param {Selection} [sel=null] The Selection next to which the Toolbar should be
   *  displayed.
   *
   * @returns {boolean} Returns true if the Toolbar is displayed. Else false.
   */
  baseDisplay() {
    this.positionToolbar();
    this.$ctn.classList.remove('hide');
    return true;
  },

  /**
   * hide - Hides the Toolbar.
   *
   * @returns {boolean} Returns true if successful else false.
   */
  hide() {
    this.currentRange = null;
    this.displayButtons();
    this.input.hide(false);
    this.$ctn.classList.add('hide');
    if (this.$ctn.classList.contains('hide')) {
      return true;
    }
    return false;
  },

  /**
   * html - Render the Toolbar as HTML
   *
   * @returns {Element} The Toolbar as HTML.
   */
  html() {
    return this.$ctn;
  },
};

export default BaseToolbar;