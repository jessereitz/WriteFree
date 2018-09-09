import {
  generateElement,
  isTarget,
  isDeletionKey,
  findParentBlock,
  containsSelection,
} from './writeFreeLib.js';

import toolbarBase from './Toolbar.js';

/**
* Editor - The main object representing the WriteFree editor.
*
* @property {Element} $ctn - The outermost container of the WriteFree editor.
*  $ctn is passed in to the WriteFree instantiation function.
* @property {Element} $innerCtn - The actual contetneditable-div in which the
*  user can write
*/
export default {
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

    this.toolbar = Object.create(toolbarBase);
    this.toolbar.initToolbar(this, this.options);
    this.$ctn.addEventListener('paste', this.pasteHandler.bind(this));
    this.$ctn.addEventListener('keydown', this.keydownHandler.bind(this));
    this.$ctn.addEventListener('keyup', this.keyupHandler.bind(this));
    this.$ctn.addEventListener('click', this.clickHandler.bind(this));
    // must be added to document.
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
   * isTarget - Wrapper around isTarget library function. Returns true if the
   *  editor was clicked else false.
   *
   * @param {Event} e The JavaScript event to use for detection.
   *
   * @returns {boolean} True if editor was clicked, else false.
   */
  isTarget(e) {
    return isTarget(this.$ctn, e);
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
    return this.$ctn.contains($node);
  },

  /**
   * getToolbar - Returns the Toolbar associated with this Editor.
   *
   * @returns {Toolbar} The Toolbar associated with this Editor.
   */
  getToolbar() { return this.toolbar; },
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
    const range = sel.getRangeAt(0);
    const startParent = findParentBlock(sel.anchorNode);
    const endParent = findParentBlock(sel.focusNode);
    if (startParent) startParent.normalize();
    if (endParent) endParent.normalize();
    if (range.commonAncestorContainer) range.commonAncestorContainer.normalize();
  },

  clickHandler(e) {
    if (this.isTarget(e)) {
      if (e.target.textContent === '') {
        this.toolbar.displayInsertOptions();
      }
    }
  },
  getHTML() {
    return this.$innerCtn;
  },
};
