import {
  generateButton,
} from '../writeFreeLib.js';

import tbClass from './tbClasses.js';

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
export default {
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
