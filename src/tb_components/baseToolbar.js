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
   * @param {Editor} editor The Editor which owns this Toolbar.
   * @param {Object} options The initialization options provided by the user.
   *
   * @returns {Toolbar} Returns this.
   */
  initToolbar(editor, options) {
    this.options = options;
    this.editor = editor;
    this.toolbarOffset = toolbarOffset;
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
   * getButtonsWidth - Returns the width of the button container.
   *
   * @returns {number} The width of the button container.
   */
  getButtonsWidth() {
    const childNodes = this.$btnCtn.children;
    const boundingRect = childNodes[0].getBoundingClientRect();
    return boundingRect.width * (childNodes.length * 1.1);
  },

  /**
   * getButtonsWidth - Returns the height of the button container.
   *
   * @returns {number} The height of the button container.
   */
  getButtonsHeight() {
    const boundingRect = this.$btnCtn.firstChild.getBoundingClientRect();
    return boundingRect.height * 1.25;
  },

  /**
   * hideButtons - Hides the buttons contained within the Toolbar so the input
   *  can be displayed.
   *
   */
  hideButtons() {
    this.$ctn.style.width = `${this.input.getWidth()}px`;
    this.$ctn.style.height = `${this.input.getHeight()}px`;
    this.$btnCtn.classList.add(tbClass.hideUp);
  },

  /**
   * displayButtons - Displays the buttons in the Toolbar.
   *
   */
  displayButtons() {
    this.$btnCtn.classList.remove(tbClass.hideUp);
    this.$ctn.style.width = `${this.getButtonsWidth()}px`;
    this.$ctn.style.height = `${this.getButtonsHeight()}px`;
  },

  displayInput(placeholder) {
    const sel = window.getSelection();
    this.currentRange = sel.getRangeAt(0);
    this.input.display(placeholder);
  },

  hideInput() {

  },

  /**
  * positionToolbar - Positions the Toolbar at the appropriate place based on
  *  the current range.
  *
  */
  positionToolbar() {
    const sel = window.getSelection();
    this.currentRange = sel.getRangeAt(0);
    let rect = null;
    if (this.currentRange.collapsed) {
      rect = this.currentRange.commonAncestorContainer.getBoundingClientRect();
    } else {
      rect = this.currentRange.getBoundingClientRect();
    }
    const toolbarRect = this.$ctn.getBoundingClientRect();
    const bottomPos = rect.bottom + this.toolbarOffset + toolbarRect.height;
    console.log(window.innerHeight);
    // console.log(window.scrollY);
    console.log(bottomPos);
    console.log(toolbarRect);
    if (bottomPos >= window.innerHeight) {
      this.$ctn.style.top = `${rect.top - (this.toolbarOffset + toolbarRect.height)}px`;
    } else {
      this.$ctn.style.top = `${rect.bottom + this.toolbarOffset}px`;
    }
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
    this.input.hide(false);
    this.$ctn.classList.remove('hide');
    this.positionToolbar();
    this.displayButtons();
    return true;
  },

  /**
   * hide - Hides the Toolbar.
   *
   * @returns {boolean} Returns true if successful else false.
   */
  hide() {
    this.currentRange = null;
    this.input.hide(false);
    this.displayButtons();
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

  contains(node) {
    return this.$ctn.contains(node);
  },
};

export default BaseToolbar;
