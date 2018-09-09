import {
  addStyleFromObj,
  addClasses,
  generateElement,
  isTarget,
  isDeletionKey,
  findParentBlock,
  containsSelection,
  validateURL,
  collapseSelectionToRange,
} from './writeFreeLib.js';

// import Toolbar from './Toolbar.js';
import InputToolbar from './inputToolbar.js';

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

    this.toolbar = InputToolbar.init(this, this.options);
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
      if (e.target.textContent === '') {
        // this.toolbar.displayInsertOptions();
      }
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
