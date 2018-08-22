/**
 * generateElement - Quickly generates an HTML element with given tagName,
 *  classes, and id.
 *
 * @param {string} [tagName=div] The tag name to use for the element.
 * @param {string|string[]}  [klasses=[]]  A single string or an array of
 *  strings representing the classes to be added to the element.
 * @param {string} [id=''] An optional id to be added to the element.
 *
 * @returns {Element} The newly-created HTML element.
 */
export function generateElement(tagName = 'div', klasses = [], id = '') {
  const $el = document.createElement(tagName);
  if (Array.isArray(klasses)) {
    klasses.forEach(klass => $el.classList.add(klass));
  } else {
    $el.classList.add(klasses);
  }
  if (id) $el.setAttribute('id', id);
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
export function generateButton(value = 'Button', klasses = [], id = '') {
  const $btn = generateElement('button', klasses, id);
  $btn.textContent = value;
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
 * inputType - Returns
 */
export function inputType(event) {
  if (event.inputType) {
    return event.inputType;
  }
  if (event.type) {
    return event.type;
  }
  return null;
}

export function isBackspace(event) {
  return (event.key === 'Backspace')
    || (event.ctrlKey && event.key === 'Backspace')
    || (event.shiftKey && event.key === 'Backspace')
    || (event.altKey && event.key === 'Backspace')
    || (event.metaKey && event.key === 'Backspace');
}
