// writeFree.js

import {
  generateElement,
  generateButton,
  isTarget,
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
      // this.$ctn.addEventListener('click', this.clickHandler.bind(this));
      this.createToolbarBtns();
      return this;
    },
    /**
     * createToolbarBtns - Create the buttons to be included on the toolbar.
     *
     * @returns {null}
     */
    createToolbarBtns() {
      const btnClassName = `${this.className}__btn`;
      this.$boldBtn = generateButton('B', btnClassName);
      this.$italicBtn = generateButton('i', btnClassName);
      this.$headingBtn = generateButton('H', btnClassName);
      this.$linkBtn = generateButton('<a/>', btnClassName);
      // this.$boldBtn.addEventListener('mouseup', this.clickHandler.bind(this));
      this.$ctn.append(this.$boldBtn);
      this.$ctn.append(this.$italicBtn);
      this.$ctn.append(this.$headingBtn);
      this.$ctn.append(this.$linkBtn);
    },
    /**
     * display - Display the Toolbar
     *
     * @returns {boolean} Returns true if successful else false.
     */
    display() {
      this.$ctn.classList.remove('hide');
      return this.$ctn;
    },
    render() {
      return this.$ctn;
    },

    /**
     * hide - Hides the Toolbar.
     *
     * @returns {boolean} Returns true if successful else false.
     */
    hide() {
      this.$ctn.classList.add('hide');
    },
    clickHandler(e) { e.preventDefault(); },

    /**
     * boldBtnHandler - Handler for when $boldBtn is clicked.
     *
     * @returns {boolean} Returns true if successful else false.
     */
    boldBtnHandler() {
      return false;
    },

    /**
     * italicBtnHandler - Handler for when $italicBtn is clicked.
     *
     * @returns {boolean} Returns true if successful else false.
     */
    italicBtnHandler() {
      return false;
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
    containsNode($node) {
      return $ctn.contains($node);
    },
  };

  /**
   * Editor - The main object representing the WriteFree editor.
   *
   * @property {Element} $ctn - The outermost container of the WriteFree editor.
   *  $ctn is passed in to the WriteFree instantiation function.
   */
  const Editor = {
    initWFEditor() {
      this.$innerCtn = generateElement('div', 'wf__editor');
      this.$innerCtn.setAttribute('contenteditable', true);
      $ctn.append(this.$innerCtn);

      const firstDiv = generateElement('div');
      firstDiv.append(generateElement('br'));
      firstDiv.textContent = 'Try writing here...';
      this.$innerCtn.append(firstDiv);
      Toolbar.initToolbar();

      $ctn.append(Toolbar.render());
    },
    selectionHandler(selection) {
      if (!this.containsNode(selection.anchorNode) || !this.containsNode(selection.focusNode)) {
        return false;
      }
      if (selection.isCollapsed) {
        Toolbar.hide();
      } else {
        Toolbar.display();
      }
      console.log('selection');
      return true;
    },
    showToolBar() {
      // console.log(Toolbar);
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
    containsNode($node) {
      return $ctn.contains($node);
    },
    getToolbar() { return Toolbar; },
    getSelection() { return this.selection; },
  };

  function mouseDownHandler(e) {
    if (!Editor.isTarget(e) && !Toolbar.isTarget(e)) {
      Toolbar.hide();
    }

    if (!Toolbar.isTarget(e)) {
      const s = window.getSelection();
      s.removeAllRanges();
      if (!s.toString()) {
        return true;
      }
    }
    if (Toolbar.isTarget(e)) { e.preventDefault(); }
    return false;
  }

  function mouseUpHandler(e) {
    // if (Toolbar.isTarget(e.target)) {
    //   return false;
    // }
    // this.selection = window.getSelection();
    // if (this.selection.anchorOffset !== this.selection.focusOffset) {
    //   Toolbar.display();
    // } else {
    //   Toolbar.hide();
    // }
    // return false;
  }

  function keypressHandler(e) {
    if (Editor.isTarget(e) || Toolbar.isTarget(e)) {
      Toolbar.hide.call(Toolbar);
    }
  }

  function selectionHandler(e) {
    const sel = window.getSelection();
    Editor.selectionHandler(sel);
  }

  document.addEventListener('mouseup', mouseUpHandler);
  document.addEventListener('mousedown', mouseDownHandler);
  document.addEventListener('keypress', keypressHandler);
  document.addEventListener('selectionchange', selectionHandler);
  Editor.initWFEditor();
  return Editor;
}

window.wf = WriteFree(document.getElementById('WriteFreeCtn'));
/*
  WFEditor
    ctn
    toolbar
    mouseUpHandler

  WFToolbar
    PROPS:
    ctn (create in init)
    boldBtn
    italicBtn
    headingBtn
    linkBtn

    METHODS:
    display (selection)
    hide
    boldBtnHandler
    italicBtnHandler
    headingBtnHandler
    linkBtnHandler
*/
