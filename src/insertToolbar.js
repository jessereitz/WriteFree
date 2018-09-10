import BaseToolbar from './tb_components/base.js';
import ToolbarButton from './tb_components/tbButton.js';
// import tbClass from './tb_components/tbClasses.js';


const insertToolbar = Object.create(BaseToolbar);

insertToolbar.init = function init(editor, options) {
  this.initToolbar(editor, options);
  this.createToolbarBtns();
  this.input.init(this.displayButtons.bind(this), this.$ctn);
  return this;
};

insertToolbar.createToolbarBtns = function createToolbarBtns() {
  this.imgBtn = Object.create(ToolbarButton);
  this.imgBtn.init('&#128444;', 'Insert an Image', this.insertImage.bind(this), this.$btnCtn);
  this.lineBtn = Object.create(ToolbarButton);
  this.lineBtn.init('--', 'Insert a Horizontal Rule', this.editor.insertLine.bind(this.editor), this.$btnCtn);
};

insertToolbar.insertImage = function insertImage() {
  this.hideButtons();
  this.input.display('Type an image URL...');
};

insertToolbar.display = function display() {
  return this.baseDisplay();
};

export default insertToolbar;
