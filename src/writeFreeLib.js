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
export function addStyleFromObj($el, styleObj) {
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
export function addClasses($el, klasses) {
  if (!klasses) return $el;
  if (Array.isArray(klasses)) {
    klasses.forEach((klass) => {
      if (typeof klass === 'string' && klass.length > 0) $el.classList.add(klass);
    });
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
export function generateElement(tagName = 'div', klasses = [], options = {}) {
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
export function generateButton(
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
export function isTarget($el, e) {
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
export function isDeletionKey(event) {
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
export function validateURL(url) {
  let returnVal;
  if (!url.includes('.')) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
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
export function findParentBlock($el) {
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
export function findNodeType(node, targetType) {
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
export function containsSelection(sel, node) {
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
export function collapseSelectionToRange(sel, range, toStart = false) {
  range.collapse(toStart);
  sel.removeAllRanges();
  sel.addRange(range);
}
