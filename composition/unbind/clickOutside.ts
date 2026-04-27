export function clickOutside(targets: HTMLElement | HTMLElement[], callback: (e: Event) => void) {
  const targetList = Array.isArray(targets) ? targets : [targets];
  const handler = (e: Event) => {
    const node = e.target as Node;
    const isInside = targetList.some((target) => target && target.contains(node));
    if (!isInside) {
      callback(e);
    }
  };

  console.log("document", document, "target: ", targetList);
  // Use capturing phase so we don't miss events if some child stops propagation
  document.addEventListener("click", handler, true);
  document.addEventListener("touchstart", handler, { capture: true, passive: true });

  return function unbind() {
    document.removeEventListener("click", handler, true);
    document.removeEventListener("touchstart", handler, true);
  };
}
