import BaseToolbar from './tb_components/base.js';
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

insertToolbar.displayImgInput = function displayImgInput() {
  const sel = window.getSelection();
  this.currentRange = sel.getRangeAt(0);
  this.input.setSaveHandler(this.insertImage.bind(this));
  this.input.preventHideOnEnter = true;
  this.hideButtons();
  this.input.display('Type an image URL...');
};

insertToolbar.hideImageInput = function hideImageInput() {
  this.imgURL = null;
  this.displayButtons();
};

insertToolbar.insertImage = function insertImage() {
  if (!this.imgURL) {
    this.imgURL = this.input.getValue();
    this.input.clear('Enter alt text...');
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
  return this.baseDisplay();
};

// Export the InsertToolbar for use elsewhere.
export default insertToolbar;
