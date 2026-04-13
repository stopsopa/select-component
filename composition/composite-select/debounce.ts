export default function debounce<Args extends any[]>(
  fn: (...args: Args) => any,
  delay: number
): (...args: Args) => void {
  var timer: any = null;
  return function (this: any, ...args: Args) {
    var context = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args as any);
    }, delay);
  };
}
