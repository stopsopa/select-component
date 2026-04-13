There is this idea of floating label css style for label to show on top of input when input has no value
but the moment user start typing that lable will be shrunk and placed on the top border on the left side
and user will be able to type as he wish

I have this done on this page
https://stopsopa.github.io/pages/html/float-label-pattern/index.html

the native css for this solution to style input and textarea this way is in file
@contextScopeItemMention 

I woud like to do the same styling for border

<div class="web-select-component">

and make 
<label class="floating-label">Select options</label>
the label which should take central place until first element will be added

also 
<div class="web-select-component">
should have border which looks the same like inputs in @contextScopeItemMention 

on top of that
    <button>X</button>
    <button>⬇️</button>

have to be always on the right
clicking X should clear all elements from flex-list
except input
clicking ⬇️
will be used later for something else
but these two buttons have to stick to the right and reserve the place for themself

then let's talk about flex-list

this is central  container which will have to accomodate any arbitrary number of <option> elements

it should use flexbox and allow children to naturally flex-wrap, with input always to be last element. but input should be just one of many elements of that list. But it should be the last element. and if the list is cleared it means only input should stay