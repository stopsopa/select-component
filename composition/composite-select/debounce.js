export default function debounce(fn, delay) {
  var timer = null;
  return function (...args) {
    var context = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}
