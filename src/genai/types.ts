export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  system?: string;
  messages: AnthropicMessage[];
  stream?: boolean;
}

export interface AnthropicStreamDelta {
  type: string;
  text?: string;
}

export interface AnthropicStreamEvent {
  type: string;
  delta?: AnthropicStreamDelta;
}
