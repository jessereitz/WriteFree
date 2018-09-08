import {
  addStyleFromObj,
  addClasses,
  generateElement,
  generateButton,
  isTarget,
  validateURL,
  findParentBlock,
  findNodeType,
} from './writeFreeLib.js';

const toolbarOffset = 5; // The number of pixels to offset the top of the toolbar.

// Classes for toolbar items.
const tbClass = (function tbClass() {
  const obj = {};
  obj.main = 'wf__toolbar';
  obj.btn = `${obj.main}__btn`;
  obj.btnDisabled = `${obj.btn}-disabled`;
  obj.btnCtn = `${obj.btn}-ctn`;
  obj.input = `${obj.main}__input`;
  obj.inputCtn = `${obj.input}-ctn`;
  obj.inputActive = `${obj.input}-active`;
  obj.hideUp = `${obj.main}-hide-up`;
  obj.hideDown = `${obj.main}-hide-down`;
  obj.wide = `${obj.main}-wide`;
  return obj;
}());

/**
 * Toolbar - The toolbar used for editing text in the WFEditor.
 *
 * @property {Element} $ctn - The div containing the toolbar. This div is
 *  created in the initToolbar method.
 * @property {Element} $boldBtn - When clicked, bolds current selection.
 * @property {Element} $italicBtn - When clicked, italicizes current selection.
 * @property {Element} $headingBtn - When clicked, changes the section of the
 *  current selection to a heading (h3).
 * @property {Element} $linkBtn - When clicked, presents a box for inserting a
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
    this.$ctn = generateElement('div', [tbClass.main, 'hide']);
    this.$ctn.setAttribute('contenteditable', false);
    this.createToolbarBtns();
    this.generateInput();
    this.editor.$ctn.append(this.$ctn);
    document.addEventListener('mousedown', this.mouseDownHandler.bind(this));
    return this;
  },
  /**
   * createToolbarBtns - Create the buttons to be included on the toolbar, add
   *  appropriate event listeners, and attaches them to the $ctn.
   */
  createToolbarBtns() {
    this.$btnCtn = generateElement('div', tbClass.btnCtn);
    this.$boldBtn = generateButton('<b>B</b>', tbClass.btn, true);
    this.$italicBtn = generateButton('<i>i</i>', tbClass.btn, true);
    this.$headingBtn = generateButton('H', tbClass.btn);
    this.$linkBtn = generateButton('&#128279;', tbClass.btn, true);

    this.$btnCtn.append(this.$boldBtn);
    this.$btnCtn.append(this.$italicBtn);
    this.$btnCtn.append(this.$headingBtn);
    this.$btnCtn.append(this.$linkBtn);

    this.$ctn.append(this.$btnCtn);

    this.$ctn.addEventListener('click', this.clickHandler.bind(this));
  },

  /**
   * generateInput - Generates the input container, the input element itself,
   *  and the button used to close out of the input.
   */
  generateInput() {
    /**
     * defaultEnterHandler - Calls the attached saveHandler if present and
     *  hides the toolbar.
     *
     * @param {type} e Description
     *
     * @returns {type} Description
     */
    function defaultEnterHandler(e) {
      if (e.key === 'Enter') {
        if (
          this.$input.saveHandler
          && typeof this.$input.saveHandler === 'function'
        ) {
          this.$input.saveHandler.call(this);
        }
        this.hide();
      }
    }

    this.$inputCtn = generateElement(
      'div',
      [tbClass.inputCtn, tbClass.hideDown],
    );
    this.$input = generateElement('input', tbClass.input, { type: 'text' });
    this.$input.addEventListener('keypress', defaultEnterHandler.bind(this));

    this.$inputClose = generateButton(
      '<b>&times;</b>',
      tbClass.btn,
      true,
    );
    this.$inputClose.addEventListener('click', this.hideInput.bind(this));
    this.$inputCtn.append(this.$input);
    this.$inputCtn.append(this.$inputClose);
    this.$ctn.append(this.$inputCtn);
  },

  /**
   * clickHandler - Delegate and handle clicks on the Toolbar. This method
   *  takes a click event and delegates it to the appropriate child's click
   *  handler.
   *
   * @param {Event} e The click event to be processed.
   *
   * @returns {boolean} Returns true if the click event is handled
   *  successfully, else false.
   */
  clickHandler(e) {
    if (e.type !== 'click') return false;
    if (this.$boldBtn.contains(e.target) && !this.$boldBtn.disabled) {
      this.boldBtnHandler.call(this);
    } else if (this.$italicBtn.contains(e.target) && !this.$italicBtn.disabled) {
      this.italicBtnHandler.call(this);
    } else if (this.$headingBtn.contains(e.target) && !this.$headingBtn.disabled) {
      this.wrapHeading.call(this);
    } else if (this.$linkBtn.contains(e.target) && !this.$linkBtn.disabled) {
      this.linkBtnHandler.call(this);
    }
    return true;
  },

  /**
   * displayInput - Display the built-in input element of the ToolBar.
   *
   * @param {string} placeholder The placeholder to be put in the input.
   * @param {function} saveHandler THe function which will be called on save.
   *
   */
  displayInput(placeholder, saveHandler) {
    this.$input.placeholder = placeholder;
    if (typeof saveHandler === 'function') {
      this.$input.saveHandler = saveHandler;
    }
    this.$btnCtn.classList.add(tbClass.hideUp);
    this.$inputCtn.classList.remove(tbClass.hideDown);
    this.$ctn.classList.add(tbClass.wide);

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
   * hideInput - Hides the input and reselects the text which the user had
   *  selected. Also resets the input element and removes its saveHandler.
   *
   */
  hideInput() {
    if (this.currentRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(this.currentRange);
    }
    this.$btnCtn.classList.remove(tbClass.hideUp);
    this.$inputCtn.classList.add(tbClass.hideDown);
    this.$ctn.classList.remove(tbClass.wide);
    this.currentRange = null;
    this.$input.value = '';
    this.$input.saveHandler = null;
  },

  /**
   * getHTML - Render the Toolbar as HTML
   *
   * @returns {Element} The Toolbar as HTML.
   */
  getHTML() {
    return this.$ctn;
  },

  // findLink(selection) {
  //   if
  // },

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
    if (this.containsSelection(sel)) return false;
    const range = sel.getRangeAt(0);
    const currentLink = findNodeType(range.commonAncestorContainer, 'A');
    if (currentLink && sel.containsNode(currentLink, true)) {
      this.$linkBtn.classList.add(tbClass.inputActive);
      this.$linkBtn.currentLink = currentLink;
    } else {
      this.$linkBtn.currentLink = null;
      this.$linkBtn.classList.remove(tbClass.inputActive);
    }
    const parentnode = findParentBlock(sel.anchorNode);
    if (parentnode.tagName === 'H1' || parentnode.tagName === 'H2') {
      this.$linkBtn.classList.add(tbClass.btnDisabled);
      this.$boldBtn.classList.add(tbClass.btnDisabled);
      this.$italicBtn.classList.add(tbClass.btnDisabled);
      this.$linkBtn.disabled = true;
      this.$boldBtn.disabled = true;
      this.$italicBtn.disabled = true;
    } else {
      this.$linkBtn.classList.remove(tbClass.btnDisabled);
      this.$boldBtn.classList.remove(tbClass.btnDisabled);
      this.$italicBtn.classList.remove(tbClass.btnDisabled);
      this.$linkBtn.disabled = false;
      this.$boldBtn.disabled = false;
      this.$italicBtn.disabled = false;
    }
    this.currentRange = range;
    const rect = range.getBoundingClientRect();
    this.$ctn.style.top = `${rect.bottom + toolbarOffset}px`;
    this.$ctn.style.left = `${rect.left}px`;
    this.$ctn.classList.remove('hide');
    return true;
  },

  displayInsertOptions() {
    this.display(window.getSelection());
  },

  /**
   * hide - Hides the Toolbar.
   *
   * @returns {boolean} Returns true if successful else false.
   */
  hide() {
    this.currentRange = null;
    this.hideInput();
    this.$ctn.classList.add('hide');
    if (this.$ctn.classList.contains('hide')) {
      return true;
    }
    return false;
  },

  /**
   * containsSelection - Tests whether this Toolbar contains given Selection
   *  object (sel).
   *
   * @param {Selection} sel The Selection to check for in the Toolbar.
   *
   * @returns {boolean} Returns true if the given sel object is a Selection
   *  and it is wholly contained within the Toolbar.
   */
  containsSelection(sel) {
    if (!(sel instanceof Selection)) return false;
    return this.$ctn.contains(sel.anchorNode) && this.$ctn.contains(sel.focusNode);
  },

  /**
   * mouseDownHandler - Handles the mousedown event on the document.
   *  - If the Toolbar, or its children, are the target of the click, the
   *  default behavior is prevented. This is done so the current Selection
   *  won't change or be emptied when applying formatting to the selected
   *  text.
   *
   * @param {Event} e The mousedown event.
   *
   * @returns {boolean} Returns true if the mousedown event is successfully
   *  handled, else false.
   */
  mouseDownHandler(e) {
    if (e.type !== 'mousedown') return false;
    if (e.target === this.$input) {
      this.$input.focus();
    }
    return true;
  },

  /**
   * boldBtnHandler - Bolds current selection when $boldBtn is clicked.
   */
  boldBtnHandler() {
    const sel = window.getSelection();
    if (sel instanceof Selection) {
      document.execCommand('bold', false);
    }
  },

  /**
   * italicBtnHandler - Italicizes current selection when $italicBtn is
   * clicked.
   */
  italicBtnHandler() {
    const sel = window.getSelection();
    if (sel instanceof Selection) {
      document.execCommand('italic', false);
    }
  },

  /**
   * linkBtnHandler - Handler for when $linkBtn is clicked.
   *
   * @returns {boolean} Returns true if successful else false.
   */
  linkBtnHandler() {
    function saveLink() {
      const url = validateURL(this.$input.value);
      if (!url) return false;
      const link = generateElement('a');
      link.href = url;
      this.currentRange.surroundContents(link);
      this.links.push(link);
      return link;
    }
    if (this.$linkBtn.currentLink) this.removeLink();
    else this.displayInput('http://...', saveLink);
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
      } else if (this.editor.isFirst(parentnode)) {
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
        sel.collapse(sel.focusNode, sel.focusNode.textContent.length);
      }
      return successful;
    }
    return false;
  },

  /**
   * isTarget - Wrapper around isTarget library function. Returns true if the
   *  Toolbar was clicked else false.
   *
   * @param {Event} e The JavaScript event to use for detection.
   *
   * @returns {boolean} True if editor was clicked, else false.
   */
  isTarget(e) {
    return isTarget(this.$ctn, e);
  },

  /**
   * removeLink - Removes the link which the selection contains.
   *
   */
  removeLink() {
    const sel = window.getSelection();
    this.currentRange = sel.getRangeAt(0);
    const range = document.createRange();
    range.selectNode(this.$linkBtn.currentLink);
    const plainText = document.createTextNode(this.$linkBtn.currentLink.textContent);
    range.deleteContents();
    range.insertNode(plainText);
    this.$linkBtn.currentLink = null;
    this.$linkBtn.classList.remove('wf__toolbar__input-active');
    sel.removeAllRanges();
  },
};
