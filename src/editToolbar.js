import {
  // generateElement,
  findNodeType,
  containsSelection,
} from './writeFreeLib.js';

import BaseToolbar from './tb_components/base.js';
// import tbClass from './tb_components/tbClasses.js';
import ToolbarButton from './tb_components/tbButton.js';
// import ToolbarInput from './tb_components/tbInput.js';

const editToolbar = Object.create(BaseToolbar);

editToolbar.init = function init(editor, options) {
  this.initToolbar(editor, options);
  this.input.init(this.displayButtons.bind(this), this.$ctn);
  this.createToolbarBtns();
  return this;
};

/**
 * createToolbarBtns - Create the buttons to be included on the toolbar, add
 *  appropriate event listeners, and attaches them to the $ctn.
 */
editToolbar.createToolbarBtns = function createToolbarBtns() {
  this.boldBtn = Object.create(ToolbarButton);
  this.boldBtn.init('<b>B</b>', this.editor.boldSelection.bind(this.editor), this.$btnCtn);
  this.italicBtn = Object.create(ToolbarButton);
  this.italicBtn.init('<i>i</i>', this.editor.italicizeSelection.bind(this.editor), this.$btnCtn);
  this.headingBtn = Object.create(ToolbarButton);
  this.headingBtn.init('H', this.editor.wrapHeading.bind(this.editor), this.$btnCtn);
  this.linkBtn = Object.create(ToolbarButton);
  this.linkBtn.init('&#128279;', this.linkBtnHandler.bind(this), this.$btnCtn);
};

/**
 * toggleDisabledButtons - Disables buttons as necessary. As of now, if a the
 *  current selection contains a heading, all buttons other than the heading
 *  button are disabled.
 *
 * @param {Range} range The current range.
 *
 */
editToolbar.toggleDisabledButtons = function toggleDisabledButtons() {
  if (
    findNodeType(this.currentRange.commonAncestorContainer, 'H1')
    || findNodeType(this.currentRange.commonAncestorContainer, 'H2')
  ) {
    this.linkBtn.disable();
    this.boldBtn.disable();
    this.italicBtn.disable();
  } else {
    this.linkBtn.enable();
    this.boldBtn.enable();
    this.italicBtn.enable();
  }
};

/**
 * toggleActiveLink - If ads the active class to the link button if the
 *  current selection contains a link. It also attaches a currentLink
 *  attribute to the link button so the link can be removed.
 *
 * @param {Selection} sel The current selection.
 *
 */
editToolbar.toggleActiveLink = function toggleActiveLink(sel) {
  const range = sel.getRangeAt(0);
  const currentLink = findNodeType(range.commonAncestorContainer, 'A');
  if (currentLink && sel.containsNode(currentLink, true)) {
    this.linkBtn.markActive();
    this.linkBtn.currentLink = currentLink;
  } else {
    this.linkBtn.currentLink = null;
    this.linkBtn.markInactive();
  }
};

/**
 * linkBtnHandler - Handler for when $linkBtn is clicked.
 *
 * @returns {boolean} Returns true if successful else false.
 */
editToolbar.linkBtnHandler = function linkBtnHandler() {
  if (this.linkBtn.currentLink) {
    this.editor.removeLink(this.linkBtn.currentLink);
    this.linkBtn.currentLink = null;
    this.linkBtn.markInactive();
  } else {
    this.input.setSaveHandler(this.editor.wrapLink);
    this.hideButtons();
    this.input.display('Type a link...');
  }
};

editToolbar.display = function display(sel = null) {
  if (!(sel instanceof Selection)) return false;
  if (containsSelection(sel, this.$ctn)) return false;
  this.currentRange = sel.getRangeAt(0);
  this.toggleActiveLink(sel);
  this.toggleDisabledButtons();
  return this.baseDisplay();
};

export default editToolbar;
