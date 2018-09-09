import {
  generateElement,
  generateButton,
  findNodeType,
  containsSelection,
} from './writeFreeLib.js';


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
######## ########  ########  ##     ## ######## ########  #######  ##    ##
   ##    ##     ## ##     ## ##     ##    ##       ##    ##     ## ###   ##
   ##    ##     ## ##     ## ##     ##    ##       ##    ##     ## ####  ##
   ##    ########  ########  ##     ##    ##       ##    ##     ## ## ## ##
   ##    ##     ## ##     ## ##     ##    ##       ##    ##     ## ##  ####
   ##    ##     ## ##     ## ##     ##    ##       ##    ##     ## ##   ###
   ##    ########  ########   #######     ##       ##     #######  ##    ##
*/

/**
* ToolbarButton - A button to be used in the Toolbar. This base object provides
*  a convenient set of methods for creating, attaching event listeners to, and
*  changing the appearance of buttons on the Toolbar.
*
*/
const ToolbarButton = {
  /**
   * init - Initializes the button by creating the requisite HTML (using the
   *  given content), attaching the given clickHandler, and, if ctn is provided,
   *  attaching the html to the given container Element.
   *
   * @param {HTML string || string} content The content which will be placed in
   *  the button. This can be either a simple string or a string containing
   *  HTML.
   * @param {Function} clickHandler The function to be attached to the button's
   *  HTML to be called when the button is clicked.
   * @param {HTML Element (opt)} $ctn The optional containing HTML Element.
   *
   * @returns {ToolbarButton} Returns this ToolbarButton.
   */
  init(content, handler, $ctn) {
    this.$html = generateButton(content, tbClass.btn, true);
    this.setSaveHandler(handler);
    this.appendTo($ctn);
    return this;
  },

  /**
   * setSaveHandler - Sets the clickHandler to the given function.
   *
   * @param {Function} saveHandler The function to call on each click.
   *
   * @returns {Function || null} Returns null if the given saveHandler is not a
   *  Function. Otherwise it returns the Function.
   */
  setSaveHandler(saveHandler) {
    if (typeof saveHandler !== 'function') {
      return null;
    }
    if (this.clickHandler) {
      this.$html.removeEventListener('click', this.clickHandler);
    }
    this.saveHandler = saveHandler;
    this.$html.addEventListener('click', this.saveHandler);
    return this.saveHandler;
  },

  /**
   * addClass - Adds a class or multiple classes to the button's html.
   *
   * @param {array || string} [klasses] The class(es) to be added to the button.
   *  Can either be an array of strings or a single string.
   *
   */
  addClass(klasses = []) {
    if (Array.isArray(klasses)) {
      klasses.forEach((klass) => {
        this.$html.classList.add(klass);
      });
    } else {
      this.$html.classList.add(klasses);
    }
  },

  /**
   * removeClass - Removes a class or multiple classes from the button's html.
   *
   * @param {array || string} [klasses] The class(es) to be removed from the
   *  button. Can either be an array of strings or a single string.
   *
   */
  removeClass(klasses = []) {
    if (Array.isArray(klasses)) {
      klasses.forEach((klass) => {
        this.$html.classList.remove(klass);
      });
    } else {
      this.$html.classList.remove(klasses);
    }
  },

  /**
   * disable - Disables the button. Sets the disabled attribute to true and adds
   *  the disabled class to the button.
   *
   */
  disable() {
    this.$html.disabled = true;
    this.addClass(tbClass.btnDisabled);
  },

  /**
   * enable - Enables the button. Sets the disabled attribute to false and
   *  removes the disabled class from the button.
   *
   */
  enable() {
    this.$html.disabled = false;
    this.removeClass(tbClass.btnDisabled);
  },

  /**
   * markActive - Marks the button as currently active. Simply adds the active
   *  class to the button.
   *
   */
  markActive() {
    this.$html.classList.add(tbClass.btnActive);
  },

  /**
   * markInactive - Marks the button as currently inactive. Simply removes the
   *  active class from the button.
   *
   */
  markInactive() {
    this.$html.classList.remove(tbClass.btnActive);
  },


  /**
   * html - Returns the button in HTML form.
   *
   * @returns {Element} The button in HTML form.
   */
  html() {
    return this.$html;
  },

  /**
   * appendTo - Appends the button HTML Element to the given container.
   *
   * @param {Element} $ctn The HTML Element to which the button should be
   *  appended.
   *
   */
  appendTo($ctn) {
    if ($ctn && $ctn instanceof HTMLElement) {
      $ctn.appendChild(this.html());
    }
  },
};

/*
######## ########  #### ##    ## ########  ##     ## ########
   ##    ##     ##  ##  ###   ## ##     ## ##     ##    ##
   ##    ##     ##  ##  ####  ## ##     ## ##     ##    ##
   ##    ########   ##  ## ## ## ########  ##     ##    ##
   ##    ##     ##  ##  ##  #### ##        ##     ##    ##
   ##    ##     ##  ##  ##   ### ##        ##     ##    ##
   ##    ########  #### ##    ## ##         #######     ##
*/

/**
 * ToolbarInput - The text input area of the Toolbar. This base object provides
 *  text input to users, allowing them to insert things like hyperlinks and
 *  image URIs.
 *
 * @param {HTML Element} $ctn - The containing div for $input and $closeBtn.
 * @param {HTML Element} $input - The text input.
 * @param {HTML Element} $closeBtn - The button which closes the input.
 *
 */
const ToolbarInput = {

  /**
   * init - Initializes the input by generating the requisite HTML and attaching
   *  the necessary event listeners.
   *
   * @param {HTML Element} [$ctn] - An optional container HTML element to which
   *  the input (or, more accurately, the container) will be attached.
   * @param {Function} hideCallback The function to be called when the input is
   *  hidden.
   *
   */
  init(hideCallback, $outerCtn) {
    this.$ctn = generateElement(
      'div',
      [tbClass.inputCtn, tbClass.hideDown],
    );
    this.$input = generateElement('input', tbClass.input, { type: 'text' });
    this.$closeBtn = generateButton('<b>&times;</b>', tbClass.btn, true);

    this.$ctn.appendChild(this.$input);
    this.$ctn.appendChild(this.$closeBtn);

    this.$closeBtn.addEventListener('click', this.hide.bind(this));
    this.$input.addEventListener('keypress', this.defaultEnterHandler.bind(this));
    this.hideCallback = hideCallback;
    if ($outerCtn && $outerCtn instanceof HTMLElement) this.appendTo($outerCtn);
  },

  /**
   * defaultEnterHandler - The function to be called when the user presses enter
   *  while typing in the input. When the user presses 'Enter' in the input
   *  field, this function will call the current saveHandler, always passing in
   *  the value of the input and the value assigned to this.currentRange. It is
   *  assumed that the value will always be required by the saveHandler and
   *  that, since it is hidden while the input is focused, so will the current
   *  range.
   *
   * @param {Event} e The Event to listen for.
   *
   */
  defaultEnterHandler(e) {
    if (e.key === 'Enter') {
      if (
        this.saveHandler
        && typeof this.saveHandler === 'function'
      ) {
        this.saveHandler.call(this, this.$input.value, this.currentRange);
      }
      this.hide();
    }
  },

  /**
   * setSaveHandler - Sets the saveHandler for the input to the given
   *  saveHandler function.
   *
   * @param {function} saveHandler The function to be called when the user saves
   *  (presses Enter) on the input.
   *
   */
  setSaveHandler(saveHandler) {
    if (saveHandler && typeof saveHandler === 'function') {
      this.saveHandler = saveHandler;
    }
  },

  /**
   * clearSaveHandler - Sets the saveHandler to null.
   *
   */
  clearSaveHandler() {
    this.saveHandler = null;
  },

  /**
   * getValue - Get the value of the input.
   *
   * @returns {string} The value of the $input.
   */
  getValue() {
    return this.$input.value;
  },

  /**
   * display - Displays the input by removing hiding class from the input
   *  container and placing the focus in the input. Will also accept an optional
   *  placeholder which will be placed on the input.
   *
   * @param {string} [placeholder=''] An optional string which will be set as
   *  the placeholder on the input.
   *
   */
  display(placeholder = '') {
    this.$input.placeholder = placeholder;
    this.$ctn.classList.remove(tbClass.hideDown);
    // put focus in the input. Must timeout due to animations.
    const sel = window.getSelection();
    this.currentRange = sel.getRangeAt(0);
    const range = document.createRange();
    range.selectNode(this.$input);
    function focusInput() {
      this.$input.focus();
    }
    setTimeout(focusInput.bind(this), 200);
  },

  /**
   * hide - Hides the input container and calls the saved hideCallback function.
   *
   */
  hide(useCallback = true) {
    this.$ctn.classList.add(tbClass.hideDown);
    this.$input.value = '';
    this.clearSaveHandler();
    if (
      useCallback
      && this.hideCallback
      && typeof this.hideCallback === 'function'
    ) {
      this.hideCallback();
    }
  },

  /**
   * html - Return the HTML for the input container.
   *
   */
  html() {
    return this.$ctn;
  },

  /**
   * appendTo - Appends the input to the given HTML Element.
   *
   * @param {Element} $where The HTML Element to which the input will be
   *  appended
   *
   * @returns {Element} The $where HTML Element.
   */
  appendTo($where) {
    $where.appendChild(this.html());
    return $where;
  },
};

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
    const $btnCtn = generateElement('div', tbClass.btnCtn);
    this.boldBtn = Object.create(ToolbarButton);
    this.boldBtn.init('<b>B</b>', this.editor.boldSelection.bind(this.editor), $btnCtn);
    this.italicBtn = Object.create(ToolbarButton);
    this.italicBtn.init('<i>i</i>', this.editor.italicizeSelection.bind(this.editor), $btnCtn);
    this.headingBtn = Object.create(ToolbarButton);
    this.headingBtn.init('H', this.editor.wrapHeading.bind(this.editor), $btnCtn);
    this.linkBtn = Object.create(ToolbarButton);
    this.linkBtn.init('&#128279;', this.linkBtnHandler.bind(this), $btnCtn);

    this.$btnCtn = $btnCtn;
    this.$ctn.appendChild(this.$btnCtn);
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
