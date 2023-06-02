import type { Actions } from './$types';
import {
	ChatCompletionRequestMessageRoleEnum,
} from "openai";
import { getEncoding } from "js-tiktoken";
import type { Tiktoken } from 'js-tiktoken';

const mergeMaxTokens = (list: string[], encoder: Tiktoken, max: number): string[] => {
	let { chunks, currentText } = list.reduce(({ chunks, currentText, currentTokens }: { chunks: string[], currentText: string, currentTokens: number }, text) => {
		// let newTokens = encoder.encode(text);
		let newTokens = encoder.encode(text);
		if (currentTokens + newTokens.length < max) {
			currentTokens += newTokens.length;
			currentText += text;
			return { chunks, currentTokens, currentText }
		} else {
			chunks = [...chunks, currentText];
			return { chunks, currentText: text, currentTokens: newTokens.length }
		}
	}, { chunks: [], currentText: '', currentTokens: 0 })
	if (currentText !== '') {
		chunks = [...chunks, currentText]
	}
	return chunks
}

const filterForQuestion = async (text: string, input: string, apiKey: string): Promise<{ content: string, error: undefined } | { content: undefined, error: string }> => {

	const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "gpt-3.5-turbo",
			messages: [{
				role: ChatCompletionRequestMessageRoleEnum.User,
				content: `
以下の質問で
"""
${input}
"""

以下のテキストから質問に関連する内容を抽出してください
"""
${text}
"""

関連内容
"""`
				// name,
			},]
		})
	})
	const { choices, error } = await completionResponse.json();
	const content = choices?.[0]?.message?.content;
	return { content, error }
}


// const summarize = async (text: string, apiKey: string): Promise<{ content: string, error: undefined } | { content: undefined, error: string }> => {

// 	const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json",
// 			"Authorization": `Bearer ${apiKey}`
// 		},
// 		body: JSON.stringify({
// 			model: "gpt-3.5-turbo",
// 			messages: [{
// 				role: ChatCompletionRequestMessageRoleEnum.User,
// 				content: `以下のテキストを省略してください
// """
// ${text}`
// 			},]
// 		})
// 	})
// 	const { choices, error } = await completionResponse.json();
// 	const content = choices?.[0]?.message?.content;
// 	return { content, error }
// }


export const actions = {
	default: async ({ request, platform }) => {
		const data = await request.formData();
		const message = data.get('message') as string;
		const pastRoles = data.getAll('pastRoles') as ChatCompletionRequestMessageRoleEnum[];
		let pastContents = data.getAll('pastContents');
		let allMessages = pastRoles.map((role, index) => ({ role, content: pastContents[index] }))
		let api_key = platform?.env?.OPENAI_KEY || "";
		try {
			const meilisearchResponse = await fetch(
				"https://meilisearch.sassy.technology/indexes/gc_test/search",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						q: message,
					}),
				}
			);
			const meilisearchPayload = await meilisearchResponse.json();
			console.log(meilisearchPayload)
			const encoder = getEncoding("cl100k_base")
			const contents: string[] = mergeMaxTokens(meilisearchPayload.hits.map(({ room, message }: { room: string, message: string }) => `ルーム:${room};メッセージ：${message}`), encoder, 4000);
			console.log("merged contents", contents);
			let suggestions = await Promise.all(contents.map(content => filterForQuestion(content, message, api_key)))
			// let relevantTexts = await Promise.all(mergeMaxTokens(suggestions.filter(filterErrors).map(response => response.content || ''), encoder, 4000).map((content) => {
			// 	return summarize(content, api_key)
			// }));
			// console.log("relevant texts", relevantTexts);
			// let relevantText = relevantTexts.filter(filterErrors).map(response => response.content || '').join("\n");
			let relevantTexts = mergeMaxTokens(suggestions.filter(({ content, error }: { error: undefined, content: string } | { content: undefined, error: string }) => {
				if (error) {
					console.log(error)
					return false
				} else if (content && content.includes("関する情報は含まれていません")) {
					return false
				} else {
					return true
				}
			}
			).map(response => response.content || ''), encoder, 4000);
			console.log("content lengths", relevantTexts.map(text => encoder.encode(text).length))
			let relevantText = relevantTexts.join("\n");
			if (relevantText == '') throw new Error('empty relevant text');
			console.log("content", relevantText)
			console.log("content length", encoder.encode(relevantText).length)
			let messagesForCompletion = [
				...allMessages,
				{
					role: ChatCompletionRequestMessageRoleEnum.User,
					content: message,
				},
				{
					role: ChatCompletionRequestMessageRoleEnum.System,
					content: `グラッドキューブのチャット履歴の中にユーザーの質問に関連した内容は以下です
${relevantText}`,
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
					messages: messagesForCompletion,
				})
			})
			let completionResult = await completionResponse.json();
			let content = completionResult.choices?.[0]?.message?.content;
			if (completionResult.error) throw completionResult.error;
			return {
				messages: [
					...allMessages,
					{
						role: ChatCompletionRequestMessageRoleEnum.User,
						content: message,
					},
					{
						role: ChatCompletionRequestMessageRoleEnum.Assistant,
						content
					}
				]
			}

		} catch (e) {
			console.log(e)
			return { error: e, messages: allMessages }
		}
	}
} satisfies Actions;
