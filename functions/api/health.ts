interface CloudflareEnv {
  GEMINI_API_KEY?: string;
}

interface PagesFunctionContext {
  env: CloudflareEnv;
}

export async function onRequestGet(
  context: PagesFunctionContext
): Promise<Response> {
  const apiKey = context.env.GEMINI_API_KEY?.trim();
  const hasKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'LibraMind Cloudflare Pages API',
      geminiConfigured: hasKey,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
}
