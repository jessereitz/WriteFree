/**
 * addStyleFromObj - Adds inline-style to a given HTML Element from the given
 *  style Object.
 *
 * @param {Element} $el   The HTML Element to which the styles will be added.
 * @param {object} styleObj The object which contains the styles. Must be
 *  formatted in the format { 'property' : 'value' } where 'property' is the
 *  CSS property and 'value' is the value to which it should be set.
 *  E.g. { color : 'purple' } will set $el's color to purple.
 *
 * @returns {Element} If the given styleObj is not an object or is null or
 *  undefined, will return false. If styles are successfully added, returns the
 *  HTML Element.
 */
function addStyleFromObj($el, styleObj) {
  if (
    styleObj === null
    || styleObj === undefined
    || (!(typeof styleObj === 'object'))
  ) { return false; }
  let styleString = '';
  Object.keys(styleObj).forEach((prop) => {
    styleString += `${prop}: ${styleObj[prop]};`;
  });
  $el.setAttribute('style', styleString);
  return $el;
}

/**
 * addClasses - Add classes to an HTML Element.
 *
 * @param {Element} $el  The HTML Element to which the classes will be added.
 * @param {string || Array} klasses A single string or an array of strings
 *  representing the classes to be added to $el.
 *
 * @returns {Element} The original $el with classes attached.
 */
function addClasses($el, klasses) {
  if (!klasses) return $el;
  if (Array.isArray(klasses)) {
    klasses.forEach((klass) => {
      if (typeof klass === 'string' && klass.length > 0) $el.classList.add(klass);
    });
  } else {
    $el.classList.add(klasses);
  }
  return $el;
}

/**
 * generateElement - Quickly generates an HTML element with given tagName,
 *  classes, and id.
 *
 * @param {string} [tagName=div] The tag name to use for the element.
 * @param {string|string[]}  [klasses=[]]  A single string or an array of
 *  strings representing the classes to be added to the element.
 * @param {object} [options={}] An optional object containing attributes to be
 *  added to the element. Each key must be a valid HTML attribute and the value
 *  must be a string.
 *
 * @returns {Element} The newly-created HTML element.
 */
function generateElement(tagName = 'div', klasses = [], options = {}) {
  const $el = document.createElement(tagName);
  addClasses($el, klasses);
  if (options && typeof options === 'object') {
    Object.keys(options).forEach((attr) => {
      if (attr === 'style') {
        addStyleFromObj($el, options[attr]);
      } else if (attr === 'klasses') {
        addClasses($el, options[attr]);
      } else {
        $el.setAttribute(attr, options[attr]);
      }
      return null;
    });
  }
  return $el;
}

/**
 * generateButton - Quickly generate a button element
 *
 * @param {string} [value=Button] Description
 * @param {array}  [klasses=[]]   Description
 * @param {string} [id=]          Description
 *
 * @returns {type} Description
 */
function generateButton(
  value = 'Button',
  klasses = [],
  innerHTML = false,
  options = {},
) {
  const $btn = generateElement('button', klasses, options);
  if (innerHTML) $btn.innerHTML = value;
  else $btn.textContent = value;
  return $btn;
}

/**
 * isDeletionKey - Determines whether the key in the given KeyboardEvent will
 *  delete any characters or words. Because of a peculiarity with FireFox, we
 *  must specifically test for metakeys (ctrl, shift, alt, and
 *  metaKey (Windows/Cmd)).
 *
 * @param {KeyboardEvent} event The KeyboardEvent to test.
 *
 * @returns {boolean} Returns true if the key is a deletion key, else false.
 */
function isDeletionKey(event) {
  return (event.key === 'Backspace')
    || (event.ctrlKey && event.key === 'Backspace')
    || (event.shiftKey && event.key === 'Backspace')
    || (event.altKey && event.key === 'Backspace')
    || (event.metaKey && event.key === 'Backspace')
    || (event.key === 'Delete')
    || (event.ctrlKey && event.key === 'Delete')
    || (event.shiftKey && event.key === 'Delete')
    || (event.altKey && event.key === 'Delete')
    || (event.metaKey && event.key === 'Delete')
    || (event.ctrlKey && event.key.toLowerCase() === 'x')
    || (event.shiftKey && event.key.toLowerCase() === 'x')
    || (event.altKey && event.key.toLowerCase() === 'x')
    || (event.metaKey && event.key.toLowerCase() === 'x');
}

/**
 * validateURL - A very simple url validator that checks for at least one dot
 *  and for http or https. If it has a dot but no http(s), http:// will be
 *  prepended before the url is returned.
 *
 * @param {string} url The url to validate
 *
 * @returns {string || boolean} Returns the url (with http:// prepended if
*   applicable) if url is valid. Else returns false.
 */
function validateURL(url) {
  let returnVal;
  if (!url.includes('.')) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    returnVal = `http://${url}`;
  } else {
    returnVal = url;
  }
  return returnVal;
}

/**
 * findParentBlock - Finds the nearest ancestor of the given element which is
 *  of the types listed in parentTags.
 *
 * @param {Element} $el The Element of which to find an acceptable parent element.
 *
 * @returns {Element || boolean} If no Element of an acceptable type is found,
 *  or if the given $el isn't an HTML Element, will return false. Else it
 *  returns the found HTML Element.
 */
function findParentBlock($el) {
  const blockTags = ['DIV', 'P', 'H1', 'H2'];
  let $returnEl = $el;
  while (!blockTags.includes($returnEl.tagName)) {
    $returnEl = $returnEl.parentNode;
  }
  return $returnEl;
}

/**
 * findNodeType - Finds a node of the given targetType. This function will
 *  first check the given node's parent, then itself, then its children. If no
 *  Element is found, the function will return false. Otherwise it will return
 *  the found Element.
 *
 * @param {Element} node    The Element to search.
 * @param {string} targetType The tagName of the target Element type.
 *
 * @returns {Element || boolean} The found HTML Element or false.
 */
function findNodeType(node, targetType) {
  if (node.nodeName === targetType) {
    return node;
  }
  if (node.parentNode.nodeName === targetType) {
    return node.parentNode;
  }
  let returnNode = false;
  if (node.children) {
    Array.from(node.children).forEach((child) => {
      const foundNode = findNodeType(child, targetType);
      if (foundNode) {
        returnNode = foundNode;
        return returnNode;
      }
      return false;
    });
  }
  return returnNode;
}

/**
 * containsSelection - Check if a given selection contains a given node. Will
 *  return true even if given node is only partially contained within the
 *  selection.
 *
 * @param {Selection} sel  The selection to test.
 * @param {Element} node   The node to check for.
 *
 * @returns {boolean} Returns true if the given node is contained, at least in
 *  part, within the given selection. Otherwise, returns false.
 */
function containsSelection(sel, node) {
  if (!(sel instanceof Selection)) return false;
  return (
    (node.contains(sel.anchorNode) && node.contains(sel.focusNode))
    || sel.containsNode(node, true)
  );
}

/**
 * collapseSelectionToRange - Collapses the given Selection (sel) to the end of
 *  the given Range (range).
 *
 * @param {Selection} sel  The Selection to collapse.
 * @param {Range} range    The Range to use to collapse the selection.
 *
 */
function collapseSelectionToRange(sel, range, toStart = false) {
  range.collapse(toStart);
  sel.removeAllRanges();
  sel.addRange(range);
}

var tbClass = (function tbClass() {
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
var ToolbarInput = {

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
      if (!this.preventHideOnEnter) {
        this.hide();
      }
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
   * clear - Clears the input.If a new placeholder is provided, will set the
   *  input's placeholder to that.
   *
   * @param {string} [newPlaceholder] The new placeholder to be put on the
   *  input.
   *
   */
  clear(newPlaceholder) {
    this.$input.value = '';
    if (newPlaceholder) {
      this.$input.placeholder = newPlaceholder;
    }
  },

  /**
   * hide - Hides the input container and calls the saved hideCallback function.
   *
   */
  hide(useCallback = true) {
    // debugger;
    if (this.$ctn.classList.contains(tbClass.hideDown)) return false;
    this.$ctn.classList.add(tbClass.hideDown);
    this.$input.value = '';
    this.clearSaveHandler();
    if (this.currentRange) {
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      sel.removeRange(range);
      sel.addRange(this.currentRange);
    }
    if (
      useCallback
      && this.hideCallback
      && typeof this.hideCallback === 'function'
    ) {
      this.hideCallback();
    }
    return true;
  },

  /**
   * html - Return the HTML for the input container.
   *
   */
  html() {
    return this.$ctn;
  },

  /**
   * getWidth - Returns the width of the input container.
   *
   * @returns {number} The width of the input container.
   */
  getWidth() {
    const boundingRect = this.$ctn.getBoundingClientRect();
    return boundingRect.width;
  },

  /**
   * getWidth - Returns the height of the input container.
   *
   * @returns {number} The height of the input container.
   */
  getHeight() {
    const boundingRect = this.$ctn.getBoundingClientRect();
    return boundingRect.height;
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
var ToolbarButton = {
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
  init(content, title, handler, $ctn) {
    this.$html = generateButton(content, tbClass.btn, true, { title });
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

// Create the EditToolbar from the BaseToolbar.
const editToolbar = Object.create(BaseToolbar);

/**
 * init - Initialize the EditToolbar. Callse the BaseToolbar's initialization
 *  method then sets up the requisite buttons and input.
 *
 * @param {Editor} editor The Editor which owns this Toolbar.
 * @param {Object} options The initialization options provided by the user.
 *
 * @returns {EditToolbar} Returns this.
 */
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
  this.boldBtn.init('<b>B</b>', 'Bold Selection', this.editor.boldSelection.bind(this.editor), this.$btnCtn);
  this.italicBtn = Object.create(ToolbarButton);
  this.italicBtn.init('<i>i</i>', 'Italicize Selection', this.editor.italicizeSelection.bind(this.editor), this.$btnCtn);
  this.headingBtn = Object.create(ToolbarButton);
  this.headingBtn.init('H', 'Wrap Selection with Heading', this.editor.wrapHeading.bind(this.editor), this.$btnCtn);
  this.linkBtn = Object.create(ToolbarButton);
  this.linkBtn.init('🔗', 'Wrap Selection with Link', this.linkBtnHandler.bind(this), this.$btnCtn);
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

/**
 * display - Displays the EditToolbar.
 *
 * @param {Selection} [sel=null] The selection next to which the toolbar should
 *  be displayed.
 *
 * @returns {boolean} Returns true if the EditToolbar is displayed. Else false.
 */
editToolbar.display = function display(sel = null) {
  if (!(sel instanceof Selection)) return false;
  if (containsSelection(sel, this.$ctn)) return false;
  this.currentRange = sel.getRangeAt(0);
  this.toggleActiveLink(sel);
  this.toggleDisabledButtons();
  return this.baseDisplay();
};

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
* Editor - The main object representing the WriteFree editor.
*
* @property {Element} $ctn - The outermost container of the WriteFree editor.
*  $ctn is passed in to the WriteFree instantiation function.
* @property {Element} $innerCtn - The actual contetneditable-div in which the
*  user can write
*/
var editorBase = {
  /**
   * initWFEditor - Initializes the Editor. Creates an inner container div and
   *  fills it with a line break (done to ensure the first block of text is
   *  wrapped in a div); initializes the Toolbar; and adds the pasteHandler.
   *
   * @returns {Editor} Returns this.
   */
  initWFEditor($ctn, options) {
    this.$ctn = $ctn;
    this.options = options;
    this.generateClasses();
    document.execCommand('defaultParagraphSeparator', false, this.options.divOrPar);
    this.$innerCtn = generateElement(
      'div',
      this.classes.main,
      { style: this.options.containerStyle },
    );
    this.$innerCtn.setAttribute('contenteditable', true);
    this.$ctn.append(this.$innerCtn);
    this.createFirstTextSection();

    this.editToolbar = editToolbar.init(this, this.options);
    this.insertToolbar = insertToolbar.init(this, this.options);

    this.$ctn.addEventListener('paste', this.pasteHandler.bind(this));
    this.$ctn.addEventListener('keydown', this.keydownHandler.bind(this));
    this.$ctn.addEventListener('keyup', this.keyupHandler.bind(this));
    this.$ctn.addEventListener('click', this.checkForInsert.bind(this));
    this.$ctn.addEventListener('mouseup', this.positionCursor.bind(this));
    // must be added to document because of browsers.
    document.addEventListener('selectionchange', this.selectionHandler.bind(this));
    document.addEventListener('scroll', this.insertToolbar.hide.bind(this.insertToolbar));
    return this;
  },

  generateClasses() {
    this.classes = {};
    this.innerCtnClass = 'wf__editor';
    this.classes.main = [this.innerCtnClass];
    if (this.options.containerClass !== 'wf__edtior') {
      this.classes.main.push(this.options.containerClass);
    }
    this.classes.textSection = 'wf__text-section';
    this.classes.containerSection = 'wf__container-section';
    return this.classes;
  },

  /*
   ######  ########  ######  ######## ####  #######  ##    ##  ######
  ##    ## ##       ##    ##    ##     ##  ##     ## ###   ## ##    ##
  ##       ##       ##          ##     ##  ##     ## ####  ## ##
   ######  ######   ##          ##     ##  ##     ## ## ## ##  ######
        ## ##       ##          ##     ##  ##     ## ##  ####       ##
  ##    ## ##       ##    ##    ##     ##  ##     ## ##   ### ##    ##
   ######  ########  ######     ##    ####  #######  ##    ##  ######
  */

  /**
   * createFirstTextSection - The editor must have the a first div in order to ensure
   *  proper formatting. This method creates the first div and appends it to
   *  the inner container.
   */
  createFirstTextSection() {
    if (!this.$firstSection) {
      this.$firstSection = this.createTextSection();
    }
    this.$firstSection.textContent = '';
    this.$innerCtn.insertBefore(this.$firstSection, this.$innerCtn.firstChild);
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(this.$firstSection, 0);
    range.setEnd(this.$firstSection, 0);
    sel.removeAllRanges();
    sel.addRange(range);
    window.first = this.$firstSection;
    return this.$firstSection;
  },

  /**
   * displayFirstSectionPlaceholder - Checks if current section is the first textSection
   *  and, if so, ensures the section is completely empty. This ensures that the
   *  placeholder is properly displayed.
   *
   */
  displayFirstSectionPlaceholder() {
    const sel = window.getSelection();
    if (
      sel.isCollapsed
      && this.isFirst(sel.anchorNode)
      && sel.anchorNode.classList.contains(this.classes.textSection)
      && sel.anchorNode.textContent === ''
    ) {
      sel.anchorNode.innerHTML = '';
    }
  },

  /**
   * createTextSection - Creates a standard text section.
   *
   * @returns {Element} The newly-created text section.
   */
  createTextSection() {
    if (!Array.isArray(this.options.sectionClass)) {
      this.options.sectionClass = Array(this.options.sectionClass);
    }
    if (!this.options.sectionClass.includes(this.classes.textSection)) {
      this.options.sectionClass.push(this.classes.textSection);
    }
    const parOptions = {
      style: this.options.sectionStyle,
      klasses: this.options.sectionClass,
    };
    return generateElement(this.options.divOrPar, [], parOptions);
  },

  /**
   * createContainerSection - Creates a container div to house any inline objects the
   *  user inserts (img, hr). These are used in order to separate sections in which the
   *  user can type and those in which they cannot.
   *
   * @param {Element} [childNode] If provided, childNode will be attached to the newly-
   *  created container.
   *
   * @returns {Element} Returns the newly-created container.
   */
  createContainerSection(childNode) {
    const style = this.options.sectionStyle;
    const container = generateElement('div', this.classes.containerSection, { style });
    if (childNode && childNode instanceof Element) {
      container.appendChild(childNode);
    }
    return container;
  },

  /**
   * normalizeSection - Normalizes the current section (div or p) in order to
   *  join all separate text nodes. Text nodes end up split when starting
   *  newlines and trying to rejoin sections and so must be normalized.
   *
   * @returns {null} Returns null.
   */
  normalizeSection() {
    const sel = window.getSelection();
    try {
      const range = sel.getRangeAt(0);
      const startParent = findParentBlock(sel.anchorNode);
      const endParent = findParentBlock(sel.focusNode);
      if (startParent) startParent.normalize();
      if (endParent) endParent.normalize();
      if (range.commonAncestorContainer) range.commonAncestorContainer.normalize();
    } catch (exception) {
      return null;
    }
    return null;
  },

  /**
   * deleteContainerSection - Deletes an entire container section. Used when the
   *  user is at the beginning or end of a text section and press backspace or
   *  the delete key (passed in as 'key'). Prevents user from entering the
   *  container section unwittingly.
   *
   * @param {KeybaordEvent} e The Event to use to determine which key was
   *  pressed. e.key must be 'Backspace' or 'Delete'. If 'Backspace', this
   *  method will delete the previous section. If 'Delete', this method will
   *  delete the next container section.
   *
   * @returns {boolean} Returns true if the
   */
  deleteContainerSection(e) {
    const sel = window.getSelection();
    const section = findParentBlock(sel.anchorNode);
    let nextSection = null;
    if (e.key === 'Backspace') {
      nextSection = section.previousSibling;
    } else if (e.key === 'Delete') {
      nextSection = section.nextSibling;
    }
    if (
      nextSection
      && nextSection.classList.contains(this.classes.containerSection)
    ) {
      e.preventDefault();
      nextSection.parentNode.removeChild(nextSection);
    }
    return false;
  },


  /**
   * preventTextInContainer - Prevents the user from typing in container
   *  sections. If a user tries to type in a container section, the next text
   *  section is automatically selected or, if none is present, a new one is
   *  created immediately after the container section. Up and left arrow keys
   *  move the cursor to the previous section and right and down arrow keys move
   *  the cursor to the next section.
   *
   */
  preventTextInContainer(e) {
    const sel = window.getSelection();
    const section = findParentBlock(sel.anchorNode);
    if (section.classList.contains(this.classes.containerSection)) {
      let newSection = section.nextSibling;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        newSection = section.previousSibling;
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        newSection = section.nextSibling;
      } else if (
        !newSection
        || newSection.classList.contains(this.classes.containerSection)
        || (
          newSection.classList.contains(this.classes.textSection)
          && newSection.textContent.length > 0
        )
      ) {
        newSection = this.createTextSection();
        this.$innerCtn.insertBefore(newSection, section.nextSibling);
      }
      e.preventDefault();
      sel.collapse(newSection, 0);
    }
  },

  /*
  ######## ########  #### ######## #### ##    ##  ######
  ##       ##     ##  ##     ##     ##  ###   ## ##    ##
  ##       ##     ##  ##     ##     ##  ####  ## ##
  ######   ##     ##  ##     ##     ##  ## ## ## ##   ####
  ##       ##     ##  ##     ##     ##  ##  #### ##    ##
  ##       ##     ##  ##     ##     ##  ##   ### ##    ##
  ######## ########  ####    ##    #### ##    ##  ######
  */

  /**
   * boldSelection - Bolds the current selection.
   *
   */
  boldSelection() {
    const sel = window.getSelection();
    if (sel instanceof Selection) {
      document.execCommand('bold', false);
    }
  },

  /**
   * linkBtnHandler - Italicizes the current selection.
   *
   */
  italicizeSelection() {
    const sel = window.getSelection();
    if (sel instanceof Selection) {
      document.execCommand('italic', false);
    }
  },

  /**
   * wrapHeading - Wrap the current selection in a heading element or removes
   *  current heading element. Wraps non-headings in H1 if the current
   *  selection is the first element in the Editor otherwise uses H2. Removes
   *  all children HTML elements, leavining only text.
   *
   * @returns {boolean} Returns true if successful else false.
   */
  wrapHeading() {
    const sel = window.getSelection();
    let parentnode = findParentBlock(sel.anchorNode);
    parentnode.innerHTML = parentnode.innerHTML.replace(/<[^>]+>/g, '');
    let tagName;
    let klass;
    let style;
    if (sel instanceof Selection) {
      // debugger;
      if (parentnode.tagName === 'H2') {
        tagName = this.options.divOrPar;
        klass = this.options.sectionClass;
        style = this.options.sectionStyle;
      } else if (parentnode.tagName === 'DIV' || parentnode.tagName === 'P') {
        tagName = 'h1';
        klass = this.options.largeHeadingClass;
        style = this.options.largeHeadingStyle;
      } else {
        tagName = 'h2';
        klass = this.options.smallHeadingClass;
        style = this.options.smallHeadingStyle;
      }
      const successful = document.execCommand('formatBlock', false, tagName);
      if (successful) {
        parentnode = findParentBlock(sel.anchorNode);
        addStyleFromObj(parentnode, style);
        addClasses(parentnode, klass);
        const range = sel.getRangeAt(0);
        range.selectNode(sel.focusNode);
        range.collapse();
      }
      return successful;
    }
    return false;
  },

  /**
   * wrapLink - wraps the given range (currentRange) with a link node pointing
   *  to the given URL (rawURL). This method first validates the URL, throwing
   *  it out if it isn't properly formatting. It will insert the http protocol
   *  if at the beginning of the string if it doesn't contain it.
   *
   * @param {string} rawURL      A string containing the URL to which the link
   *  will point.
   * @param {Range} currentRange The Range around which the link will be
   *  wrapped.
   *
   * @returns {Element || boolean} Will return the new link if successful, else
   *  returns false.
   */
  wrapLink(rawURL, currentRange) {
    const url = validateURL(rawURL);
    if (!url) return false;
    const link = generateElement('a');
    link.href = url;
    currentRange.surroundContents(link);
    collapseSelectionToRange(window.getSelection(), currentRange);
    return link;
  },

  /**
   * removeLink - Replaces the given link node with a text node containing the
   *  link's text content.
   *
   * @param {Element} $link The linnk to remove.
   *
   */
  removeLink($link) {
    const sel = window.getSelection();
    this.currentRange = sel.getRangeAt(0);
    const range = document.createRange();
    range.selectNode($link);
    const plainText = document.createTextNode($link.textContent);
    range.deleteContents();
    range.insertNode(plainText);
    collapseSelectionToRange(sel, range);
  },

  /**
   * insertImage - Inserts an image into the editor. Must be provided src, alt
   *  and nextSibling in order to properly render.
   *
   * @param {string} src          The string to use for the img's src attribute.
   * @param {string} alt          The string to use for the img's alt attribute.
   * @param {Element} nextSibling The HTML Element before which the image will
   *  be inserted.
   *
   * TODO: Get rid of alert. Build out a simple messaging system for users.
   */
  insertImage(src, alt, nextSibling) {
    if (nextSibling.innerHTML.length === 0) {
      nextSibling.append(document.createElement('br'));
    }
    const sel = window.getSelection();
    const img = generateElement('img', this.options.imgClass, { src, alt, style: this.options.imgStyle });
    const section = this.createContainerSection();
    img.section = section;
    img.onerror = function onImageError() {
      img.section.parentNode.removeChild(img.section);
      alert('Image failed to load.');
    };
    if (nextSibling === this.$firstSection) {
      this.$firstSection = section;
    }
    section.appendChild(img);
    nextSibling.parentNode.insertBefore(section, nextSibling);
    const range = document.createRange();
    range.selectNodeContents(nextSibling);
    // debugger;
    collapseSelectionToRange(sel, range, true);
  },

  /**
   * insertLine - Inserts a line in the editor directly before the current
   *  position of the selection cursor.
   *
   */
  insertLine() {
    const sel = window.getSelection();
    let range = sel.getRangeAt(0);
    const nextSibling = findParentBlock(range.startContainer);
    if (nextSibling === this.$firstSection) return false;
    const line = document.createElement('hr');
    const section = this.createContainerSection();
    section.appendChild(line);
    nextSibling.parentNode.insertBefore(section, nextSibling);
    range = document.createRange();
    range.selectNodeContents(nextSibling);
    collapseSelectionToRange(sel, range, true);
    this.insertToolbar.hide();
    return true;
  },

  /*
  ##     ##    ###    ##    ## ########  ##       ######## ########   ######
  ##     ##   ## ##   ###   ## ##     ## ##       ##       ##     ## ##    ##
  ##     ##  ##   ##  ####  ## ##     ## ##       ##       ##     ## ##
  ######### ##     ## ## ## ## ##     ## ##       ######   ########   ######
  ##     ## ######### ##  #### ##     ## ##       ##       ##   ##         ##
  ##     ## ##     ## ##   ### ##     ## ##       ##       ##    ##  ##    ##
  ##     ## ##     ## ##    ## ########  ######## ######## ##     ##  ######
  */

  /**
   * selectionHandler - Handles the given Selection (sel) event. If the given
   *  object is not a Selection this method will immediately return false.
   *  Otherwise it will display the Toolbar if the Selection is contained
   *  fully within this Editor and the Selection contains text. Otherwise it
   *  will hide the Toolbar.
   *
   *
   * @param {Event} e The selectionchange event.
   *
   * @returns {boolean} Returns true if the given selection was successfully
   *  handled, else false.
   */
  selectionHandler(e) {
    if (e.type !== 'selectionchange') return false;
    const sel = window.getSelection();
    if (
      (containsSelection(sel, this.$ctn) && !sel.isCollapsed)
      || containsSelection(sel, this.editToolbar.html())
    ) {
      this.editToolbar.display(sel);
    } else {
      this.editToolbar.hide();
    }
    return true;
  },

  /**
   * pasteHandler - Handles the paste event in the editor. We intercept the
   *  normal paste event and strip all HTML from the copied text and then
   *  insert it as HTML. This is done to ensure that each paste is essentially
   *  a 'paste as plain text.' We use 'insertHTML' because most browsers don't
   *  allow access to the paste action in execCommand.
   *
   * @param {Event} e The paste event.
   *
   * @returns {boolean} Returns true if hijacked paste was successful else
   *  false.
   */
  pasteHandler(e) {
    e.preventDefault();
    if (!e.type === 'paste') return false;
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
    return true;
  },

  /**
   * newLineHandler - Handle's the creation of a new section when the user
   *  creates a newline (aka presses 'Enter'). We hijack this event because
   *  the implementation of creating new sections in contenteditable elements
   *  can be pretty different between browsers (especially Firefox).
   *
   *  TODO: Clean this up.
   *
   * @returns {Element} Returns the newly created paragraph.
   */
  newLineHandler(e) {
    e.preventDefault();
    const sel = window.getSelection();
    const parentBlock = findParentBlock(sel.focusNode);
    const newPar = this.createTextSection();
    parentBlock.parentNode.insertBefore(newPar, parentBlock.nextSibling);
    const currentRange = sel.getRangeAt(0);
    if (currentRange.collapsed) {
      try {
        currentRange.setEndBefore(parentBlock.nextSibling);
        if (currentRange.toString().length !== 0) {
          newPar.append(currentRange.cloneContents());
        }
      } catch (exception) {
        newPar.textContent = '';
      }
    }
    if (newPar.textContent.length === 0) {
      newPar.append(document.createElement('br'));
      newPar.append(document.createTextNode(''));
    }
    currentRange.deleteContents();
    if (
      parentBlock.textContent.length === 0
      && currentRange.commonAncestorContainer === currentRange.startContainer
    ) {
      parentBlock.append(document.createElement('br'));
    }
    const range = document.createRange();
    range.selectNodeContents(newPar);
    collapseSelectionToRange(sel, range, true);
    newPar.normalize();
    const rect = newPar.getBoundingClientRect();
    if (rect.top >= window.innerHeight) {
      window.scroll({
        top: rect.top + window.scrollY,
        behavior: 'instant',
      });
    }
    return newPar;
  },

  /**
   * keydownHandler - Watches for deletion keys on keydown events and stops
   *  them from deleting the divs inside the main container. However, this is
   *  fairly limited in scope: though it catches Backspace, Delete, and ctrl-X
   *  it's really only meant to stop the Backspace from deleting the first
   *  paragraph. Events like ctrl-A + Backspace are handled in the
   *  keyupHandler.
   *
   * @param {KeyboardEvent} e The KeyboardEvent to test.
   */
  keydownHandler(e) {
    const sel = window.getSelection();
    if (isDeletionKey(e)) {
      if (
        e.key === 'Backspace'
        && sel.anchorOffset === 0
        && sel.anchorNode === sel.focusNode
      ) {
        this.deleteContainerSection(e);
      } else if (
        e.key === 'Delete'
        && sel.anchorOffset === sel.anchorNode.textContent.length
        && sel.anchorNode === sel.focusNode
      ) {
        this.deleteContainerSection(e);
      }
    }
    if (e.key === 'Enter' && this.$innerCtn.contains(e.target)) {
      this.newLineHandler(e);
    }
    this.preventTextInContainer(e);
    const range = sel.getRangeAt(0);
    const prevSection = findParentBlock(range.startContainer);
    if (!this.editToolbar.contains(prevSection) && !this.insertToolbar.contains(prevSection)) {
      this.prevSection = prevSection;
      this.prevSectionPrevSibling = this.prevSection.previousSibling;
      this.prevOffset = range.startOffset;
    }
  },

  /**
   * keyupHandler - Watches for deletion keys and resets the editor container
   *  if they remove the first inner paragraph. Also normalizes the current
   *  section so that all text nodes are merged together (this helps with
   *  newline generation). Also checks to see if the insertToolbar should be
   *  displayed.
   *
   * @param {KeyboardEvent} e The KeyboardEvent to test.
   */
  keyupHandler(e) {
    if (isDeletionKey(e)) {
      const sel = window.getSelection();
      if (
        this.$innerCtn.innerHTML === ''
        || this.$innerCtn.innerHTML === '<br>'
        || sel.anchorNode === this.$innerCtn
      ) {
        this.createFirstTextSection();
      }
      this.displayFirstSectionPlaceholder();
    }
    try {
      this.normalizeSection();
      this.checkForInsert(e);
      this.positionCursor();
    } catch (exception) {
      return null;
    }
    return true;
  },

  /**
   * checkForInsert - Determines if the insertToolbar should be displayed. If
   *  the user is in an empty section, the insertToolbar should be displayed.
   *
   *
   * @returns {boolean} Returns true if the insertToolbar is displayed else
   *  false.
   */
  checkForInsert(e) {
    if (e && this.insertToolbar.$ctn.contains(e.target)) return false;
    const sel = window.getSelection();
    this.insertToolbar.hide();
    if (sel.isCollapsed
      && (sel.anchorNode && sel.anchorNode.textContent === '')
      && !containsSelection(sel, this.insertToolbar.$ctn)
    ) {
      this.insertToolbar.display();
      return true;
    }
    return false;
  },

  /**
   * positionCursor - Positions the cursor in a textSection if it isn't in one
   *  already. This method first looks at the previous section (set in the
   *  keydownHandler) and tries to position the cursor there. If that fails, it
   *  will position the cursor in the next adjacent text container, creating one
   *  if necessary. This method will return false if the cursor is currently in
   *  one of the toolbars.
   *
   */
  positionCursor() {
    const sel = window.getSelection();
    let section = null;
    try {
      section = findParentBlock(sel.anchorNode);
    } catch (exception) {
      return false;
    }
    if (this.editToolbar.contains(section) || this.insertToolbar.contains(section)) {
      return false;
    }
    const range = sel.getRangeAt(0);
    if (
      !section.classList.contains(this.classes.textSection)
      && section.tagName !== 'H2'
      && section.tagName !== 'H1'
    ) {
      if (
        this.prevSection
        && this.$innerCtn.contains(this.prevSection)
        && this.prevSection.classList.contains(this.classes.textSection)
      ) {
        sel.collapse(this.prevSection, this.prevOffset);
      } else {
        section = this.prevSectionPrevSibling;
        if (!section) return false;
        const newSection = this.createTextSection();
        if (section.nextSibling) {
          this.$innerCtn.insertBefore(newSection, section.nextSibling);
        } else {
          this.$innerCtn.appendChild(newSection);
        }
        range.selectNodeContents(newSection);
        range.collapse(true);
      }
    }
    return true;
  },

  /*
  ##     ## ######## #### ##        ######
  ##     ##    ##     ##  ##       ##    ##
  ##     ##    ##     ##  ##       ##
  ##     ##    ##     ##  ##        ######
  ##     ##    ##     ##  ##             ##
  ##     ##    ##     ##  ##       ##    ##
   #######     ##    #### ########  ######
  */

  /**
   * load - Load a previous version of the editor. The given htmlSTring MUST be
   *  that returned by this.html(true). If the given htmlString doesn not
   *  contain the appropriate $innerCtn class, it will be rejected. If passed
   *  correctly, the given htmlString will replace the current editor's
   *  $innerCtn.
   *
   * @param {string} htmlString A string containing a previous state of a
   *  writefree editor.
   *
   * @returns {boolean} Returns true if the given htmlString was formatted
   *  properly and was inserted into the editor. Else returns false.
   */
  load(htmlString) {
    const parser = new DOMParser();
    let html = htmlString;
    if (typeof htmlString === 'string') {
      html = parser.parseFromString(htmlString, 'text/html');
    }
    let newInnerCtn = null;
    try {
      newInnerCtn = html.body.firstChild;
    } catch (exc) {
      return false;
    }
    if (newInnerCtn && newInnerCtn.classList.contains(this.innerCtnClass)) {
      this.$ctn.removeChild(this.$innerCtn);
      this.$ctn.appendChild(newInnerCtn);
      this.$innerCtn = newInnerCtn;
    }
    return this.$ctn.contains(newInnerCtn);
  },

  /**
   * html - Returns the Editor in HTML form.
   *
   * @param {boolean} [editable=false] Determines whether the returned HTML will
   *  have contenteditable set to true or false, according to given value.
   *
   * @returns {Element} The Editor in HTML form.
   */
  html(editable = false) {
    const returnEl = this.$innerCtn.cloneNode(true);
    returnEl.setAttribute('contenteditable', editable);
    return returnEl.outerHTML;
  },

  /**
   * getToolbar - Returns the Toolbar associated with this Editor.
   *
   * @returns {Toolbar} The Toolbar associated with this Editor.
   */
  getToolbar() { return this.editToolbar; },

  /**
   * isFirst - Determines if given HTML Element is the first element of the
   *  Editor.
   *
   * @param {Element} $node The HTML Element to test.
   *
   * @returns {boolean} True if the given Element is the first in the Editor,
   *  else returns false.
   */
  isFirst($node) {
    if (this.$innerCtn.children[0] === $node) {
      return true;
    }
    return false;
  },
};

var toolbarStyle = '@import url("https://fonts.googleapis.com/css?family=Crimson+Text:400,700|Roboto");@keyframes fade-in {  from {    opacity: 0; }  to {    opacity: 1; } }@keyframes expand-width {  from {    width: 0; }  to {    width: 15em; } }.wf__toolbar {  position: fixed;  display: inline-block;  font-family: "Roboto", sans-serif;  background: linear-gradient(#555, #222);  padding: 0.25em 0.25rem;  border-radius: 0.25em;  box-shadow: 0.1rem 0.1rem 1rem 0.1rem rgba(0, 0, 0, 0.55);  animation: fade-in 0.15s ease-out;  transition: width 0.2s;  overflow: hidden;  min-width: 1em;  max-height: 1.9em; }  .wf__toolbar__btn-ctn {    transition: transform 0.2s; }  .wf__toolbar__btn {    box-sizing: border-box;    margin: 0 0.1rem;    background: none;    color: #fff;    border: 1px solid transparent;    border-radius: 0.25em;    transition: all 0.2s;    font-size: 1em;    width: 2em;    height: 1.75em;    line-height: 1.25em;    text-align: center;    padding: 0.25em 0.25rem;    outline: none;    z-index: 0;    vertical-align: baseline; }  .wf__toolbar__btn:hover {    border-color: #fff;    background: rgba(255, 255, 255, 0.075); }  .wf__toolbar__btn:active {    border-color: #bbb;    background: rgba(0, 0, 0, 0.2); }  .wf__toolbar__btn-active {    color: #A9D943;    border-color: #A9D943; }  .wf__toolbar__btn-disabled {    color: #666; }  .wf__toolbar__btn-disabled:hover {    border-color: transparent;    background: none; }  .wf__toolbar__input-ctn {    box-sizing: border-box;    position: absolute;    width: 15em;    height: 100%;    top: 0;    left: 0;    z-index: 1;    padding: 0.25em 0.25rem;    animation: fade-in 0.15s ease-out;    transition: all 0.2s; }    .wf__toolbar__input-ctn button {      display: inline-block;      position: absolute;      right: 0;      margin-right: 0; }  .wf__toolbar__input {    display: inline-block;    max-width: 100%;    height: 100%;    margin: 0;    padding: 0;    border: none;    outline: none;    background: none;    color: white;    padding-left: 0.1rem;    font-size: 1em; }  .wf__toolbar-hide-up {    transform: translateY(-150%);    visibility: hidden; }  .wf__toolbar-hide-down {    transform: translateY(150%);    visibility: hidden; }  .wf__toolbar-wide {    width: 15em; }  .wf__toolbar.hide {    display: none !important; }.wf__editor p:first-child:empty:not(:focus)::before,.wf__editor div:first-child:empty:not(:focus)::before {  content: "placeholder_text";  color: grey;  font-style: italic; }/*# sourceMappingURL=site.css.map */';

// writeFree.js

const defaultContainerStyle = {
  'min-height': '2em',
  'max-width': '100%',
  margin: '1em auto',
  padding: '0em 1.5rem',
  'font-size': '1.25rem',
  'font-family': "'Crimson Text', serif",
  outline: 'none',
  color: '#333',
};

const defaultSectionStyle = {
  'font-size': '1.25rem',
  'max-width': '35rem',
  'margin-left': 'auto',
  'margin-right': 'auto',
};

const defaultLargeHeadingStyle = Object.assign({}, defaultSectionStyle);
defaultLargeHeadingStyle['font-size'] = '2rem';

const defaultSmallHeadingStyle = Object.assign({}, defaultSectionStyle);
defaultSmallHeadingStyle['font-size'] = '1.5rem';

const defaultImgStyle = Object.assign({}, defaultSectionStyle);
defaultImgStyle['max-width'] = '100%';


const defaultOptions = {
  divOrPar: 'p',
  sectionClass: '',
  sectionStyle: defaultSectionStyle,
  containerClass: '',
  containerStyle: defaultContainerStyle,
  largeHeadingClass: '',
  largeHeadingStyle: defaultLargeHeadingStyle,
  smallHeadingClass: '',
  smallHeadingStyle: defaultSmallHeadingStyle,
  imgClass: '',
  imgStyle: defaultImgStyle,
  emptyPlaceholder: 'Try writing here...',
};

/**
 * WriteFree - The initialization function used to create instances of the
 *  WriteFree editor.
 *
 * @param {Element} $ctn - The empty HTML Element, usually a div to be used as the
 *  container for the WriteFree editor.
 *
 * @returns {Editor} The WriteFree editor.
 */
function WriteFree($ctn, userOptions = {}) {
  console.log(userOptions);
  const options = (function setOptions() {
    const globalOptions = Object.create(defaultOptions);
    if (userOptions && typeof userOptions === 'object') {
      Object.keys(userOptions).forEach((option) => {
        globalOptions[option] = userOptions[option];
      });
    }
    return globalOptions;
  }());
  const $toolbarStyle = document.createElement('style');
  const newToolbarStyle = toolbarStyle.replace('placeholder_text', options.emptyPlaceholder);
  $toolbarStyle.appendChild(document.createTextNode(newToolbarStyle));
  document.getElementsByTagName('head')[0].appendChild($toolbarStyle);


  // Create and initialize the editor.
  const Editor = Object.create(editorBase);
  Editor.initWFEditor($ctn, options);
  return {
    html: Editor.html.bind(Editor),
    load: Editor.load.bind(Editor),
  };
}

export default WriteFree;
