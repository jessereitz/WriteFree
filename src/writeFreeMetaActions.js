
function moveStart(range, backwards = true) {
  const newStart = (backwards) ? range.startOffset - 1 : range.startOffset + 1;
  if (newStart < 0) {
    return false;
  }
  range.setStart(range.startContainer, newStart);
  return range;
}


export function deleteWord() {
  let isFirst = false;
  const s = window.getSelection();
  const r = s.getRangeAt(0);
  window.r = r;
  moveStart(r);
  if (r.toString()[0] === ' ') {
    while (r.toString()[0] === ' ') {
      if (!moveStart(r)) break;
    }
  }
  if (r.toString()[0] !== ' ') {
    while (r.toString()[0] !== ' ') {
      if (!moveStart(r)) {
        isFirst = true;
        break;
      }
    }
  }
  if (isFirst) {
    const parent = s.anchorNode.parentNode;
    if (parent.lastChild.tagName !== 'BR') {
      const br = document.createElement('br');
      parent.append(br);
    }
  }
  r.deleteContents();
}

export function dummy() {
  return null;
}
