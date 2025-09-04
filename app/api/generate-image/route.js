import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt
    });

    return Response.json({ 
      image: result.data[0].b64_json 
    });
  } catch (error) {
    return Response.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}