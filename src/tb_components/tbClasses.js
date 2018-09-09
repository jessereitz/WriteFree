export default (function tbClass() {
  const obj = {};
  obj.main = 'wf__toolbar';
  obj.btn = `${obj.main}__btn`;
  obj.btnDisabled = `${obj.btn}-disabled`;
  obj.btnActive = `${obj.btn}-active`;
  obj.btnCtn = `${obj.btn}-ctn`;
  obj.input = `${obj.main}__input`;
  obj.inputCtn = `${obj.input}-ctn`;
  obj.hideUp = `${obj.main}-hide-up`;
  obj.hideDown = `${obj.main}-hide-down`;
  obj.wide = `${obj.main}-wide`;
  return obj;
}());
