export default {
  async fetch(request, env, ctx) {
    const nonce = crypto.randomUUID().replace(/-/g, '') // generate a nonce

    const response = await fetch(request)
    let contentType = response.headers.get('content-type') || ''

    if (contentType.includes('text/html')) {
      let html = await response.text()

      // Add nonce to all inline <script> tags
      html = html.replace(/<script(?![^>]*src)([^>]*)>/g, `<script nonce="${nonce}"$1>`)

      // Inject CSP header with the nonce
      const csp = [
        `default-src 'self';`,
        `script-src 'self' https://eu-assets.i.posthog.com 'nonce-${nonce}';`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`,
        `font-src 'self' https://fonts.gstatic.com;`,
        `img-src 'self' https://www.gravatar.com data:;`,
        `connect-src 'self' https://eu.i.posthog.com;`,
        `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;`,
        `child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;`,
        `object-src 'none';`,
        `base-uri 'self';`,
        `form-action 'self';`,
        `frame-ancestors 'none';`,
        `upgrade-insecure-requests;`
      ].join(' ')

      return new Response(html, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Content-Security-Policy': csp,
        },
      })
    }

    // For non-HTML content, return unchanged
    return response
  }
}
