export default {
  async fetch(request, env, ctx) {
    try {
      const response = await fetch(request)
      const contentType = response.headers.get("content-type") || ""

      console.log(`Incoming request: ${request.url}`)
      console.log(`Content-Type: ${contentType}`)

      if (contentType.includes("text/html")) {
        let html = await response.text()

        const nonce = crypto.randomUUID()
        console.log(`Generated nonce: ${nonce}`)

        // Inject nonce into <script> tags
        html = html.replace(
          /<script(\s[^>]*?)?>/gi,
          (match) => {
            if (match.includes("nonce=")) return match
            return match.replace("<script", `<script nonce="${nonce}"`)
          }
        )

        // Inject <meta> tag with nonce for debug visibility
        html = html.replace(
          /<head[^>]*>/i,
          (match) => `${match}\n  <meta name="csp-nonce" content="${nonce}">`
        )

        // Build full custom CSP with dynamic nonce
        const csp = [
          `default-src 'self';`,
          `script-src 'self' https://eu-assets.i.posthog.com https://challenges.cloudflare.com 'nonce-${nonce}';`,
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`,
          `font-src 'self' https://fonts.gstatic.com; data:;`,
          `img-src 'self' https://www.gravatar.com blob: data:;`,
          `connect-src 'self' https://eu.i.posthog.com https://challenges.cloudflare.com https://api.rnwolf.net;`,
          `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com;`,
          `child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;`,
          `object-src 'none';`,
          `base-uri 'self';`,
          `form-action 'self';`,
          `frame-ancestors 'self';`,
          `upgrade-insecure-requests;`
        ].join(' ')

        const headers = new Headers(response.headers)
        headers.set("content-security-policy", csp)
        headers.set("content-type", contentType)

        console.log("Injected CSP:")
        console.log(csp)

        return new Response(html, {
          status: response.status,
          headers,
        })
      }

      return response
    } catch (err) {
      console.error("Worker error:", err)
      return new Response("Internal Worker error", { status: 500 })
    }
  },
}
