In this script choice.js/html/body_style.html

there is this formation

```

  <div class="flex">
    <div id="left-div"></div>
    <div class="resizer" id="resizer-left"></div>
    <div>
      <label for="countries">Countries</label>
      <% if (d.multiple) { %>
      <select class="form-control gcp-css" name="countries" id="countries" multiple></select>
      <% } else { %>
      <select class="form-control gcp-css" name="countries" id="countries"></select>
      <% } %>
    </div>
    <div class="resizer" id="resizer-right"></div>
    <div id="right-div"></div>
  </div>

```


in here there are these two handlers allowing to change width of first and the last element, this way we are controlling how big is the div in the middle

I will need thsi functionality to be used like so

```
<center-resizer>
whatever i like inside
</center-resizer>

I would like this web component to replicate this formation and whatever I render inside it it should be rendered in center div

this way I will have reusable web component for testing other things behaviour when it's width is changing


```