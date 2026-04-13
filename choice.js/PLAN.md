VERY IMPORTANT: first of all: use grug skill
VERY IMPORTANT: first of all: use grug skill
VERY IMPORTANT: first of all: use grug skill
VERY IMPORTANT: first of all: use grug skill



        I need web component which I will be able to load as esm in the browser.
        It should represent view for <select><option></option></select> better replacement

        it should just allow me with raw html define basic structure and allow me to edit any state of that component either by updating attributes (this will make it framwork agonostin, - react, angular, vue, svelte, htmx, lit, vanilla js, etc) or by calling particular methods on the instance of web component in js

        Create shadow dom for component.

        ```
        <script type="module">
        import Select from "../select.js";

        </script>  

        // one option:
        var k = [
            {    
                key: null,
                label: '--unset--',
                selected: false,
                new: false
            },
            {    
                key: 'key1',
                label: 'Value 1',
                selected: true,
                new: true,
            },
            {    
                key: 'key1',
                label: 'Value 1',
                selected: true,
                new: false,
            },
        ]
        <web-select-component 
            id="[optionalId]" 
            options="<%= JSON.stringify(k) %>"
            selected="comma separated list of keys"
    multiple
    allow-new
    disabled
    loader
    searchable
    clearable
    error
/>

// where multiple is optional
// allow-new is also optional
// disabled is also optional
// loader is optional - when present it will be shown when options are loading
   loader and disabled should work independently, let me decide if we need to disable when loader shown or anything, that is just part of view scaffolding for programmer to use
// searchable is optional - when present it will be shown when options are loading
// clearable - if we should show "X" button to allow user to clear
// error - should add error styling - usually it means red color
   


    ```

        and I will be able in javascript to get

    ```

    const instance = ... // fill that in
    const selected = instance.getValue();


    ```

    also I would be able to set options at any moment with

    ```
        const instance = ...
        instance.setOptions(k);

    ```

    Or just by updating options="" with fresh json

    I should be able to also set value programmatically:

    But I know that I will not be able to do it until instance is hydrated so I need onLoad event like

    ```

        const editor = document.querySelector("...");

        editor.addEventListener("onLoad", () => {
            instance.setOptions(k); // now let's interact with component
            instance.setSelected(['key1', 'key2']);
        });
    ```

    Component should also make validation of option values. 

    if label or value is missing in any object then thorw clear information like

    ```
    throw new Error(`<select-component> error: ...`);
    ```

    or multiple null values are present

    - key can be null (just one option with null - optional), otherwise it can be unique string or unique number
    - label have to be string only, non empty
    - selected have to be boolean - when and have to be present, only one is allowed if no 'multiple' argument is present
    - key have to be unique, in options, but key can be selected multiple time if we allow that in onSelectAdd event - by default it will not be allowed, unless overwritten
- new flag indicates if option is new (not present in original data and created just now via this component), in that mode typed value will be used as label and id at the same time, it is not allowed to create when object by this id exist in loaded options (compare by key) and just don't add to the list if present, ignore user pressing enter, just demand futher editing


# other methods and events
```
    instance.setSelected(['key1', 'key2']) -- always array if multiple or not
        just don't allow [null, 'key1', 'key2', ...] - either [null] or ['key1', 'key2', ...]
instance.setMultiple(true) -- enable multiple mode
instance.setMultiple(false) -- disable multiple mode
instance.setAllowNew(true) -- enable allow new mode
instance.setAllowNew(false) -- disable allow new mode
instance.setDisabled(true) -- disable component
instance.setDisabled(false) -- enable component
instance.setLoader(true) -- show loader
instance.setSearchable(true) -- enable searchable mode
instance.setClearable(true) -- enable clearable mode
instance.setError(true) -- show error styling



    instance.addEventListener('change', (e) => {
        // where 
        e.detail = {
            mode: 'selection|attribute',
            selected: [ { key: 'key1', label: 'Value 1', new: false }, ... ], // list just selected
            multiple: true/false,
            allowNew: true/false,
            disabled: true/false,
            loader: true/false,
            clearable: true/false,
            error: true/false,
        }
    });
    // it should be triggered on any change, to any attibute or selection change

instance.addEventListener('error', (e) => {
    console.log(e.detail); // { message: '...' }
});
instance.addEventListener('onSelectAdd', (e) => {
    .. or twin method
instance.addEventListener('onSelectRemove', (e) => {
    e.detail = {
        selected: [ null  or 'key1', 'key2', ... ], // INTERNAL SELECTED VALUES
        option: { // option we are about to add/remove to/from above selected
            key: 'key1',
            label: 'Value 1',
            new: false,
        },
        multiple: true/false,
        allowNew: true/false,
        disabled: true/false,
        loader: true/false,
        clearable: true/false,
        error: true/false,
    },

    const copy = [...e.detail.selected];

        // that is for native onSelectAdd
        if (!copy.includes(e.detail.option.key)) {
            copy.push(e.detail.option.key)
        }

        // that is for native onSelectRemove
        copy = copy.filter(v => v !== e.detail.option.key) 

    return copy;
    // or 
    return [null] if we want to clear for some reason

    // by returning fresh selected list we are giving most control to the user
})

instance.addEventListener('onClear', () => {
    e.detail = {
        selected: [ null  or 'key1', 'key2', ... ], // INTERNAL SELECTED VALUES
        multiple: true/false,
        allowNew: true/false,
        disabled: true/false,
        loader: true/false,
        clearable: true/false,
        error: true/false,
    },
})

instance.addEventListener('onSearch', (e) => {
    e.detail = {
        query: 'search query',        
    }
    // allow user to do fetch here and do any interaction with that instance
    // for example to set loader and reload new options and unset loader
    // the same for disabled state
    // let user do debounce here too
    // but generally this is concern of the user to handle that 
    // web component should only provide callbacks
    // because state management beyond INTERNAL SELECTED VALUES is not it's responsibility
});    

// method allowing us to override default way of rendering option
instance.setOptionTemplate((option, meta, callNative: ) => {
    // where meta = {
        selected: [ null  or 'key1', 'key2', ... ], // INTERNAL SELECTED VALUES
        option: { // option we are about to add/remove to/from above selected
            key: 'key1',
            label: 'Value 1',
            new: false,
        },
        multiple: true/false,
        allowNew: true/false,
        disabled: true/false,
        loader: true/false,
        clearable: true/false,
        error: true/false,
    }

    if (callNative !== undefined && meta.selected.includes(meta.option.key)) {
        // this if statement will be called only when this logic is called internally        

        return; // don't render
    }

    // create fresh option
        const option = document.createElement('option');
        
        if (meta.selected) {
            option.classList.add('selected');
        }

        if (meta.selected.includes(meta.option.key)) {
            option.classList.add('selected');
        }

        if (meta.option.new) {
            option.classList.add('new');
        }

        option.setAttribute('data-interactive', meta.option.key); // only clicking these elements will trigger internal onAdd/onRemove events
        option.textContent = meta.option.label;
        option.value = meta.option.key;

    // or use native method and apply modifications
        const option = callNative(option, meta);    
        
        // when we will use callNative will not pass callNative as a third argument , that will make sure to not trigger skipping mechanism, this gives us control if we want to render given option or not. By default when internally callNative() is called it will skip rendering option when meta.selected.includes(meta.option.key) is true

    return option;
})

// above is more or less native 
    

```

# internal states

generally the component should hold internal list (let's call it INTERNAL SELECTED VALUES) of selected values in the form of the array of ids

if nothing selected it should have array [null]

when anything else selected it should have ['key1', 'key2', ...]

in non multiple mode it should just be array with one key, not empty 
when nothing selected it should have just array like [null]
to keep it consistent to multiple mode


