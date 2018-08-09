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