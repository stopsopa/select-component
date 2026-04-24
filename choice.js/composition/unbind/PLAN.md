# important

first of all, for entire length of this conversation and plan, stick to grug skill

# plan

I need utility function/structure in javascript which you can bind to the dom element and as long as user will not click that element or anything in that element an event will be fired, but as long as user interact with that dom and it's children event won't be fired it's like exclusive click

interface expected would be

```js

function bindUnbind(target: HTMLElement, onUnbindEvent: EventListenerOrEventListenerObject) {
 
    return unbind() {

    }
}

```

implement it in clickOutside.ts

and create next to it demo page and present few divs with some content inside and bind that event to those divs

