interface CloudflareEnv {
  GEMINI_API_KEY?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: CloudflareEnv;
}

export async function onRequestGet(
  context: PagesFunctionContext
): Promise<Response> {
  const apiKey = context.env.GEMINI_API_KEY?.trim();
  const hasKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  const url = new URL(context.request.url);
  const checkModels = url.searchParams.get('models') === '1';

  let availableModels: string[] | undefined;
  if (checkModels && hasKey && apiKey) {
    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models?pageSize=50',
        { headers: { 'x-goog-api-key': apiKey } }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          models?: { name?: string; supportedGenerationMethods?: string[] }[];
        };
        availableModels = (data.models || [])
          .filter((m) =>
            m.supportedGenerationMethods?.includes('generateContent')
          )
          .map((m) => (m.name || '').replace(/^models\//, ''));
      }
    } catch {
      availableModels = [];
    }
  }

  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'LibraMind Cloudflare Pages API',
      geminiConfigured: hasKey,
      ...(availableModels !== undefined ? { availableModels } : {}),
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
