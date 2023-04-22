<script lang="ts">
  export let content: string
</script>
<div class="chat-message">
  <div class="flex items-end">
    <div
      class="flex flex-col space-y-2 text-xs max-w-md mx-2 order-2 items-start"
    >
      <div>
        <span
          class="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600 text-lg"
          >{content}</span
        >
      </div>
    </div>
    <img
      src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
      alt="My profile"
      class="w-6 h-6 rounded-full order-1"
    />
  </div>
</div>
