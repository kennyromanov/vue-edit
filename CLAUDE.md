# vue-edit

Instructions for AI agents working with this repository.

---

## 0) Quick facts about this repository

* Purpose: a minimalist **Vue 3** library component — a wrapped **TipTap WYSIWYG editor** for web documents
* Output: emits **HTML** as the primary value; also provides **TipTap JSON** (ProseMirror document) via `compile`
* Stack:
    * Vue 3 (`<script setup>`, TypeScript)
    * Build: Vite library mode (`vite.config.ts`), Vue marked as external
    * Styles: Tailwind v4 (`src/index.css`) + a small shadcn/ui button implementation (`src/shadcn`)
    * Editor: `@tiptap/vue-3` with StarterKit / Underline / TextStyle / Color / ListItem
* Structure overview:
    * `src/Component.vue` — the main editor component (props/slots/emits/exposed methods)
    * `src/index.ts` — public entry (default export)
    * `src/index.css` — Tailwind base + component styling
    * `src/shadcn/` — small UI primitives used by the toolbar
    * `dist/` — built artifacts (`.js`, `.d.ts`, `.css`) created by the build
* Scripts / build:
    * Type generation via `vue-tsc`
    * CSS build via `@tailwindcss/cli`
    * Library build via Vite

> Agents: keep this library **small and predictable**. Prefer tiny, safe changes over ambitious redesigns

---

## 1) Agent protocol

1. **Understand the task**
    * Write a short plan (3–7 steps) before editing
2. **Minimal diff**
    * Change only what’s needed for the task
    * Avoid mass formatting, large refactors, or drive-by “cleanups”
3. **Preserve the public contract**
    * Props, emits, slots, and `defineExpose` methods are the public API
    * Do not change their semantics unless the task explicitly requires a breaking change
4. **Be cautious by default**
    * There are no tests yet; treat every behavioral change as high-risk
    * Prefer clear, defensive code and explicit edge-case handling
5. **Build sanity checks**
    * Ensure the library builds cleanly (Vite build, types via `vue-tsc`, CSS build)
    * `dist/` artifacts are expected to exist after a build
6. **Docs / examples**
    * If behavior changes, add or update a minimal usage example (README or package description)

---

## 2) Public API (source of truth)

### 2.1. Component export

* Default export from `src/index.ts`.

### 2.2. Props (do not break)

* `modelValue` — primary HTML value for `v-model`
* `text` — alternative source value
* `noDefault` — disables default/fallback demo content
* `class` — extra wrapper class

### 2.3. Emits (do not break)

* `update:modelValue` / `input` / `change` — HTML string updates
* `compile` — TipTap JSON output

### 2.4. Slots (do not break)

* `default` — receives editor component instance and `tiptap` editor instance
* `controls` — toolbar customization
* `editor` — editor UI customization
* `noContent` — empty-state customization

### 2.5. Exposed methods (do not break)

* `set(val: Obj | string | null)` — programmatic content set
    * Must continue accepting either HTML string or TipTap JSON
    * Should pass through to TipTap `setContent` without hidden transformations

---

## 3) Architecture and code placement

### 3.1. `src/Component.vue` (the integration point)

* This file is the main integration point: editor initialization, props/emits wiring, slots, toolbar, and expose
* Keep the component readable; avoid extracting logic into a complex framework
* Prefer small composables/helpers only when they clearly reduce duplication

### 3.2. Styling

* Tailwind v4 lives in `src/index.css`
* shadcn primitives live in `src/shadcn`
* Avoid introducing alternative styling systems

### 3.3. Build

* Vite library build + externalized Vue
* Keep dependencies light

---

## 4) Code style

vue-edit code should be **straightforward, explicit, and predictable**.

### 4.1. General principles

* One function / handler — one responsibility
* Prefer early returns and explicit guards
* Keep functions short (aim ≤ 40–60 lines)
* Avoid clever abstractions, implicit side effects, or “magic” helpers

### 4.2. Naming

* Data --> nouns: `editor`, `content`, `json`, `html`, `options`, `attrs`
* Actions --> verbs: `getEditor`, `setContent`, `emit`, `isEmpty`
* Avoid ambiguous abbreviations

### 4.3. Preferred function structure pattern

Use a consistent 4-step pattern (adapted for Vue handlers):

1. **Doing some checks** — validate inputs and required state
2. **Getting the data** — compute the values you need
3. **Defining the helpers** — local helper functions if necessary
4. **Main flow** — execute the core behavior

Example (content setter helper):

```ts

// Types

export type EditorLike = { commands: { setContent: (val: any) => void } };


// Functions

export function setEditorContent(editor: EditorLike | null, val: any): void {

  // Doing some checks

  if (!editor) return;

  if (val == null) return;


  // Getting the data

  const content = typeof val === 'string' ? val : val;


  // Defining the functions

  const set = (_val: any): void => {
    try { editor.commands.setContent(_val); }
    catch { /* Intentionally silent: Callers decide how to surface errors */ }
  };


  set(content);
}
```

Example (emit HTML in a predictable way):

```ts

// Types

export type EmitHandler = (e: string, ...args: any[]) => void;

export type Data = { getHtml: () => string };


// Functions

export function emitHtmlUpdates(emit: EmitHandler, val: Data | null): void {

  // Doing some checks

  if (!val) return;


  // Getting the data

  const html = val.getHtml();


  // Emitting the values

  emit('update:modelValue', html);
  emit('input', html);
  emit('change', html);
}
```

### 4.4. Breaking down “fat” component logic

❌ Bad: a single `onUpdate` handler doing validation + state sync + multiple emits + UI updates.

✔️ Good: split into small helpers:

* `getHtml(editor)`
* `emit(e, editor)`
* `applySomeValue(editor, val)`

Keep the main handlers short and readable

---

## 5) Behavior constraints

* The library is intentionally minimal
* Avoid expanding scope (new subsystems, heavy plugins, large architecture changes) unless explicitly requested
* SSR is not a target right now; do not introduce SSR-focused complexity by default

---

## 6) Pre-change checklist (lightweight)

* [ ] I have a short plan
* [ ] My diff is minimal and focused
* [ ] Props/emits/slots/exposed methods behavior is preserved
* [ ] Build still succeeds (library build, types, CSS)
* [ ] If behavior changed, I updated/added a minimal usage example
