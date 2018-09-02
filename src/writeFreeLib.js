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
  if (Array.isArray(klasses)) {
    klasses.forEach(klass => $el.classList.add(klass));
  } else {
    $el.classList.add(klasses);
  }

  if (options && typeof options === 'object') {
    Object.keys(options).forEach((attr) => {
      $el.setAttribute(attr, options[attr]);
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
  if (!url.startsWith('http://') || !url.startsWith('https://')) {
    returnVal = `http://${url}`;
  } else {
    returnVal = url;
  }
  return returnVal;
}
