<script lang="ts">
import { defineComponent } from 'vue'

// Renders nothing. A render function returning null leaves the same comment
// placeholder on the server and in the browser; an empty <template> renders
// nothing on the server but a comment in the browser, which breaks hydration.
export default defineComponent({
  name: 'IgnoreComponent',
  render: () => null,
})
</script>
