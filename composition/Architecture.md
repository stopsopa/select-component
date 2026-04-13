<description>
This is set of classes and generally files meant to build custom select opitons dropdown.
Entire implementation is build with composition of few manager classes with some assisting functions/libraries.

Then on top of that formation/composition of classes we will have web component wrapper classes and then on top of web components there are react wrappers.

This way we can have implementation of component which can be used in vanilla js, in any web component based framework and also in react.
</description>

<vanilla>
# Location and general composition of components

## Vanilla js mangers

So composition/selected-section/SelectedSectionManager.ts is the class creating simple widget to show what components are selected
Then we have composition/options-section/OptionsSectionManager.ts class which implements the options list widget with filter/search box and generally options to choose from.

Then we have simple composition/container/ContainerManager.ts class to put one html div on top of another and gives control over showing/hiding of that and positioning this div with native popover api (https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)

Then we have another class composition/composite-select/CompositeManager.ts which combines ContainerManager.ts with SelectedSectionManager.ts and OptionsSectionManager.ts. Where ContainerManager.ts target div for popover api is used to render SelectedSectionManager.ts and once popover div opens in it OptionsSectionManager.ts is rendered.

This is main
</vanilla>

<web-component>
## web components (second layer of abstraction)

Then we have first web component wrapper composition/selected-section/selected-section.ts this one is independed wrapper just for composition/selected-section/SelectedSectionManager.ts to make it available in the form of web component on its own.

The same composition/options-section/options-section.ts is web component wrapper on top of composition/options-section/OptionsSectionManager.ts to make it available as is.

Then we have composition/composite-select/composite-select.ts which combines ContainerManager.ts with SelectedSectionManager.ts and OptionsSectionManager.ts. Where ContainerManager.ts target div for popover api is used to render SelectedSectionManager.ts and once popover div opens in it OptionsSectionManager.ts is rendered. (composite-select.ts is not using selected-section.ts, options-section.ts it uses SelectedSectionManager.ts and OptionsSectionManager.ts directly). This web component represent main import for using this project as web component.
</web-component>

<react>
# React wrappers (third layer of abstraction)

The same way we have composition/selected-section/react.ts wrapper on top of composition/selected-section/selected-section.ts.
Second wrapper is composition/options-section/react.ts is wrapper on top of composition/options-section/options-section.ts.

Third one is composition/composite-select/react.ts which is wrapper on top of composition/composite-select/composite-select.ts. and this one is main mounting point for the react what this project is attempting to offer.

</react>

<implications>

So above section describes relience of each higher layer on the one just below it.
So naturally the foundation api of managers for js are reflected in web component attributes and later upstream in react components.

The caveat is that web component wrappers exposes primitive values via attributes but when it comes to binding events we have to get access to manager from dom element level:

```js

// finding web component dom element
const cs = section.querySelector('[data-role="cs"]') as CompositeSelect<DemoItem>;

// getting instance of manager powering/governing that web component instance
const mgr = cs.getManager()!;

// binding events

mgr.selected.propOptions.onDelete = (id: string) => {
    ...
};

mgr.options.propOptions.onItemPick = (item: any) => {
    ...
};

// and triggering actions
mgr.container.show();
mgr.container.hide();
mgr.selected.setSelected(selected);
mgr.selected.setFocus()

```

Where we have to remember that most complex (core) component composition/composite-select/composite-select.ts for web component getManager() returns manager wich is wrapper (composition/composite-select/CompositeManager.ts) around 3 simpler managers:

```js

select?: SelectedSectionManagerOptions<T>;
options?: OptionsSectionManagerOptions<T>;
container?: ContainerManagerOptions;

// see in composition/composite-select/CompositeManager.ts

```

So since we have to get hold of the managers in order to trigger actions and bind events the same happens in react wrappers.
So React wrappers exposes primite values (string|boolean|number|string[]|object) via props but when it comes to binding events we can get access via getManager() from underlying web component instance:

```jsx

    <CompositeSelect<CustomItem>
        ref={csRef}
        selected-selected={selectedItems}
        selected-value={selectedValue}
        selected-label={labelSel}
        selected-disabled={disabledSel}
        ...
    </CompositeSelect>


    const csRef = useRef<CompositeSelectElement<CustomItem>>(null);

    const getManager = () => csRef.current?.getManager();

    // from that point we can whatever we could from web component
    getManager()?.container.hide();

    // here is component prioritising using direct access to manager and using it to bind events and trigerring actions vite-project/src/pages/CompositeSelectDemoAttr.tsx

```

React wrapper components though makes attempt to expose events via attributes too.
example demo component using it this way vite-project/src/pages/CompositeSelectDemoAttr.tsx

we can see that events here are bound with attributes

```jsx


    selected-onFocus={handleFocus}
    selected-onDelete={handleDelete}
    selected-onInputChange={handleChangeValue}
    selected-onClear={handleClear}
    selected-onChange={(selected) => console.log("onChange: ", selected)}
    selected-onComponentChange={handleSelectedItemsChanged}
    // and

    options-onItemPick={handlePick}
    options-onInputChange={handleInputChange}
    options-onOk={handleOk}
    options-onCancel={handleCancel}
    options-onComponentChange={handleOptionsChanged}


```

It is worth mentioning that for these argument style event binding managers SelectedSectionManager.ts and OptionsSectionManager.ts internally handle these events differently

```js
if (this.propOptions.onDelete) {
  this.propOptions.onDelete.call(this, id);
}
this._subscriber.trigger("onDelete", id);

// or
if (this.propOptions.onInputChange) {
  this.propOptions.onInputChange.call(this, e, previousValue);
}
this._subscriber.trigger("onInputChange", e, previousValue);
// and so on
```

The reason for that is setting event via attribute is different in the way that only one event can be bound per component this way.

But managers expose

```js


  public getSubscriber() {
    return this._subscriber;
  }

```

and that subscriber can be used to bind more than one event handler of the same type.
But that subscriber is not used for attributes.

So important things is that for fundamental state management managers classes are responsible and these provied foundation api for managing all functionalities but each layer on top (web component and react wrappers) are just wrappers so these bind to managers properties and methods and provide access to them. User can use web component or react components attributes but can get direct access to underlying managers an work with them directly.

</implications>

<state-management>

By it's nature since this project is about implementing more somphisticated alterntive to select option html functionality these components hold a state:

1. State regarding selected options and available options I'm talking about
   I would call these main MAIN STATES, because these are not simple types but arrays of objects and are representing the core data this component is designed to manage.

```js

// From: CompositeManager.ts
mgr.selected.getSelected();
mgr.selected.setSelected([...])

mgr.options.setOptions([...]);
mgr.options.getOptions()


above is the main two states of the component.

2) There are other assisting states that are exposed via managers but these are just reflecting current state:
I would call these HELPER PRIMITIVE STATES, because usually these are just either boolean or strings, primitive types.
* mgr.selected:
    - value (string) mgr.selected.getValue() & mgr.selected.setValue(string)
    - input label (string) mgr.selected.getLabel() & mgr.selected.setLabel(string)
    - loading state (boolean) mgr.selected.getLoading() & mgr.selected.setLoading()
    - disabled state (boolean) mgr.selected.getDisabled() & mgr.selected.setDisabled()
    - error state (boolean) mgr.selected.getError() & mgr.selected.setError()
    - show input (boolean) mgr.selected.getShowInput() & mgr.selected.setShowInput()
    - show delete (boolean) mgr.selected.getShowDelete() & mgr.selected.setShowDelete()
    - setFocus() is not really a state we set and get current value - it's more like trigger and when popup is dismissed we allow popup to hide (with natural popover api behaviour) but we are not tracking it's state.
    - There are also two method for managing UI. One to control rendering individual selected items setRenderItem(fn) (there is not getter). Can be also called without argument setRenderItem() that will restore default/builtin rendering template function. Another is setRenderList, this one uses internally this.propOptions.renderItem set with setRenderItem(fn) but is responsible for controlling how to render entire set. We can for example decide to render 3 elements in one div in here which we wouldn't be able to control from setRenderItem(fn).


* mgr.options:
    - value (string) mgr.selected.getValue() & mgr.selected.setValue(string)
    - input label (string) mgr.selected.getLabel() & mgr.selected.setLabel(string)
    - loading state (boolean) mgr.selected.getLoading() & mgr.selected.setLoading()
    - disabled state (boolean) mgr.selected.getDisabled() & mgr.selected.setDisabled()
    - show filter (boolean) mgr.options.getShowFilter() & mgr.options.setShowFilter()
    - show footer (boolean) mgr.options.getShowFooter() & mgr.options.setShowFooter()
    - maxHeight (string) mgr.options.getMaxHeight() & mgr.options.setMaxHeight(string)
    - there is additional state field but we don't usually manage it manually setMaxHeight(string) & setHighlightedId(id)
    - There are also two method for managing UI. One to control rendering individual options renderItem(fn) (there is not getter). Can be also called without argument renderItem() that will restore default/builtin rendering template function. Another is setRenderList, this one uses internally this.propOptions.renderOption set with renderItem(fn) but is responsible for controlling how to render entire set. We can for example decide to render 3 elements in one div in here which we wouldn't be able to control from renderItem(fn).
    - Also there is method setRenderEmpty(fn) to set placeholder when no options are available (list empty). Also calling it without argument restored default template setRenderEmpty()

</state-management>

<examples>

# for SelectedSectionManager.ts
    - Raw javascript - direct SelectedSectionManager use composition/selected-section/SelectedSectionManager.html.ts
    - Web component usage relying on getManager() composition/selected-section/SelectedSectionManagerWebComponent.html
    - Web component relying as much as possible on setting attributes composition/selected-section/SelectedSectionManagerWebComponent.attributes.html
    - Web component injecting css without additional http request for css (bundling css) composition/selected-section/SelectedSectionManagerWebComponent.nocssrequest.html. This one happend to be also demo page for properties setRenderItem() and setRenderList()

# for OptionsSectionManager.ts:
    - Raw javascript - direct OptionsSectionManager use composition/options-section/OptionsSectionManager.html
    - Web component usage relying on getManager() composition/options-section/OptionsSectionManagerWebComponent.html
    - Web component relying as much as possible on setting attributes composition/options-section/OptionsSectionManagerWebComponent.attributes.html
    - Web component injecting css without additional http request for css (bundling css) composition/options-section/OptionsSectionManagerWebComponent.nocssrequest.html.

# for react 
    - vite-project/src/pages/SelectedSectionDemo.tsx demo for react wrapper on top of composition/selected-section/SelectedSectionManager.ts
    - vite-project/src/pages/OptionsSectionDemo.tsx demo for react wrapper on top of composition/options-section/OptionsSectionManager.ts
    - vite-project/src/pages/CompositeSelectDemo.tsx demo for react wrapper on top of composition/composite-select/CompositeManager.ts - relying on getManager() to call setters for state management
    - vite-project/src/pages/CompositeSelectDemoAttr.tsx demo for react wrapper on top of composition/composite-select/CompositeManager.ts - relying on attributes for state management


</examples>







```
