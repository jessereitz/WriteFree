(function () {
  'use strict';

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
      klasses.forEach(klass => $el.classList.add(klass));
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
   * isTarget - Detect whether given element or its children were the target of
   *  a JavaScript event.
   *
   * @param {Element} $el The HTML element on which to detect the event target.
   * @param {Event} e    The JavaScript event.
   *
   * @returns {boolean} Return true if the given element or one of its children
   *  was the target of the event.
   */
  function isTarget($el, e) {
    return $el.contains(e.target);
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
    if (!url.startsWith('http://') || !url.startsWith('https://')) {
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
  function collapseSelectionToRange(sel, range) {
    range.collapse();
    sel.removeAllRanges();
    sel.addRange(range);
  }

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
  var Toolbar = {

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
      this.createfirstPar();

      this.toolbar = Toolbar.initToolbar(this, this.options);
      this.$ctn.addEventListener('paste', this.pasteHandler.bind(this));
      this.$ctn.addEventListener('keydown', this.keydownHandler.bind(this));
      this.$ctn.addEventListener('keyup', this.keyupHandler.bind(this));
      this.$ctn.addEventListener('click', this.clickHandler.bind(this));
      // must be added to document because of browsers.
      document.addEventListener('selectionchange', this.selectionHandler.bind(this));
      return this;
    },

    generateClasses() {
      this.classes = {};
      this.classes.main = ['wf__editor'];
      if (this.options.containerClass !== 'wf__edtior') {
        this.classes.main.push(this.options.containerClass);
      }
      return this.classes;
    },

    /*
    ########     ###    ########     ###     ######   ########     ###    ########  ##     ##  ######
    ##     ##   ## ##   ##     ##   ## ##   ##    ##  ##     ##   ## ##   ##     ## ##     ## ##    ##
    ##     ##  ##   ##  ##     ##  ##   ##  ##        ##     ##  ##   ##  ##     ## ##     ## ##
    ########  ##     ## ########  ##     ## ##   #### ########  ##     ## ########  #########  ######
    ##        ######### ##   ##   ######### ##    ##  ##   ##   ######### ##        ##     ##       ##
    ##        ##     ## ##    ##  ##     ## ##    ##  ##    ##  ##     ## ##        ##     ## ##    ##
    ##        ##     ## ##     ## ##     ##  ######   ##     ## ##     ## ##        ##     ##  ######
    */

    /**
     * createfirstPar - The editor must have the a first div in order to ensure
     *  proper formatting. This method creates the first div and appends it to
     *  the inner container.
     */
    createfirstPar() {
      if (!this.$firstPar) {
        this.$firstPar = this.createPar();
      }
      this.$firstPar.textContent = '';
      const observer = new MutationObserver(() => {
        if (this.$firstPar.textContent === '') this.$firstPar.innerHTML = '';
      });
      observer.observe(
        this.$firstPar,
        { attributes: true, childList: true, subtree: true },
      );

      this.$innerCtn.append(this.$firstPar);
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(this.$firstPar, 0);
      range.setEnd(this.$firstPar, 0);
      sel.removeAllRanges();
      sel.addRange(range);
      window.firstpar = this.$firstPar;
    },

    createPar() {
      const parOptions = {
        style: this.options.sectionStyle,
        klasses: this.options.sectionClass,
      };
      return generateElement(this.options.divOrPar, [], parOptions);
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
        if (parentnode.tagName === 'H1' || parentnode.tagName === 'H2') {
          tagName = this.options.divOrPar;
          klass = this.options.sectionClass;
          style = this.options.sectionStyle;
        } else if (this.isFirst(parentnode)) {
          tagName = 'h1';
          klass = this.options.largeHeadingClass;
          style = this.options.largeHeadingStyle;
        } else {
          tagName = 'h2';
          klass = this.options.smallHeadingClass;
          style = this.options.smallHeadingClass;
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
        || containsSelection(sel, this.toolbar.html())
      ) {
        this.toolbar.display(sel);
      } else {
        this.toolbar.hide();
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
    newLineHandler() {
      const sel = window.getSelection();
      const parentBlock = findParentBlock(sel.focusNode);
      const newPar = this.createPar();
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
        newPar.append(document.createTextNode(''));
        newPar.append(document.createElement('br'));
      }
      currentRange.deleteContents();
      if (parentBlock.textContent.length === 0) {
        parentBlock.append(document.createElement('br'));
      }
      sel.removeRange(currentRange);
      const newRange = document.createRange();
      newRange.setStart(newPar.firstChild, 0);
      sel.addRange(newRange);
      newPar.normalize();
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
      if (isDeletionKey(e)) {
        const sel = window.getSelection();
        if (
          sel.anchorNode.textContent.length < 1
          && this.$firstPar === sel.anchorNode
        ) {
          e.preventDefault();
        }
      }
      if (e.key === 'Enter' && this.$innerCtn.contains(e.target)) {
        e.preventDefault();
        this.newLineHandler();
      }
    },

    /**
     * keyupHandler - Watches for deletion keys and resets the editor container
     *  if they remove the first inner paragraph. Also normalizes the current
     *  section so that all text nodes are merged together (this helps with
     *  newline generation).
     *
     * @param {KeyboardEvent} e The KeyboardEvent to test.
     */
    keyupHandler(e) {
      if (isDeletionKey(e)) {
        if (
          this.$innerCtn.innerHTML === '' || this.$innerCtn.innerHTML === '<br>'
        ) {
          this.$innerCtn.innerHTML = ''; // Get rid of auto-inserted <br>
          this.createfirstPar();
        }
      }
      // Normalize section
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

    clickHandler(e) {
      if (isTarget(this.$ctn, e)) {
        if (e.target.textContent === '') ;
      }
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
     * html - Returns the Editor in HTML form.
     *
     * @returns {Element} The Editor in HTML form.
     */
    html() {
      return this.$innerCtn;
    },

    /**
     * getToolbar - Returns the Toolbar associated with this Editor.
     *
     * @returns {Toolbar} The Toolbar associated with this Editor.
     */
    getToolbar() { return this.toolbar; },

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

  // writeFree.js

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
    const defaultOptions = {
      divOrPar: 'p',
      sectionClass: null,
      sectionStyle: null,
      containerClass: 'wf__editor',
      containerStyle: null,
      largeHeadingClass: null,
      largeHeadingStyle: null,
      smallHeadingClass: null,
      smallHeadingStyle: null,
    };

    const options = (function setOptions() {
      const globalOptions = Object.create(defaultOptions);
      if (userOptions && typeof userOptions === 'object') {
        Object.keys(userOptions).forEach((option) => {
          globalOptions[option] = userOptions[option];
        });
      }
      return globalOptions;
    }());

    // Create and initialize the editor.
    const Editor = Object.create(editorBase);
    Editor.initWFEditor($ctn, options);

    return {
      html: Editor.html.bind(Editor),
    };
  }

  const options = {
    divOrPar: 'div',
    sectionClass: 'testSection',
    sectionStyle: {
      // color: '#fff',
    },
    containerClass: 'testContainer',
    containerStyle: {
      // background: '#333',
    },
  };

  window.wf = WriteFree(document.getElementById('WriteFreeCtn'), options);

}());
