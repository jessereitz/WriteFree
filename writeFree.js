/**
 * WriteFree - The initialization function used to create instances of the
 *  WriteFree editor.
 *
 * @param {Element} ctn - The empty HTML Element, usually a div to be used as the
 *  container for the WriteFree editor.
 *
 * @returns {Editor} The WriteFree editor.
 */
function WriteFree(ctn) {
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
      return this;
    },
    /**
     * display - Display the Toolbar
     *
     * @returns {boolean} Returns true if successful else false.
     */
    display() {
      return false;
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
   * @property {Element} ctn - The outermost container of the WriteFree editor.
   *  ctn is passed in to the WriteFree instantiation function.
   */
  const Editor = {
    initWFEditor() {
      this.ctn = ctn;
      Toolbar.initToolbar();
      this.ctn.addEventListener('mouseup', this.mouseUpHandler.bind(this));
    },
    mouseUpHandler(e) {
      if (e) {
        return true;
      }
      return false;
    },
  };

  Editor.initWFEditor();
  return Editor;
}

WriteFree(document.getElementById('WriteFreeCtn'));
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
