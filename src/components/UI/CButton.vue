<template>
  <button
    type="button"
    class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    :class="{
      'pointer-events-none': disabled,
    }"
    :disabled="disabled"
    @click="buttonClick"
  >
    <slot name="before-text" />
    {{ text }}
  </button>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: false,
      default: "",
    },
    disabled: {
      type: Boolean,
      required: false,
      disabled: false,
    },
  },
  emits: {
    buttonClick() {
      return true;
    },
  },
  methods: {
    buttonClick() {
      this.$emit("buttonClick");
    },
  },
};
</script>
