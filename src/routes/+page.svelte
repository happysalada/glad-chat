<script lang="ts">
  import {
    Configuration,
    OpenAIApi,
    ChatCompletionRequestMessageRoleEnum,
  } from "openai";
  import type { ChatCompletionRequestMessage } from "openai";
	import { PUBLIC_PROXY_URL } from "$env/static/public";

  import BotMessage from "$lib/BotMessage.svelte";
  import UserMessage from "$lib/UserMessage.svelte";

  let messages: ChatCompletionRequestMessage[] = [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        "貴方は株式会社グラッドキューブの全社員のアシスタントです。社員の質問にできるだけ的確の答えをください",
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.Assistant,
      content:
        "私は株式会社グラッドキューブの全社員のアシスタントです。過去のチャット履歴を学習しました。質問ください",
    },
  ];
  let message = "";
  let from = "";
  // TODO figure out which name could work with ^[a-zA-Z0-9_-]{1,64}$'
  $: name = from.length == 0 ? "glad-cube_employee" : "glad-cube_employee";
  // const el = document.getElementById("messages");
  // el.scrollTop = el.scrollHeight;

  async function sendMessage(): Promise<void> {
    const embeddingResponse = await fetch(`${PUBLIC_PROXY_URL}/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: message,
        })
    });
    const {embedding} = await embeddingResponse.json();
    const qdrantResponse = await fetch(
      "https://qdrant.sassy.technology/collections/gc_first_test/points/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vector: embedding,
          limit: 10,
          with_payload: true,
        }),
      }
    );
    const { result: qdrantPayloads } = await qdrantResponse.json();
    console.log("related chats", qdrantPayloads);
    messages = [
      ...messages,
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: `グラッドキューブのチャット履歴の中にユーザーの質問に関連した内容は以下です
      ${qdrantPayloads.map(
        ({ payload }: { payload: { room: string; message: string } }) =>
          `ルーム:${payload.room};メッセージ：${payload.message}`
      )}`,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: message,
        name,
      },
    ];
    const completionResponse = await fetch(`${PUBLIC_PROXY_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
        })
    });
    const {content} = await completionResponse.json();
    messages = [
      ...messages,
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content,
      },
    ];
    message = "";
  }

  function exportJson() {
    const jsonString = JSON.stringify(messages, null, 2);
    // Pretty print the JSON data

    const blob = new Blob([jsonString], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    // Create an anchor element with the download attribute

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "messages.json";

    // Add the download link to the DOM and simulate a click

    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up

    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(url);
  }
</script>

<!-- component -->
<div class="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">
  <div
    class="flex sm:items-center justify-between py-3 border-b-2 border-gray-200"
  >
    <div class="relative flex items-center space-x-4">
      <div class="relative">
        <img
          src="/logo.svg"
          alt=""
          class="w-10 sm:w-24 h-10 sm:h-24 rounded-full"
        />
      </div>
      <div class="flex flex-col leading-tight">
        <div class="text-2xl mt-1 flex items-center">
          <div>
            <label for="name" class="sr-only">Email</label>
            <input
              type="text"
              name="name"
              id="name"
              bind:value={from}
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="お名前"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
        on:click={exportJson}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
      </button>
    </div>
  </div>
  <div
    id="messages"
    class="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
  >
    {#each messages as { role, content }}
      {#if role == "assistant"}
        <BotMessage {content} />
      {:else if role == "user"}
        <UserMessage {content} />
      {/if}
    {/each}
  </div>
  <div class="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
    <div class="relative flex">
      <span class="absolute inset-y-0 flex items-center">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="h-6 w-6 text-gray-600"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      </span>
      <input
        type="text"
        placeholder="メッセージを書く"
        bind:value={message}
        on:keydown={(e) => {
          if (e.key === "Enter" && e.shiftKey) sendMessage();
        }}
        class="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3"
      />
      <div class="absolute right-0 items-center inset-y-0 hidden sm:flex">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="h-6 w-6 text-gray-600"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="h-6 w-6 text-gray-600"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="h-6 w-6 text-gray-600"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <button
          type="button"
          on:click={sendMessage}
          class="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
        >
          <span class="font-bold">Send</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-6 w-6 ml-2 transform rotate-90"
          >
            <path
              d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .scrollbar-w-2::-webkit-scrollbar {
    width: 0.25rem;
    height: 0.25rem;
  }

  .scrollbar-track-blue-lighter::-webkit-scrollbar-track {
    --bg-opacity: 1;
    background-color: #f7fafc;
    background-color: rgba(247, 250, 252, var(--bg-opacity));
  }

  .scrollbar-thumb-blue::-webkit-scrollbar-thumb {
    --bg-opacity: 1;
    background-color: #edf2f7;
    background-color: rgba(237, 242, 247, var(--bg-opacity));
  }

  .scrollbar-thumb-rounded::-webkit-scrollbar-thumb {
    border-radius: 0.25rem;
  }
</style>
