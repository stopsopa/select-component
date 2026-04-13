# important

first of all, for entire length of this conversation and plan, stick to grug skill

# Plan

I would like to create CompositeManager.lib.ts class which will combine logic of few other managers:

- choice.js/composition/container/ContainerManager.ts
- choice.js/composition/selected-section/SelectedSectionManager.ts
- choice.js/composition/options-section/OptionsSectionManager.ts

and utility:

- choice.js/composition/unbind/clickOutside.ts

In it's constructor I would like first initialize ContainerManager.ts against given div
and then use SelectedSectionManager.ts on .getTarget()
and OptionsSectionManager.ts on .getTarget()

Then our manager should also expose field 'selected' which would hold reference to SelectedSectionManager instance
and field 'options' which would hold reference to OptionsSectionManager instance
also
field 'container' which would hold reference to ContainerManager instance

Also I would like to show popover (ContainerManager.ts -> .show()) on SelectedSectionManager.ts -> onFocus()

and hide popover on clickOutside.ts event bound to .getTarget()

CompositeManager.lib.ts should have destroy method which would call all destroy methods of all managers.
and it would also unbind event from clickOutside.ts

before destroying entire html from initial dom element used in CompositeManager.lib.ts constructor

# build process

Work in
choice.js/composition/composite-select/CompositeManager.lib.ts

Never touch
CompositeManager.lib.js
CompositeManager.rendered.js
CompositeManager.rendered.ts
these are stages of final build to:
CompositeManager.rendered.js

and when creating choice.js/composition/composite-select/demo.html load

choice.js/composition/composite-select/CompositeManager.rendered.js

also assume there is always working transpiler which assembles choice.js/composition/composite-select/CompositeManager.rendered.ts by combining libraries using template choice.js/composition/composite-select/CompositeManager.ts into choice.js/composition/composite-select/CompositeManager.rendered.ts

after that choice.js/composition/composite-select/CompositeManager.rendered.ts is transpiled to choice.js/composition/composite-select/CompositeManager.lib.js

so in demo.html use load ESM choice.js/composition/composite-select/CompositeManager.lib.js

in demo also create "Initialize Component" but also create button in each block around particular instance the button to destroy that instance and test .destroy() methods
