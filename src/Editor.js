import {
  addStyleFromObj,
  addClasses,
  generateElement,
  isDeletionKey,
  findParentBlock,
  containsSelection,
  validateURL,
  collapseSelectionToRange,
} from './writeFreeLib.js';

import editToolbar from './editToolbar.js';
import insertToolbar from './insertToolbar.js';

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
    this.classes.main = ['wf__editor'];
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
    let innerCtn = null;
    try {
      innerCtn = html.body.firstChild;
    } catch (exc) {
      return false;
    }
    if (innerCtn && innerCtn.classList.contains(this.classes.main)) {
      this.$ctn.innerHTML = '';
      this.$ctn.appendChild(innerCtn);
      this.$innerCtn = innerCtn;
    }
    return this.$ctn.contains(innerCtn);
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
