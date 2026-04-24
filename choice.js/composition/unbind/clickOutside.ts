export function clickOutside(target: HTMLElement, onUnbindEvent: EventListenerOrEventListenerObject) {
  const handler = (e: Event) => {
    const node = e.target as Node;
    if (target && !target.contains(node)) {
      if (typeof onUnbindEvent === "function") {
        onUnbindEvent(e);
      } else if (onUnbindEvent && typeof onUnbindEvent.handleEvent === "function") {
        onUnbindEvent.handleEvent(e);
      }
    }
  };

  // Use capturing phase so we don't miss events if some child stops propagation
  document.addEventListener("click", handler, true);
  document.addEventListener("touchstart", handler, { capture: true, passive: true });

  return function unbind() {
    document.removeEventListener("click", handler, true);
    document.removeEventListener("touchstart", handler, true);
  };
}
