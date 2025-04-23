import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const openai = createOpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

export async function POST({ request }) {
	const { messages } = await request.json();

	const result = streamText({
		model: openai('gpt-4o'),
		messages
	});

	return result.toDataStreamResponse();
}
