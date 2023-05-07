import type { Actions } from './$types';
import { PUBLIC_PROXY_URL } from "$env/static/public";
import {
  ChatCompletionRequestMessageRoleEnum,
} from "openai";
// import { getJson } from "serpapi";
const INITIAL_MESSAGES: ChatCompletionRequestMessage[] = [
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


export function load() {
	return {
		messages: INITIAL_MESSAGES,
	};
}

export const actions = {
	default: async ({ cookies, request, platform }) => {
		try {
			const data = await request.formData();
			const message = data.get('message');
			let allMessages = data.get('pastMessages');
			const embeddingResponse = await fetch(`${PUBLIC_PROXY_URL}/embeddings`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					input: message,
				})
			});
			const { embedding } = await embeddingResponse.json();
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
			allMessages = [
				...allMessages,
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
					// name,
				},
			];

	    const completionResponse = await fetch(`${PUBLIC_PROXY_URL}/chat`, {
	        method: "POST",
	        headers: { "Content-Type": "application/json" },
	        body: JSON.stringify({
	          pastMessages: allMessages,
	        })
	    });
	    const {content} = await completionResponse.json();
	    allMessages = [
	      ...allMessages,
	      {
	        role: ChatCompletionRequestMessageRoleEnum.Assistant,
	        content,
	      },
	    ];
			return {
				messages: allMessages
			}

		} catch(e) {
			console.log(e)
			return {error: e}
		}
	}
} satisfies Actions;