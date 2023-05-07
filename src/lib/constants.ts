import type { ChatCompletionRequestMessage } from "openai";
import { ChatCompletionRequestMessageRoleEnum } from "openai";

export const INITIAL_MESSAGES: ChatCompletionRequestMessage[] = [
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
