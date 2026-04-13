/**
  type Events = {
    login: [user: { id: string; name: string }];
    logout: [];
  };

  const subscriber = createSubscriber<Events>();

  const loginHandler = () => {}
  const logoutHandler = () => {}

  subscriber.bind("login", loginHandler);
  subscriber.bind("logout", logoutHandler);

  subscriber.trigger("login", { id: "1", name: "John" });

  subscriber.trigger("logout");
 */
export default function createSubscriber() {
  const bindings = new Map();
  function bind(event, handler) {
    if (!bindings.has(event)) {
      bindings.set(event, new Set());
    }
    bindings.get(event).add(handler);
    return () => unbind(event, handler);
  }
  function unbind(event, handler) {
    bindings.get(event)?.delete(handler);
  }
  function unbindGroup(event) {
    bindings.delete(event);
  }
  function trigger(event, ...args) {
    bindings.get(event)?.forEach((handler) => {
      handler(...args);
    });
  }
  function destroy() {
    bindings.clear();
  }
  function getCount() {
    let count = 0;
    bindings.forEach((handlers) => (count += handlers.size));
    return count;
  }
  return { bind, unbind, unbindGroup, trigger, destroy, getCount };
}
