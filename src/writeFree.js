// writeFree.js

import {
  generateElement,
  generateButton,
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
      return this.$ctn;
    },

    /**
     * hide - Hides the Toolbar.
     *
     * @returns {boolean} Returns true if successful else false.
     */
    hide() {
      return false;
    },

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
  };
  /**
   * Editor - The main object representing the WriteFree editor.
   *
   * @property {Element} $ctn - The outermost container of the WriteFree editor.
   *  $ctn is passed in to the WriteFree instantiation function.
   */
  const Editor = {
    initWFEditor() {
      const firstDiv = generateElement('div');
      firstDiv.append(generateElement('br'));
      $ctn.append(firstDiv);
      Toolbar.initToolbar();
      $ctn.addEventListener('mouseup', this.mouseUpHandler.bind(this));
      $ctn.append(Toolbar.display());
    },
    mouseUpHandler(e) {
      if (e) {
        // console.log('click!');
      }
      return false;
    },
    showToolBar() {
      // console.log(Toolbar);
    },
  };

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
