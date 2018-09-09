import {
  generateElement,
  generateButton,
} from '../writeFreeLib.js';

import tbClass from './tbClasses.js';


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
export default {

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
