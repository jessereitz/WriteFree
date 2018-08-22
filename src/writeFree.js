// writeFree.js

import {
  generateElement,
  generateButton,
  isTarget,
  inputType,
  isBackspace,
} from './writeFreeLib.js';

import {
  deleteWord,
} from './writeFreeMetaActions.js';

/**
 * WriteFree - The initialization function used to create instances of the
 *  WriteFree editor.
 *
 * @param {Element} $ctn - The empty HTML Element, usually a div to be used as the
 *  container for the WriteFree editor.
 *
 * @returns {Editor} The WriteFree editor.
 */
function WriteFree($ctn) {
  const toolbarOffset = 5; // The number of pixels to offset the top of the toolbar.
  const isMac = navigator.platform.indexOf('Mac') > -1;
  let Editor;

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
  const Toolbar = {

    /**
     * initToolbar - Initializes the Toolbar.
     *
     * @returns {Toolbar} Returns this.
     */
    initToolbar() {
      this.className = 'wf__toolbar';
      this.$ctn = generateElement('div', [this.className, 'hide']);
      this.$ctn.setAttribute('contenteditable', false);
      this.createToolbarBtns();
      return this;
    },
    /**
     * createToolbarBtns - Create the buttons to be included on the toolbar, add
     *  appropriate event listeners, and attaches them to the $ctn.
     */
    createToolbarBtns() {
      const btnClassName = `${this.className}__btn`;
      this.$boldBtn = generateButton('B', btnClassName);
      this.$italicBtn = generateButton('i', btnClassName);
      this.$headingBtn = generateButton('H', btnClassName);
      this.$linkBtn = generateButton('<a/>', btnClassName);

      this.$ctn.append(this.$boldBtn);
      this.$ctn.append(this.$italicBtn);
      this.$ctn.append(this.$headingBtn);
      this.$ctn.append(this.$linkBtn);

      this.$ctn.addEventListener('click', this.clickHandler.bind(this));
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
      switch (e.target) {
        case this.$boldBtn:
          this.boldBtnHandler.call(this);
          break;
        case this.$italicBtn:
          this.italicBtnHandler.call(this);
          break;
        case this.$headingBtn:
          this.headingBtnHandler.call(this);
          break;
        default:
          return false;
      }
      return true;
    },

    /**
     * display - Optionally display the Toolbar next to the given selection.
     *  The Toolbar is always returned as an HTML element.
     *
     * @param {Selection} [sel=null] The Selection next to which the Toolbar should be
     *  displayed.
     *
     * @returns {Element} Returns the toolbar as an HTML element.
     */
    display(sel = null) {
      if (sel instanceof Selection) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        this.$ctn.style.top = `${rect.bottom + toolbarOffset}px`;
        this.$ctn.style.left = `${rect.left}px`;
        this.$ctn.classList.remove('hide');
      }
      return this.$ctn;
    },

    /**
     * renderHTML - Render the Toolbar as HTML
     *
     * @returns {Element} The Toolbar as HTML.
     */
    renderHTML() {
      return this.$ctn;
    },

    /**
     * hide - Hides the Toolbar.
     *
     * @returns {boolean} Returns true if successful else false.
     */
    hide() {
      this.$ctn.classList.add('hide');
      if (this.$ctn.classList.contains('hide')) {
        return true;
      }
      return false;
    },

    /**
     * mouseDownHandler - Handles the mousedown event. If the Toolbar, or its
     *  children, are the target of the click, the default behavior is
     *  prevented. This is done so the current Selection won't change or be
     *  emptied when applying formatting to the selected text.
     *
     * @param {Event} e The mousedown event.
     *
     * @returns {boolean} Returns true if the mousedown event is successfully
     *  handled, else false.
     */
    mouseDownHandler(e) {
      if (e.type !== 'mousedown') return false;
      if (this.isTarget(e)) {
        e.preventDefault();
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
      return false;
    },

    /**
     * headingBtnHandler - Handler for when $headingBtn is clicked.
     *
     * @returns {boolean} Returns true if successful else false.
     */
    headingBtnHandler() {
      const sel = window.getSelection();
      const parent = sel.anchorNode.parentNode;
      let tagName;
      if (sel instanceof Selection) {
        if (parent.tagName === 'H1' || parent.tagName === 'H2') {
          tagName = 'div';
        } else if (Editor.isFirst(parent)) {
          tagName = 'h1';
        } else {
          tagName = 'h2';
        }
        document.execCommand('formatBlock', false, tagName);
      }
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
  };

  /**
   * Editor - The main object representing the WriteFree editor.
   *
   * @property {Element} $ctn - The outermost container of the WriteFree editor.
   *  $ctn is passed in to the WriteFree instantiation function.
   * @property {Element} $innerCtn - The actual contetneditable-div in which the
   *  user can write
   */
  Editor = {

    /**
     * initWFEditor - Initializes the Editor. Creates an inner container div and
     *  fills it with a line break (done to ensure the first block of text is
     *  wrapped in a div); initializes the Toolbar; and adds the pasteHandler.
     *
     * @returns {Editor} Returns this.
     */
    initWFEditor() {
      this.$innerCtn = generateElement('div', 'wf__editor');
      this.$innerCtn.setAttribute('contenteditable', true);
      this.$buffer = generateElement('div', 'wf__buffer');
      this.$buffer.setAttribute('contenteditable', false);
      this.$innerCtn.append(this.$buffer);
      $ctn.append(this.$innerCtn);

      const firstDiv = generateElement('div');
      firstDiv.append(generateElement('br'));
      firstDiv.textContent = 'Try writing here...';
      this.firstDiv = firstDiv;
      this.$innerCtn.append(firstDiv);
      Toolbar.initToolbar();

      $ctn.append(Toolbar.renderHTML());
      $ctn.addEventListener('paste', this.pasteHandler.bind(this));
      // $ctn.addEventListener('input', this.inputHandler.bind(this));
      $ctn.addEventListener('keydown', this.keydownHandler.bind(this));
      return this;
    },

    /**
     * containsSelection - Tests whether this Editor contains given Selection
     *  object (sel).
     *
     * @param {Selection} sel The Selection to check for in the Editor.
     *
     * @returns {boolean} Returns true if the given sel object is a Selection
     *  and it is wholly contained within the Editor.
     */
    containsSelection(sel) {
      if (!(sel instanceof Selection)) return false;
      return this.containsNode(sel.anchorNode) && this.containsNode(sel.focusNode);
    },

    /**
     * selectionHandler - Handles the given Selection (sel) event. If the given
     *  object is not a Selection this method will immediately return false.
     *  Otherwise it will display the Toolbar if the Selection is contained
     *  fully within this Editor and the Selection contains text. Otherwise it
     *  will hide the Toolbar.
     *
     *
     * @param {Selection} sel The current Selection within the document.
     *
     * @returns {boolean} Returns true if the given selection was successfully
     *  handled, else false.
     */
    selectionHandler(sel) {
      if (!(sel instanceof Selection)) return false;
      if (!this.containsSelection(sel) || sel.isCollapsed) {
        Toolbar.hide();
      } else {
        Toolbar.display(sel);
      }
      return true;
    },

    /**
     * isTarget - Wrapper around isTarget library function. Returns true if the
     *  editor was clicked else false.
     *
     * @param {Event} e The JavaScript event to use for detection.
     *
     * @returns {boolean} True if editor was clicked, else false.
     */
    isTarget(e) {
      return isTarget($ctn, e);
    },

    /**
     * containsNode - Tests whether the given node is contained within the
     *  Editor's HTML.
     *
     * @param {Element} $node The HTML element to test for.
     *
     * @returns {boolean} Returns true if the Editor contains $node, else false.
     */
    containsNode($node) {
      return $ctn.contains($node);
    },

    getToolbar() { return Toolbar; },

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
    isFirst($node) {
      if (this.$innerCtn.children[0] === $node) {
        return true;
      }
      return false;
    },
    inputHandler(e) {
      if (inputType(e).includes('delete')) {
        this.deleteTextHandler.call(this, e);
      }
    },
    backspaceHandler(e) {
      if (isBackspace(e)) {
        const s = window.getSelection();
        console.log(this.firstDiv === s.anchorNode.parentNode);
        // console.log(s.anchorNode.textContent.length <= 1);
        // console.log(s.anchorNode.textContent.length);
        // console.log(s.anchorNode.textContent);
        if ((s.anchorNode.textContent.length < 1) && (this.firstDiv === s.anchorNode.parentNode)) {
          console.log('yeah');
          e.preventDefault();
          return null;
        }
      }
      if ((e.ctrlKey || e.altKey) && e.key === 'Backspace') {
        e.preventDefault();
        deleteWord();
      }
      return null;
    },
    keydownHandler(e) {
      if (isBackspace(e)) {
        this.backspaceHandler(e);
      }
    },
  };

  /**
   * mouseDownHandler - Handles the mousedown event. Essentially passes
   *  processing of the event to the Toolbar's own mouseDownHandler method.
   *
   * @param {Event} e The mousedown event to be handled.
   *
   * @returns {boolean} Returns true if mousedown event was handled successfully
   *  else false.
   */
  function mouseDownHandler(e) {
    if (e.type !== 'mousedown') return false;
    Toolbar.mouseDownHandler(e);
    return true;
  }

  /**
   * selectionHandler - Handles the selectionchange event.
   *
   * @param {Event} e The selectionchange event.
   *
   * @returns {boolean} Returns true if selectionchange was successfully
   *  handled, else false.
   */
  function selectionHandler(e) {
    if (e.type !== 'selectionchange') return false;
    const sel = window.getSelection();
    Editor.selectionHandler(sel);
    return true;
  }

  document.addEventListener('mousedown', mouseDownHandler);
  document.addEventListener('selectionchange', selectionHandler);
  Editor.initWFEditor();
  return Editor;
}

window.wf = WriteFree(document.getElementById('WriteFreeCtn'));
