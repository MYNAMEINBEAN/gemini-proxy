import BareClient from "@mercuryworkshop/bare-mux";

self.GeminiProxy = class GeminiProxy {
    constructor(key) {
        this.client = new BareClient();
        this.key = key;
    }

    route({ request }) {
        return request.url.startsWith(location.origin + '/gemini/');
    }

    rwHeaders(headers) {
        const cspHeaders = [
            "cross-origin-embedder-policy",
            "cross-origin-opener-policy",
            "cross-origin-resource-policy",
            "content-security-policy",
            "content-security-policy-report-only",
            "expect-ct",
            "feature-policy",
            "origin-isolation",
            "strict-transport-security",
            "upgrade-insecure-requests",
            "x-content-type-options",
            "x-download-options",
            "x-frame-options",
            "x-permitted-cross-domain-policies",
            "x-powered-by",
            "x-xss-protection",
            "clear-site-data",
        ];

        headers = new Headers(headers);

        for (const header of cspHeaders) {
            if (headers.has(header)) headers.delete(header);
        }

        return headers;
    }

    async rwGemini({ type, content, origin }) {
        const prompt = `
Type: ${type}
Content: ${content}
Site origin: ${origin}
Proxy origin: ${location.origin}

Instructions:
- If type is CSS:
    - Find all URLs inside the content.
    - Rewrite each URL by combining Site origin + relative path, then proxy it like: ProxyOrigin/gemini/RewrittenFullUrl
- If type is HTML:
    - Find all URL-containing attributes (like src, href, etc.)
    - Rewrite them using the same method.

Important:
- Only output the final rewritten HTML or CSS.
- No explanations, no extra wrapping text.

Examples:
Input: <a src="https://example.com">a</a>
Output: <a src="http://localhost:7000/gemini/https://example.com">a</a>
`.trim();

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }

    async fetch({ request }) {
        const requestHeaders = this.rwHeaders(request.headers);
        const url = new URL(request.url.split('/gemini/')[1]);

        try {
            const response = await this.client.fetch(url.href, {
                method: request.method,
                body: request.body,
                headers: requestHeaders
            });

            const responseHeaders = this.rwHeaders(response.rawHeaders);
            let responseBody;

            const contentType = responseHeaders.get("content-type") || "";

            if (contentType.startsWith("text/html")) {
                const content = await response.text();

                responseBody = await this.rwGemini({
                    type: "html",
                    content: content,
                    origin: url.origin
                });
            } else if (contentType.startsWith("text/css")) {
                const content = await response.text();

                responseBody = await this.rwGemini({
                    type: "css",
                    content: content,
                    origin: url.origin
                });
            } else {
                const buffer = await response.arrayBuffer();
                responseBody = buffer;
            }

            return new Response(responseBody, {
                headers: responseHeaders,
                status: response.status,
                statusText: response.statusText
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
};
