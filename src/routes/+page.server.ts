import type { Actions } from './$types';
import {
	ChatCompletionRequestMessageRoleEnum,
} from "openai";
// import { Tiktoken, init } from "@dqbd/tiktoken/lite/init";
// import wasm from "@dqbd/tiktoken/lite/tiktoken_bg.wasm";
// import model from "@dqbd/tiktoken/encoders/cl100k_base.json";
import TinySegmenter from "tiny-segmenter";

const splitInMaxTokens = (list: string[], segmenter: TinySegmenter, max: number): string[] => {
	let { chunks, currentText} = list.reduce(({chunks, currentText, currentTokens}, text) => {
		// let newTokens = encoder.encode(text);
		let newTokens = segmenter.segment(text);
		if (currentTokens + newTokens.length < max) {
			currentTokens += newTokens.length;
			currentText += text;
			return {chunks, currentTokens, currentText}
		} else {
			chunks = [...chunks, currentText];
			return {chunks, currentText: text, currentTokens: newTokens.length}
		}
	}, {chunks: [], currentText: '', currentTokens: 0})
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
				content: `Extract the content relevant to "${input}" from text that follows, only return that text in japanese, do not return anything else, return an empty message if nothing is relevant.

${text}`,
				// name,
			},]
		})
	})
	const { choices, error } = await completionResponse.json();
	const content = choices?.[0]?.message?.content;
	return { content, error }
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
			// await init((imports) => WebAssembly.instantiate(wasm, imports));
	  //   const encoder = new Tiktoken(
	  //     model.bpe_ranks,
	  //     model.special_tokens,
	  //     model.pat_str
	  //   );
			const segmenter = new TinySegmenter();
			const contents: string[] = splitInMaxTokens(qdrantPayloads.map(({ payload }: { payload: { room: string, message: string } }) => `ルーム:${payload.room};メッセージ：${payload.message}`), segmenter, 2000);
			let suggestions = await Promise.all(contents.map(content => filterForQuestion(content, message, api_key)))
			let relevantText = suggestions.filter(({ content, error }) => {
				if (!content) {
					console.log("error", error)
					return false
				} else {
					return true
				}
			}).reduce((acc, {content}) => acc + content, '');


			if (relevantText == '') throw new Error('empty relevant text');
			console.log("content", relevantText)
			allMessages = [
				...allMessages,
				{
					role: ChatCompletionRequestMessageRoleEnum.System,
					content: `グラッドキューブのチャット履歴の中にユーザーの質問に関連した内容は以下です
${relevantText}`,
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
			let completionResult = await completionResponse.json();
			let content = completionResult.choices?.[0]?.message?.content;
			if (completionResult.error) throw completionResult.error;
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