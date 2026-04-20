VERY IMPORTANT: first of all: use grug skill
VERY IMPORTANT: first of all: use grug skill
VERY IMPORTANT: first of all: use grug skill
VERY IMPORTANT: first of all: use grug skill


I would like to modify implementation from choice.js/custom directory which mainly uses logic from choice.js/select.ts.

The idea is to make it more composable.

I would like to create objects to manage components parts.

So what I'm trying to build here:

I want to build dropdown component as a web component. And in it we will distingquish few sections:

<selected list>

Section SELECTED LIST:

It will be list of selected elements. It will have to be able to manage list of elements so adding, removing, updating elements.

But also it will have to have provide ways to control how to render these elements with some reasonable default implementation.

So what I expect is to have class 

SelectedListManager:
which in constructor will accept parent element and it will manage all aspects above.

So roughly how I imagine it should be like follow:

```
type ListElement = {
  id: number;
  label: string;
  ... any other properties // allow controlling by generic
} 

// choice.js/composition/SelectedListManager.ts
class SelectedListManager<T extends ListElement> {
  constructor(parentElement, options = {
    list: [] as T[], // default empty list,    
    inputField: boolean: true, // if true, input field will be rendered. if false it will not be rendered at all,
    inputFieldValue: '',
    inputFieldRender: (value: string) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        return input;
    },
    renderItem: (item: T): HTMLElement => {
        // always render fresh element
        const el = document.createElement('div');
        el.textContent = item.label;
        el.setAttribute('data-id', String(item.id));
        return el;
    },
    renderList: (list: T[]): HTMLElement[] => {
        // returns list of fresh elements
        return list.map(item => this.options.renderItem(item));
    },    
  }) {
    this.parentElement = parentElement;
    this.options = options;
    this.list = options.list || [];
    this.inputElement = null;

    if (this.options.inputField) {
      this.inputElement = this.options.inputFieldRender(this.options.inputFieldValue);
    }

    this.render();
  }

  updateList(list: T[]) {
    this.list = list;
    this.render();
  }

  render() {
    const elements = this.options.renderList(this.list);

    if (!Array.isArray(elements)) {
      throw new Error('renderList must return an array of HTMLElements');
    }

    // clear the list (except touching input)
    const children = Array.from(this.parentElement.childNodes);
    for (const child of children) {
      if (child !== this.inputElement) {
        this.parentElement.removeChild(child);
      }
    }

    // rendering elements in order before input
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) {
        throw new Error('renderList must return an array of HTMLElements');
      }
      if (this.inputElement && this.inputElement.parentNode === this.parentElement) {
        this.parentElement.insertBefore(el, this.inputElement);
      } else {
        this.parentElement.appendChild(el);
      }
    }

    // ensure input is at the end if it was just created or detached
    if (this.inputElement && this.inputElement.parentNode !== this.parentElement) {
      this.parentElement.appendChild(this.inputElement);
    }
  }
}
```



Above is tructure to manipulate list but we have to also listenn to events triggered by user on rendered elements.

For example each elmenet on the list should have "X" button and once user click the buttun we should emmit event onDelete which user should be able to listen to and decide on his end how to handle it. and based on the decision user should reflect the change in the list by calling updateList or removeItem method.

Therefore tracing pressing "x" button should be handled with delegate methods, listening for data-remove="${item.id}" and then onDelete callback should be invoked with raw string value from that data-remove attribute. no other extra operation in that class regarding deleting the item.

User outside should decide how to handle this event.

Really source of truth is outside.

we should also have method to change error state, disable state and inputField which will add or remove input element.

We should also have "X" button on the right (like it is now done in choice.js/select.ts in <button class="clear-btn">✕</button>, it should trigger onClear event)

we have to also allow user to attach to onChange event on input.

.flex-list shold also implement floating label for input field like it is done in choice.js/select.ts

also we have to have similar method like setValue (let's call it setLabel) to control text in <label>

# style management

style for this component should rely on parent element class , let's decide about it's name here. Let's make it 'selected-list'.

Logic above should be handled (stylewise) as two elements from choice.js/select.ts the .flex-list and .buttons-container

we have to create new div encompasing these two elements with class .selected-list

and make all css styling all it's content encapsulated inside like 

```
.selected-list {
    .. all style here
}
```

IMPORTANT: use nesting css like it is now done in choice.js/select.ts

all style should be placed in SelectedListManager.css file

# input manipulation

I have to have method on that class to update value in <input>
also to control enabled disabled and error state

Also our class need to have option to register onChange event for inuput value

BTW: all events should be registered using event deletage on the parent element.








</selected list>


<end to end testing>

Create html choice.js/composition/SelectedListManager.html interactive demo using SelectedListManager class.

we should have button and once that button will be clicked it should in it's event listener:
- create parent element for selected list
- create empty array of ListElement
- that parent element should be added to DOM dedicated place
- that dom element should be mounted inside center-resizer
- but no only in resizer it should be mnounded with surrounding input to allow user to type, and once button will be clicked next to that input it should add element to the local list and trigger update in the list rendering in SelectedListManager.
- also we should subscribe to onDelete event from SelectedListManager and if user click "x" button on some element in the list we should remove it from our local list and trigger update in the list rendering in SelectedListManager.
- we have to also attach to onChange event and create small <pre> tag and always render in it value from input.
- also to the surrounding of of that instance of SelectedListManager we should add checkbox for controlling error state and disabled state also for inputField 
- we should also listend to onClear and handle it in our local state and then trigger rerender using SelectedListManager 
So generally we have to create like todo list instantiating one instance of SelectedListManager, and render it with surrounding inputs/buttons to manipulate all states (to tests all states) of SelectedListManager.


this demo page should obviously load SelectedListManager.css too

When user click "Add Item" we should prioritise value from input "New item label" but if empty we should also take value from input field attached to SelectedListManager

also on each press to "Add Item" clear "New item label" input

and if none of these inputs has value we should not add any item and not trigger the event to re-render the list.


in the group of control add also additional input to inject value for setValue in our class, to see if we will be able to control input value from outside

in the group of control add also additional input to inject value for setLabel in our class, to see if we will be able to control input value from outside



</end to end testing>