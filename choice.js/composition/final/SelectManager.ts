
// container/ContainerManager.ts
<%= d.render('../container/ContainerManager.ts') %>

// options-section/OptionListManager.ts
<%= d.render('../options-section/OptionListManager.ts') %>

// select-section/SelectedListManager.ts
<%= d.render('../select-section/SelectedListManager.ts') %>

// unbind/clickOutside.ts
<%= d.render('../unbind/clickOutside.ts') %>

// final library
<%= d.render('./SelectManager.lib.ts').replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"];?/g, '') %>