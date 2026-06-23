export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);

    if (!response.headers.get("content-type")?.includes("text/html")) {
      return response;
    }

    const nonce = crypto.randomUUID().replaceAll("-", "");
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://cdn.fasu.dev",
      "img-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    const rewritten = new HTMLRewriter()
      .on("script", {
        element(el) {
          el.setAttribute("nonce", nonce);
        },
      })
      .transform(response);

    const headers = new Headers(rewritten.headers);
    headers.set("Content-Security-Policy", csp);

    return new Response(rewritten.body, {
      status: rewritten.status,
      statusText: rewritten.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
