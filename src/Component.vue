<script setup lang="ts">

import { defineComponent, onMounted, onUpdated, onBeforeUnmount, h, ref, computed, watch, HTMLAttributes } from 'vue';
import { cn } from '@/shadcn/lib/utils';
import { Editor as Tiptap, EditorContent as TiptapContent } from '@tiptap/vue-3';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { ListItem } from '@tiptap/extension-list';
import { Button } from '@/shadcn/components/ui/button';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';


// Types

type Obj<T extends any = any> = Record<string, T>;


// Constants

const DEFAULT_TEXT = `
  <h2>
    Hi there,
  </h2>
  <p>
    this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text tiptap. But wait until you see the lists:
  </p>
  <ul>
    <li>
      That’s a bullet list with one …
    </li>
    <li>
      … or two list items.
    </li>
  </ul>
  <p>
    Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
  </p>
  <pre><code class="language-css">body {
display: none;
}</code></pre>
  <p>
    I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
  </p>
  <blockquote>
    Wow, that’s amazing. Good work, boy! 👏
    <br />
    — Mom
  </blockquote>
`;


// Defining the props

const props = defineProps<{
  class?: HTMLAttributes['class'] | null,
  text?: string|null,
  modelValue?: string|null,

  noDefault?: boolean|null,
}>();


// Defining the emits

const emit = defineEmits<{
  (e: 'compile', val: Obj | null): void,
  (e: 'input', val: string|null): void,
  (e: 'change', val: string|null): void,
  (e: 'update:modelValue', val: string|null): void,
}>();


// Defining the variables

// NOTE: kr: TipTap types are extremely large, use any here to keep declaration emit manageable
const tiptap = ref<any>(null);


// Defining the functions

// @ts-ignore
const set = (val: Obj | string | null): void => tiptap.value?.commands.setContent(val ?? '', false);

const upd = (): void => {
  const html = props.modelValue ?? props.text ?? defaultText.value;

  if (tiptap.value?.getHTML() === html) return;

  set(html);
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
  return props.noDefault ? '' : DEFAULT_TEXT;
});


// Defining the watchers

watch(defaultText, () => {
  upd();
});


// Defining the hooks

onMounted(() => {
  tiptap.value = new Tiptap({
    extensions: [
      Color.configure({ types: [ TextStyle.name, ListItem.name ] }),
      // @ts-ignore
      TextStyle.configure({ types: [ ListItem.name ] }),
      Underline,
      StarterKit,
    ],

    content: props.modelValue ?? props.text ?? defaultText.value,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();


      // Updating the data

      emit('compile', json);
      emit('input', html);
      emit('change', html);
      emit('update:modelValue', html);
    },
  });
});

onUpdated(() => {
  upd();
});

onBeforeUnmount(() => {
  tiptap.value?.destroy();
});


// Defining the expose

defineExpose({
  set: (val: Obj | string | null): void => set(val),
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
                @click="tiptap.chain().focus().toggleLink().run()"
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