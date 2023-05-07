import type { Actions } from './$types';
import { PUBLIC_PROXY_URL } from "$env/static/public";
import {
	ChatCompletionRequestMessageRoleEnum,
} from "openai";
// import { Tiktoken, ModelData } from '@dqbd/tiktoken/lite';
// import { load } from '@dqbd/tiktoken/load';
// import registry from '@dqbd/tiktoken/registry.json';
// import models from '@dqbd/tiktoken/model_to_encoding.json';
// import { getJson } from "serpapi";

const suggestionsFromQdrant = async (input: string, payloads: { payload: {room: string, message: string }}[], apiKey: string): Promise<{content: string, error: undefined} | { content: undefined, error: string}> => {
	const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "gpt-3.5-turbo",
			messages: [...payloads.map(   ({ payload }) => ({ role: ChatCompletionRequestMessageRoleEnum.System, content: `ルーム:${payload.room};メッセージ：${payload.message}`})),
				{
					role: ChatCompletionRequestMessageRoleEnum.User,
					content: `Extract the text relevant to ${input} from all the previous system messages and only return that text, do not return anything else.`,
					// name,
				},]
		})
	})
	const { choices, error } = await completionResponse.json();
	const content = choices?.[0]?.message?.content;
	return {content, error}
}

export const actions = {
	default: async ({ request, platform }) => {
		const data = await request.formData();
		const message = data.get('message');
		const pastRoles = data.getAll('pastRoles');
		let pastContents = data.getAll('pastContents');
		let allMessages = pastRoles.map((role, index) => ({ role, content: pastContents[index] }))
		let api_key = platform?.env?.OPENAI_KEY;
		if (!api_key) {
			return {
				messages: [
					...allMessages,
					{ role: ChatCompletionRequestMessageRoleEnum.Assistant, content: "test" }
				]
			}
		}
		try {
			const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${api_key}`
				},
				body: JSON.stringify({
					model: "text-embedding-ada-002",
					input: message,
				})
			})

			const { data: embeddingData } = await embeddingResponse.json();
			const embedding = embeddingData[0].embedding;
			const qdrantResponse = await fetch(
				"https://qdrant.sassy.technology/collections/gc_first_test/points/search",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						vector: embedding,
						limit: 100,
						with_payload: true,
					}),
				}
			);
			const { result: qdrantPayloads } = await qdrantResponse.json();
			const { content, error} = await suggestionsFromQdrant(message, qdrantPayloads, api_key);
			if (error) throw error;
			allMessages = [
				...allMessages,
				{
					role: ChatCompletionRequestMessageRoleEnum.System,
					content: `グラッドキューブのチャット履歴の中にユーザーの質問に関連した内容は以下です
${content}`,
				},
				{
					role: ChatCompletionRequestMessageRoleEnum.User,
					content: message,
					// name,
				},
			];

			const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${api_key}`
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: allMessages,
				})
			})
			const { choices, error } = await completionResponse.json();
			const content = choices[0]?.message?.content;
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

		} catch (e) {
			console.log(e)
			return { error: e, messages: allMessages }
		}
	}
} satisfies Actions;