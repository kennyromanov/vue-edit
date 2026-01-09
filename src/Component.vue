<script setup lang="ts">

import { defineComponent, onMounted, onUpdated, onBeforeUnmount, h, ref, computed, watch, HTMLAttributes } from 'vue';
import { Editor as Tiptap, EditorContent as TiptapContent } from '@tiptap/vue-3';
import { isset } from '@/lib';
import { cn } from '@/shadcn/lib/utils';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { ListItem } from '@tiptap/extension-list';
import { Button } from '@/shadcn/components/ui/button';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import defaultTextStr from './default-text.tpl?raw';


// Types

type Obj<T extends any = any> = Record<string, T>;


// Defining the props

const props = defineProps<{
  class?: HTMLAttributes['class'] | null,

  hint?: string|null,
  position?: number|null,
  from?: number|null,
  to?: number|null,

  text?: string|null,
  modelValue?: string|null,

  noDefault?: boolean|null,
}>();


// Defining the emits

const emit = defineEmits<{
  (e: 'compile', val: Obj | null): void,
  (e: 'input', val: string|null): void,
  (e: 'change', val: string|null): void,
  (e: 'update:position', val: number|null): void,
  (e: 'update:from', val: number|null): void,
  (e: 'update:to', val: number|null): void,
  (e: 'update:modelValue', val: string|null): void,
}>();


// Defining the variables

// NOTE: kr: TipTap types are extremely large, use any here to keep declaration emit manageable
const tiptap = ref<any>(null);


// Defining the functions

const updContent = (): void => {
  const html = props.modelValue ?? props.text ?? defaultText.value;

  if (tiptap.value?.getHTML() === html) return;

  setContent(html);
};

const updSelection = (doFocus?: boolean|null): void => {
  if (!isset(props.from) && !isset(props.to) && !isset(props.position)) return;
  select(props.from ?? props.position, props.to ?? props.position, doFocus);
};

const setContent = (val: Obj | string | null): void => tiptap.value?.commands.setContent(val ?? '', false);

const select = (from?: number|null, to?: number|null, doFocus?: boolean|null): void => {

  // Doing some checks

  if (!isset(from) && !isset(to)) return;


  // Selecting the text

  tiptap.value?.setTextSelection({ from, to });

  if (doFocus ?? true) tiptap.value?.focus();
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

const defaultText = computed<string>(() => {
  return props.noDefault ? '' : defaultTextStr;
});


// Defining the watchers

watch(defaultText, () => {
  updContent();
});


// Defining the hooks

onMounted(() => {
  tiptap.value = new Tiptap({
    extensions: [
      Placeholder.configure({ placeholder: () => props?.hint || '' }),
      Color.configure({ types: [ TextStyle.name, ListItem.name ] }),
      // @ts-ignore
      TextStyle.configure({ types: [ ListItem.name ] }),
      Underline,
      StarterKit,
    ],

    content: props.modelValue ?? props.text ?? defaultText.value,

    onCreate() {
      updSelection(false);
    },

    onUpdate({ editor }) {
      const { from, to } = editor.state.selection;
      const json = editor.getJSON();
      const html = editor.getHTML();


      // Emitting the values

      emit('compile', json);
      emit('input', html);
      emit('change', html);
      emit('update:position', to);
      emit('update:from', from);
      emit('update:to', to);
      emit('update:modelValue', html);
    },
  });
});

onUpdated(() => {
  updContent();
  updSelection(false);
});

onBeforeUnmount(() => {
  tiptap.value?.destroy();
});


// Defining the expose

defineExpose({
  setContent: (val?: Obj | string | null): void => setContent(val),
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