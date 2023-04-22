<script lang="ts">
  export let content: string
</script>
<div class="chat-message">
  <div class="flex items-end justify-end">
    <div
      class="flex flex-col space-y-2 text-xs max-w-md mx-2 order-1 items-end"
    >
      <div>
        <span
          class="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white text-lg"
          >{content}</span
        >
      </div>
    </div>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-6 h-6 rounded-full order-2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
      />
    </svg>
  </div>
</div>
