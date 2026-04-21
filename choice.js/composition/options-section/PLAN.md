<description>
I need to create class similar to SelectedListManager but this time for options section.

</description>

<plan>

Plan is as follow:

We will try to extract logic for that secton for first prototype implementation in choice.js/select.ts

More or less I'm after content represented by this div

```html
<div class="popover cover-bottom" data-popover="" popover="">
  <div class="filter">
    <input type="text" placeholder="Search..." />
    <span class="spinner"></span>
  </div>
  <div class="options">
    <div class="element selected" data-key="1"><label>Initial Option 1</label></div>
    <div class="element" data-key="2"><label>Initial Option 2</label></div>
  </div>
  <div class="footer">
    <button type="button" class="gcp-css" data-ok="" popovertargetaction="hide">OK</button>
    <button type="button" class="gcp-css white" popovertargetaction="hide">Cancel</button>
  </div>
</div>
```

we have to implement it in web component

```html
<options-section></options-section>
```

So I will need top section for serach input.

in that input we will have to have similar spinner for indicating loading state as we have in SelectedListManager.

But that's all. Beyond that similarity it will be just input[type=text].

We wll style it like inputs in choice.js/floating-label-pattern.css

Especially pay attention to focus state, I don't think I will need error state for now.

Pay attention to floating label pattern implementation.
for placeholder and label for that search input field.

also central container will have to have scrollbar when elements don't fit in given height.

From parameters we will have to control we will have to support in our class methods and features:

- setOptions(options: T[]) - updates the list of options - order in that array dictates display order
- we will have to have style borrowed from choice.js/select.ts
- setLoading(loading: boolean) - shows or hides spinner
- setValue(value: string) - sets the value of the input field
- setFocus() - sets the focus to the input field

from events:
- onItemClick(item: T) - triggered when an item is clicked
- onChange(value: string) - triggered when input value changes (that will have to have similar behaviour regarding backspace and enter like in SelectedListManager)
- onCancel() - triggered when Cancel button is clicked
- onOk() - triggered when OK button is clicked

We will have to have some indicator that there is no options to display -> empty list given.


</plan>

<demo>

I need demo in choice.js/composition/options-section/OptionListManager.html keep it simple, just render our web component 
wrapped with js/CenterAndHeightResizer.ts and see how it will work

you can add controls to change or listen for changes from that component 

generally handle it in groups and allow me to create multiple copies of that component and test it properly

</demo>
