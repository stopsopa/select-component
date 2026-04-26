
# important

first of all, for entire length of this conversation and plan, stick to grug skill

# Plan

I would like to create SelectManager.lib.ts class which will combine logic of few other managers:

- choice.js/composition/container/ContainerManager.ts
- choice.js/composition/select-section/SelectedListManager.ts
- choice.js/composition/options-section/OptionsListManager.ts

and utility:

- choice.js/composition/unbind/clickOutside.ts

In it's constructor I would like first initialize ContainerManager.ts against given div
and then use SelectedListManager.ts on .getTarget()
and OptionsListManager.ts on .getTarget()

Then our manager should also expose field 'selected' which would hold reference to SelectedListManager instance
and field 'options' which would hold reference to OptionsListManager instance
also
field 'container' which would hold reference to ContainerManager instance

Also I would like to show popover (ContainerManager.ts -> .show()) on SelectedListManager.ts -> onFocus()

and hide popover on clickOutside.ts event bound to .getTarget()

SelectManager.lib.ts should have destroy method which would call all destroy methods of all managers.
and it would also unbind event from clickOutside.ts

before destroying entire html from initial dom element used in SelectManager.lib.ts constructor




# build process

Work in 
choice.js/composition/manager/SelectManager.lib.ts

Never touch
SelectManager.lib.js
SelectManager.rendered.js
SelectManager.rendered.ts
these are stages of final build to:
SelectManager.rendered.js

and when creating choice.js/composition/manager/demo.html load

choice.js/composition/manager/SelectManager.rendered.js

also assume there is always working transpiler which assembles  choice.js/composition/manager/SelectManager.rendered.ts by combining libraries using template choice.js/composition/manager/SelectManager.ts into choice.js/composition/manager/SelectManager.rendered.ts

after that choice.js/composition/manager/SelectManager.rendered.ts is transpiled to choice.js/composition/manager/SelectManager.lib.js

so in demo.html use load ESM choice.js/composition/manager/SelectManager.lib.js

in demo also create "Initialize Component" but also create button in each block around particular instance the button to destroy that instance and test .destroy() methods


