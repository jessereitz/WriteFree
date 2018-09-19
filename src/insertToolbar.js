import { validateURL } from './writeFreeLib.js';

import BaseToolbar from './tb_components/baseToolbar.js';
import ToolbarButton from './tb_components/tbButton.js';

// Create the InsertToolbar from the BaseToolbar.
const insertToolbar = Object.create(BaseToolbar);

/**
 * init - Initialize the insertToolbar. Callse the BaseToolbar's initialization
 *  method then sets up the requisite buttons and input.
 *
 * @param {Editor} editor The Editor which owns this Toolbar.
 * @param {Object} options The initialization options provided by the user.
 *
 * @returns {InsertToolbar} Returns this.
 */
insertToolbar.init = function init(editor, options) {
  this.initToolbar(editor, options);
  this.toolbarOffset = 15;
  this.createToolbarBtns();
  this.input.init(this.hideImageInput.bind(this), this.$ctn);
  this.input.$input.id = 'input';
  return this;
};

/**
 * createToolbarBtns - Creates the requisite buttons for this toolbar. The
 *  insertToolbar allows users to insert images and horizontal rules so this
 *  method creates buttons to allow the user to do these things.
 *
 */
insertToolbar.createToolbarBtns = function createToolbarBtns() {
  this.imgBtn = Object.create(ToolbarButton);
  this.imgBtn.init('🖼️', 'Insert an Image', this.displayImgInput.bind(this), this.$btnCtn);
  this.lineBtn = Object.create(ToolbarButton);
  this.lineBtn.init('--', 'Insert a Horizontal Rule', this.editor.insertLine.bind(this.editor), this.$btnCtn);
};

/**
 * toggleDisabledButtons - Toggles the disabled buttons. If the user is
 *  currently in the first section, they cannot add a horizontal rule.
 *
 */
insertToolbar.toggleDisabledButtons = function toggleDisabledButtons() {
  const sel = window.getSelection();
  if (this.editor.isFirst(sel.anchorNode)) {
    this.lineBtn.disable();
  } else {
    this.lineBtn.enable();
  }
};

/**
 * displayImgInput - Displays the input for adding an image.
 *
 */
insertToolbar.displayImgInput = function displayImgInput() {
  const sel = window.getSelection();
  this.currentRange = sel.getRangeAt(0);
  this.input.setSaveHandler(this.insertImage.bind(this));
  this.input.preventHideOnEnter = true;
  this.hideButtons();
  this.input.display('Type an image URL...');
};


/**
 * hideImageInput - Hides the input for adding an image.
 *
 */
insertToolbar.hideImageInput = function hideImageInput() {
  this.imgURL = null;
  this.displayButtons();
};

/**
 * insertImage - This function acts as the saveHandler for the image input. The
 *  input first prompts the user to provide a url, then alt text. If the user
 *  has not yet provided the image url, it will take the value from the input
 *  and store it as the image url, prompting the user for the alt text. Once
 *  this has been provided, the function passes control to the editor and closes
 *  itself.
 *
 */
insertToolbar.insertImage = function insertImage() {
  if (!this.imgURL) {
    this.imgURL = validateURL(this.input.getValue());
    if (!this.imgURL) {
      this.input.clear('Type an image URL...');
    } else {
      this.input.clear('Enter alt text...');
    }
  } else {
    this.editor.insertImage(this.imgURL, this.input.getValue(), this.currentRange.startContainer);
    this.input.hide();
    this.displayButtons();
    this.hide();
  }
};

/**
 * display - Displays the InsertToolbar.
 *
 * @returns {boolean} Returns true if the InsertToolbar was successfully
 *  displayed. Else returns false.
 */
insertToolbar.display = function display() {
  this.toggleDisabledButtons();
  return this.baseDisplay();
};

// Export the InsertToolbar for use elsewhere.
export default insertToolbar;
