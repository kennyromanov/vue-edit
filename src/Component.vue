<script setup lang="ts">

import { defineComponent, onMounted, onBeforeUnmount, h, ref, computed, watch, HTMLAttributes } from 'vue';
import { Editor as Tiptap, EditorContent as TiptapContent } from '@tiptap/vue-3';
import { isset } from '@/lib';
import { cn } from '@/shadcn/lib/utils';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { ListItem } from '@tiptap/extension-list';
import { Button } from '@/shadcn/components/ui/button';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import defaultText from './default-text.tpl?raw';


// Types

type Obj<T extends any = any> = Record<string, T>;


// Defining the props

const props = defineProps<{
  class?: HTMLAttributes['class'] | null,

  hint?: string|null,
  position?: number|string|null,
  from?: number|string|null,
  to?: number|string|null,

  extensions?: Obj[] | null,
  text?: string|null,
  modelValue?: string|null,

  noDefault?: boolean|null,
}>();


// Defining the emits

const emit = defineEmits<{
  (e: 'compile', val: Obj | null): void,
  (e: 'input', val: string|null): void,
  (e: 'change', val: string|null): void,
  (e: 'select', val: Obj): void,
  (e: 'update:position', val: number|null): void,
  (e: 'update:from', val: number|null): void,
  (e: 'update:to', val: number|null): void,
  (e: 'update:modelValue', val: string|null): void,
}>();


// Defining the variables

// NOTE: kr: TipTap types are extremely large, use any here to keep declaration emit manageable
const tiptap = ref<any>(null);
const from = ref<number|null>(null);
const to = ref<number|null>(null);


// Defining the functions

const updContent = (doFocus?: boolean|null): void => {
  const html = props.modelValue ?? props.text ?? _defaultText.value;

  if (tiptap.value?.getHTML() === html) return;

  setContent(html, doFocus);
};

const updSelection = (doFocus?: boolean|null): void => {
  const _from = props.from ?? from.value ?? props.position ?? null;
  const _to = props.to ?? to.value ?? _from;


  // Doing some checks

  if (!isset(_from) && !isset(_to))
    return;

  if (tiptap.value?.state.selection.from === _from && tiptap.value?.state.selection.to === _to)
    return;


  select(Number(_from), Number(_to), doFocus);
};

const upd = (): void => {
  const extensions: any[] = props.extensions ?? [];

  tiptap.value = new Tiptap({
    extensions: [
      Placeholder.configure({ placeholder: () => props?.hint || '' }),
      Color.configure({ types: [ TextStyle.name, ListItem.name ] }),
      // @ts-ignore
      TextStyle.configure({ types: [ ListItem.name ] }),
      Underline,
      StarterKit,

      ...extensions,
    ],

    content: props.modelValue ?? props.text ?? _defaultText.value,

    onCreate() {
      updContent(false);
      updSelection(false);
    },

    onUpdate({ editor }) {
      const json = editor.getJSON();
      const html = editor.getHTML();


      // Emitting the values

      emit('compile', json);
      emit('input', html);
      emit('change', html);
      emit('update:modelValue', html);
    },

    onSelectionUpdate({ editor }) {
      const _from = editor.state.selection.from ?? null;
      const _to = editor.state.selection.to ?? _from;


      // Updating the data

      from.value = _from;
      to.value = _to;


      // Emitting the values

      emit('select', { from: _from, to: _to });
      emit('update:position', _from);
      emit('update:from', _from);
      emit('update:to', _to);
    },
  });
};

const focus = (): void => { tiptap.value?.commands.focus(); };

const blur = (): void => { tiptap.value?.commands.blur(); };

const setContent = (val: Obj | string | null, doFocus?: boolean|null): void => {
  tiptap.value?.commands.setContent(val ?? '', false);
  if (doFocus ?? true) focus();
};

const select = (from?: number|null, to?: number|null, doFocus?: boolean|null): void => {

  // Doing some checks

  if (!isset(from) && !isset(to)) return;


  // Selecting the text

  tiptap.value?.commands.setTextSelection({ from, to });

  if (doFocus ?? true) focus();
};


// Defining the components

const EditorComponent = defineComponent({
  name: 'EditorComponent',

  setup() {
    return () => tiptap.value ? h(TiptapContent, {
      class: 'vue_edit_inner',
      editor: tiptap.value,
    }) : null;
  },
});


// Defining the computed

const _defaultText = computed<string>(() => {
  return props.noDefault ? '' : defaultText;
});


// Defining the watchers

watch(() => props.hint, () => {
  updContent(false);
});

watch(() => props.position, () => {
  updSelection(false);
});

watch(() => props.from, () => {
  updSelection(false);
});

watch(() => props.to, () => {
  updSelection(false);
});

watch(() => props.extensions, () => {
  upd();
});

watch(() => props.text, () => {
  updContent(false);
});

watch(() => props.modelValue, () => {
  updContent(false);
});


// Defining the hooks

onMounted(() => {
  upd();
});

onBeforeUnmount(() => {
  tiptap.value?.destroy();
});


// Defining the expose

defineExpose({
  focus: (): void => focus(),
  blur: (): void => blur(),
  setContent: (val?: Obj | string | null, doFocus?: boolean|null): void => setContent(val, doFocus),
  select: (from?: number|null, to?: number|null, doFocus?: boolean|null): void => select(from, to, doFocus),
});

</script>

<template>
  <div v-if="tiptap" :class="cn('vue_edit flex flex-col gap-10', props.class)">
    <slot :EditorComponent="EditorComponent" :tiptap="tiptap">
      <slot name="controls" :tiptap="tiptap">
        <div class="vue_edit_controls flex flex-wrap gap-6">
          <div class="vue_edit_control flex gap-1" aria-label="Text formatting">
            <Button
                size="sm"
                :variant="tiptap.isActive('bold') ? 'default' : 'secondary'"
                :disabled="!tiptap.can().chain().focus().toggleBold().run()"
                @click="tiptap.chain().focus().toggleBold().run()"
            >
              <b>B</b>
            </Button>

            <Button
                size="sm"
                :variant="tiptap.isActive('italic') ? 'default' : 'secondary'"
                :disabled="!tiptap.can().chain().focus().toggleItalic().run()"
                @click="tiptap.chain().focus().toggleItalic().run()"
            >
              <i>I</i>
            </Button>

            <Button
                size="sm"
                :variant="tiptap.isActive('underline') ? 'default' : 'secondary'"
                :disabled="!tiptap.can().chain().focus().toggleBlockquote().run()"
                @click="tiptap.chain().focus().toggleUnderline().run()"
            >
              <span class="underline">U</span>
            </Button>
          </div>

          <div class="vue_edit_control flex gap-1" aria-label="Headings">
            <!--<Button-->
            <!--    size="sm"-->
            <!--    :variant="tiptap.isActive('paragraph') ? 'default' : 'secondary'"-->
            <!--    @click="tiptap.chain().focus().setParagraph().run()"-->
            <!--&gt;-->
            <!--  Text-->
            <!--</Button>-->

            <Button
                size="sm"
                :variant="tiptap.isActive('heading', { level: 1 }) ? 'default' : 'secondary'"
                @click="tiptap.chain().focus().toggleHeading({ level: 1 }).run()"
            >
              H1
            </Button>

            <Button
                size="sm"
                :variant="tiptap.isActive('heading', { level: 2 }) ? 'default' : 'secondary'"
                @click="tiptap.chain().focus().toggleHeading({ level: 2 }).run()"
            >
              H2
            </Button>

            <Button
                size="sm"
                :variant="tiptap.isActive('heading', { level: 3 }) ? 'default' : 'secondary'"
                @click="tiptap.chain().focus().toggleHeading({ level: 3 }).run()"
            >
              H3
            </Button>
          </div>

          <div class="vue_edit_control flex gap-1" aria-label="Blocks">
            <Button
                size="sm"
                :variant="tiptap.isActive('bulletList') ? 'default' : 'secondary'"
                @click="tiptap.chain().focus().toggleBulletList().run()"
            >
              Bullet
            </Button>

            <Button
                size="sm"
                :variant="tiptap.isActive('orderedList') ? 'default' : 'secondary'"
                @click="tiptap.chain().focus().toggleOrderedList().run()"
            >
              List
            </Button>

            <Button
                size="sm"
                :variant="tiptap.isActive('codeBlock') ? 'default' : 'secondary'"
                @click="tiptap.chain().focus().toggleCodeBlock().run()"
            >
              Code
            </Button>

            <Button
                size="sm"
                :variant="tiptap.isActive('blockquote') ? 'default' : 'secondary'"
                @click="tiptap.chain().focus().toggleBlockquote().run()"
            >
              Quote
            </Button>
          </div>

          <div class="vue_edit_control flex gap-1" aria-label="History">
            <Button
                variant="secondary"
                size="sm"
                :disabled="!tiptap.can().chain().focus().undo().run()"
                @click="tiptap.chain().focus().undo().run()"
            >
              Undo
            </Button>

            <Button
                variant="secondary"
                size="sm"
                :disabled="!tiptap.can().chain().focus().redo().run()"
                @click="tiptap.chain().focus().redo().run()"
            >
              Redo
            </Button>
          </div>
        </div>
      </slot>

      <slot name="editor" :EditorComponent="EditorComponent">
        <EditorComponent />
      </slot>
    </slot>
  </div>

  <slot v-else name="noContent" :EditorComponent="EditorComponent">
    No Content
  </slot>
</template>