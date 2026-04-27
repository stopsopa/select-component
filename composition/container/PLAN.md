
# important

first of all, for entire length of this conversation and plan, stick to grug skill

# Plan

I need to build ContainerManager.ts
which will work on two divs

These two divs have to work together using browser native popover api.

Logic have to be encapsulated in ContainerManager.ts


First what we have to do is to create two divs

```html
<div>
  <div>target</div>
  <div class="popover cover-bottom" data-popover="" popover="">
    popover
  </div>
</div>
```

where class .cover-bottom is part of positioning elements on top of each other with popover api with the help of choice.js/floating-label-pattern.css
See more about it in popover-api skill.


Also as a hint I would like to mention that it is already implemented in choice.js/select.ts 

and parent element there is  class="web-select-component" and popover element is <div class="popover cover-bottom" data-popover="" popover="">
and target element is .flex-list

so really I need ContainerManager.ts to work on given div and allow it to create the <div class="popover cover-bottom" data-popover="" popover=""> and target div automatically 

and once these two are created I have to have on my manager methods

show() and hide() 

which will use native popover api showPopover() and hidePopover() methods.

and I should have freedom to create whatever I want inside these two elements

also 

I have to have three methods on manager getParent(), getTarget() and getPopover()

which will return dom element for each to further work on these elements

target and popover elemnts always have to take all available width and always have to be equal in width

ContainerManager should also have destroy() method to remove target and popover elements from the dom and do all necessary cleanups before
(like unbinding events)

# build

You have to work in ContainerManager.ts and assume there is transpiling runner always running in the background transpiling typescript from it to ContainerManager.js next to it.

# demo

create choice.js/composition/container/demo.html case for this component.
use ContainerManager.js using native browser ESM.

implement button "Initialize New Instance" similar to choice.js/composition/options-section/OptionListManager.html

and it should always create fresh <div> and initialize ContainerManager class with it (passing in contrustor the div).

In demo we have to have buttons show and hide triggering .showPopover() and .hidePopover() method on ContainerManager instance.

Do not add CSS styles to demo, just use choice.js/floating-label-pattern.css for the positioning.

each new instance created with button "Initialize New Instance" should be encapsulated in center-and-height-resizer (see js/CenterAndHeightResizer.ts)

also element popover should have risizable <textarea> in it to see how it will behave with size changing content
target elemnet shold also ahve textarea 

I also need 3 buttons for each instance to execute console.log with label and what each method returns getParent(), getTarget() and getPopover().

we should also have method setPosition(string) to change class like 'bottom' or 'cover-bottom' (by default 'cover-bottom' should be set)
(according to hoice.js/floating-label-pattern.css)



