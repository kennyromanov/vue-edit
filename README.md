# vue-edit

**vue-edit** is a minimalist Vue 3 component that wraps [TipTap](https://tiptap.dev/) into a small, predictable editor. It emits HTML via `v-model`, and can also provide TipTap JSON through the `compile` event.

## Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Editor from 'vue-edit';

const html = ref<string|null>(null);
</script>

<template>
  <Editor hint="Write something..." v-model="html" />
</template>
```

## Installation

1. Install **dependencies**:

```shell
npm i vue-edit tailwindcss
```

2. Add the **CSS** import in your CSS file:

```css
@import "vue-edit/index.css";
```

3. **You're all set!**

---
**vue-edit**  
by Kenny Romanov
