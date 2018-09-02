// writeFree.js

import {
  generateElement,
  generateButton,
  isTarget,
  isDeletionKey,
  validateURL,
} from './writeFreeLib.js';


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

  // Classes for toolbar items.
  const tbClass = (function tbClass() {
    const obj = {};
    obj.main = 'wf__toolbar';
    obj.btn = `${obj.main}__btn`;
    obj.btnCtn = `${obj.btn}-ctn`;
    obj.input = `${obj.main}__input`;
    obj.inputCtn = `${obj.input}-ctn`;
    obj.inputActive = `${obj.input}-active`;
    obj.hideUp = `${obj.main}-hide-up`;
    obj.hideDown = `${obj.main}-hide-down`;
    obj.wide = `${obj.main}-wide`;
    return obj;
  }());

  // const edClass = (function edClass() {
  //   return null;
  // }());

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
    initToolbar(editor) {
      this.editor = editor;
      this.links = [];
      this.$ctn = generateElement('div', [tbClass.main, 'hide']);
      this.$ctn.setAttribute('contenteditable', false);
      this.createToolbarBtns();
      this.generateInput();
      return this;
    },
    /**
     * createToolbarBtns - Create the buttons to be included on the toolbar, add
     *  appropriate event listeners, and attaches them to the $ctn.
     */
    createToolbarBtns() {
      this.$btnCtn = generateElement('div', tbClass.btnCtn);
      this.$boldBtn = generateButton('<b>B</b>', tbClass.btn, '', true);
      this.$italicBtn = generateButton('<i>i</i>', tbClass.btn, '', true);
      this.$headingBtn = generateButton('H', tbClass.btn);
      this.$linkBtn = generateButton('&#128279;', tbClass.btn, '', true);

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
      if (this.$boldBtn.contains(e.target)) {
        this.boldBtnHandler.call(this);
      } else if (this.$italicBtn.contains(e.target)) {
        this.italicBtnHandler.call(this);
      } else if (this.$headingBtn.contains(e.target)) {
        this.wrapHeading.call(this);
      } else if (this.$linkBtn.contains(e.target)) {
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
      const currentLink = this.links.find(link => (
        link.contains(sel.anchorNode)
        || link.contains(sel.focusNode)
        || sel.containsNode(link)
      ));
      if (currentLink) {
        this.$linkBtn.classList.add(tbClass.inputActive);
        this.$linkBtn.currentLink = currentLink;
      } else {
        this.$linkBtn.currentLink = null;
        this.$linkBtn.classList.remove(tbClass.inputActive);
      }
      this.currentRange = range;
      const rect = range.getBoundingClientRect();
      this.$ctn.style.top = `${rect.bottom + toolbarOffset}px`;
      this.$ctn.style.left = `${rect.left}px`;
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
     * wrapHeading - Wrap the current selection in a heading element. Wraps in
     *  H1 if the current selection is the first element in the Editor.
     *
     * @returns {boolean} Returns true if successful else false.
     */
    wrapHeading() {
      const sel = window.getSelection();
      const parentnode = sel.anchorNode.parentNode;
      let tagName;
      if (sel instanceof Selection) {
        if (parentnode.tagName === 'H1' || parentnode.tagName === 'H2') {
          tagName = 'div';
        } else if (this.editor.isFirst(parentnode)) {
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

  /**
   * Editor - The main object representing the WriteFree editor.
   *
   * @property {Element} $ctn - The outermost container of the WriteFree editor.
   *  $ctn is passed in to the WriteFree instantiation function.
   * @property {Element} $innerCtn - The actual contetneditable-div in which the
   *  user can write
   */
  const Editor = {

    /**
     * initWFEditor - Initializes the Editor. Creates an inner container div and
     *  fills it with a line break (done to ensure the first block of text is
     *  wrapped in a div); initializes the Toolbar; and adds the pasteHandler.
     *
     * @returns {Editor} Returns this.
     */
    initWFEditor() {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      this.$innerCtn = generateElement('div', 'wf__editor');
      this.$innerCtn.setAttribute('contenteditable', true);
      $ctn.append(this.$innerCtn);
      this.createfirstPar();

      Toolbar.initToolbar(this);
      $ctn.append(Toolbar.getHTML());
      $ctn.addEventListener('paste', this.pasteHandler.bind(this));
      $ctn.addEventListener('keydown', this.keydownHandler.bind(this));
      $ctn.addEventListener('keyup', this.keyupHandler.bind(this));
      return this;
    },

    /**
     * createfirstPar - The editor must have the a first div in order to ensure
     *  proper formatting. This method creates the first div and appends it to
     *  the inner container.
     */
    createfirstPar() {
      if (!this.$firstPar) {
        const firstParOptions = {
          id: 'wf__editor-first',
          placeholder: 'Try writing here...',
        };
        this.$firstPar = generateElement('p', [], firstParOptions);
      }
      this.$firstPar.textContent = '';
      const observer = new MutationObserver(() => {
        if (this.$firstPar.textContent === '') this.$firstPar.innerHTML = '';
      });
      observer.observe(this.$firstPar, { attributes: true, childList: true, subtree: true });

      this.$innerCtn.append(this.$firstPar);
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(this.$firstPar, 0);
      range.setEnd(this.$firstPar, 0);
      sel.removeAllRanges();
      sel.addRange(range);
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
      // if (e.target === Toolbar.$input) {
      //   Toolbar.display(sel);
      // }

      if (
        (this.containsSelection(sel) && !sel.isCollapsed)
        || Toolbar.containsSelection(sel)
      ) {
        Toolbar.display(sel);
      } else {
        Toolbar.hide();
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

    /**
     * getToolbar - Returns the Toolbar associated with this Editor.
     *
     * @returns {Toolbar} The Toolbar associated with this Editor.
     */
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
    },

    /**
     * keyupHandler - Watches for deletion keys and resets the editor container
     *  if they remove the first inner paragraph.
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
