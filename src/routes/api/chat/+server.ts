import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

import { OPENAI_API_KEY } from '$env/static/private';

const openai = createOpenAI({
	apiKey: OPENAI_API_KEY
});

export async function POST({ request }) {
	const { messages } = await request.json();

	const result = streamText({
		model: openai('gpt-4o'),
		messages
	});

	return result.toDataStreamResponse();
}
