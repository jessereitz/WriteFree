import {
  generateElement,
  findNodeType,
  containsSelection,
} from './writeFreeLib.js';

import ToolbarButton from './tb_components/tbButton.js';
import ToolbarInput from './tb_components/tbInput.js';


/*
##     ## ######## #### ##       #### ######## #### ########  ######
##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
##     ##    ##     ##  ##        ##     ##     ##  ##       ##
##     ##    ##     ##  ##        ##     ##     ##  ######    ######
##     ##    ##     ##  ##        ##     ##     ##  ##             ##
##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
 #######     ##    #### ######## ####    ##    #### ########  ######
*/

// The number of pixels by which to offset the top of the toolbar.
const toolbarOffset = 5;
// Classes for toolbar items.
const tbClass = (function tbClass() {
  const obj = {};
  obj.main = 'wf__toolbar';
  obj.btn = `${obj.main}__btn`;
  obj.btnDisabled = `${obj.btn}-disabled`;
  obj.btnActive = `${obj.btn}-active`;
  obj.btnCtn = `${obj.btn}-ctn`;
  obj.input = `${obj.main}__input`;
  obj.inputCtn = `${obj.input}-ctn`;
  obj.hideUp = `${obj.main}-hide-up`;
  obj.hideDown = `${obj.main}-hide-down`;
  obj.wide = `${obj.main}-wide`;
  return obj;
}());

/*
########  ######## ########    ###    ##     ## ##       ########
##     ## ##       ##         ## ##   ##     ## ##          ##
##     ## ##       ##        ##   ##  ##     ## ##          ##
##     ## ######   ######   ##     ## ##     ## ##          ##
##     ## ##       ##       ######### ##     ## ##          ##
##     ## ##       ##       ##     ## ##     ## ##          ##
########  ######## ##       ##     ##  #######  ########    ##
*/

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
export default {

  /**
   * initToolbar - Initializes the Toolbar.
   *
   * @returns {Toolbar} Returns this.
   */
  initToolbar(editor, options) {
    this.options = options;
    this.editor = editor;
    this.links = [];
    this.$ctn = generateElement(
      'div',
      [tbClass.main, 'hide'],
      { contenteditable: false },
    );
    this.createToolbarBtns();
    this.input = Object.create(ToolbarInput);
    this.input.init(this.displayButtons.bind(this), this.$ctn);
    this.editor.$ctn.appendChild(this.$ctn);
    return this;
  },

  /**
   * createToolbarBtns - Create the buttons to be included on the toolbar, add
   *  appropriate event listeners, and attaches them to the $ctn.
   */
  createToolbarBtns() {
    const $editBtnCtn = generateElement('div', tbClass.btnCtn);
    this.boldBtn = Object.create(ToolbarButton);
    this.boldBtn.init('<b>B</b>', this.editor.boldSelection.bind(this.editor), $editBtnCtn);
    this.italicBtn = Object.create(ToolbarButton);
    this.italicBtn.init('<i>i</i>', this.editor.italicizeSelection.bind(this.editor), $editBtnCtn);
    this.headingBtn = Object.create(ToolbarButton);
    this.headingBtn.init('H', this.editor.wrapHeading.bind(this.editor), $editBtnCtn);
    this.linkBtn = Object.create(ToolbarButton);
    this.linkBtn.init('&#128279;', this.linkBtnHandler.bind(this), $editBtnCtn);

    this.$editBtnCtn = $editBtnCtn;
    this.$ctn.appendChild(this.$editBtnCtn);
  },

  /*
  ########  ##     ## ######## ########  #######  ##    ##  ######  ######## ########  ##
  ##     ## ##     ##    ##       ##    ##     ## ###   ## ##    ##    ##    ##     ## ##
  ##     ## ##     ##    ##       ##    ##     ## ####  ## ##          ##    ##     ## ##
  ########  ##     ##    ##       ##    ##     ## ## ## ## ##          ##    ########  ##
  ##     ## ##     ##    ##       ##    ##     ## ##  #### ##          ##    ##   ##   ##
  ##     ## ##     ##    ##       ##    ##     ## ##   ### ##    ##    ##    ##    ##  ##
  ########   #######     ##       ##     #######  ##    ##  ######     ##    ##     ## ########
  */

  /**
   * toggleDisabledButtons - Disables buttons as necessary. As of now, if a the
   *  current selection contains a heading, all buttons other than the heading
   *  button are disabled.
   *
   * @param {Range} range The current range.
   *
   */
  toggleDisabledButtons() {
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
  },

  /**
   * hideButtons - Hides the buttons contained within the Toolbar so the input
   *  can be displayed.
   *
   */
  hideButtons() {
    this.$editBtnCtn.classList.add(tbClass.hideUp);
    this.$ctn.classList.add(tbClass.wide);
  },

  /**
   * displayButtons - Displays the buttons in the Toolbar.
   *
   */
  displayButtons() {
    this.$editBtnCtn.classList.remove(tbClass.hideUp);
    this.$ctn.classList.remove(tbClass.wide);
  },

  displayInsertOptions() {
    this.display(window.getSelection());
  },

  /*
  ########  ####  ######  ########  ##          ###    ##    ##  ######  ######## ########  ##
  ##     ##  ##  ##    ## ##     ## ##         ## ##    ##  ##  ##    ##    ##    ##     ## ##
  ##     ##  ##  ##       ##     ## ##        ##   ##    ####   ##          ##    ##     ## ##
  ##     ##  ##   ######  ########  ##       ##     ##    ##    ##          ##    ########  ##
  ##     ##  ##        ## ##        ##       #########    ##    ##          ##    ##   ##   ##
  ##     ##  ##  ##    ## ##        ##       ##     ##    ##    ##    ##    ##    ##    ##  ##
  ########  ####  ######  ##        ######## ##     ##    ##     ######     ##    ##     ## ########
  */

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
   * toggleActiveLink - If ads the active class to the link button if the
   *  current selection contains a link. It also attaches a currentLink
   *  attribute to the link button so the link can be removed.
   *
   * @param {Selection} sel The current selection.
   *
   */
  toggleActiveLink(sel) {
    const range = sel.getRangeAt(0);
    const currentLink = findNodeType(range.commonAncestorContainer, 'A');
    if (currentLink && sel.containsNode(currentLink, true)) {
      this.linkBtn.markActive();
      this.linkBtn.currentLink = currentLink;
    } else {
      this.linkBtn.currentLink = null;
      this.linkBtn.markInactive();
    }
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
  display(sel = null) {
    if (!(sel instanceof Selection)) return false;
    if (containsSelection(sel, this.$ctn)) return false;
    this.currentRange = sel.getRangeAt(0);
    this.toggleActiveLink(sel);
    this.toggleDisabledButtons();
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

  /**
   * linkBtnHandler - Handler for when $linkBtn is clicked.
   *
   * @returns {boolean} Returns true if successful else false.
   */
  linkBtnHandler() {
    if (this.linkBtn.currentLink) {
      this.editor.removeLink(this.linkBtn.currentLink);
      this.linkBtn.currentLink = null;
      this.linkBtn.markInactive();
    } else {
      this.input.setSaveHandler(this.editor.wrapLink);
      this.hideButtons();
      this.input.display('Type a link...');
    }
  },
};
