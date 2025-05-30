# Create a personal blog based on MkDocs

## Why?

The Astro Theme being used for the current blog is fragile, and when build command does not work with latest version.

I need a reliable blogging system to create digital content.

## How?

  1 - Create Python virtual env with uv
      `uv init --bare -p 3.13.3 .`

  2 - Install dependencies
      `uv sync`

  3 - Install Image dependencies
      https://squidfunk.github.io/mkdocs-material/plugins/requirements/image-processing/

  4 - Start interactive document website
      `uv run  mkdocs serve`

Visit the local server (usually http://127.0.0.1:8000) to check content is as expected.

### Mkdocs command

* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.


## Build site pages

`uv run mkdocs build`

## Build requirements.txt for cloudflare build

If the python plugins have been updated:

`uv pip compile pyproject.toml -o requirements.txt`

Because Cloudflate build service looks for requirements.txt file during build phase.

## Check built assets.

`uv run python -m http.server 8000 --directory ./site`

### Authors

Gavitar profiles are used for the author avatar and byline.

Use the md5 hash of the lowercase email address to configure the author avatar.

https://www.gravatar.com/avatar/27091eaf5027927e61e36987ab5f14e4?s=200


## RSS feed link url

http://127.0.0.1:8000/feed_rss_created.xml
http://127.0.0.1:8000/feed_rss_updated.xml

## PostHog Website analytics

To add a script to the footer in an MkDocs project, you can use the extra_javascript configuration option in the mkdocs.yml file. Here's how you can do it:

### 1. Add Your Script File

Create a JavaScript file (e.g., footer-script.js) and place it in the docs or a subdirectory like docs/javascripts/. For example:


docs/
├── index.md
├── about.md
└── javascripts/
    └── posthog-script.js

### 2. Edit mkdocs.yml

In your mkdocs.yml configuration file, add the path to your JavaScript file under the extra_javascript option:


```
site_name: My Awesome Site
theme:
  name: material  # Or any other theme you're using

extra_javascript:
  - javascripts/posthog-script.js
```

This will ensure the script is included in the footer of every page.

### 3. Write Your Script

In the posthog-script.js file, you can add any JavaScript code you want to execute in the footer. For example:

```
<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('phc_cBkEyJgbulsE7bxyERFGNYjVaCcedGtRFV966dIMQWD', {api_host: 'https://eu.i.posthog.com'})
</script>
```

### Serve Your Site

Note there is an adjustment required to the robots.txt file that is deployed to production.
The default robots.txt prevents pre-prod sites from being indexed.

- Put info here on how to deploy site pages
  + github pages
    - Enable github pages in repo settings
    - Make sure you have a .nojekyll file in the root.
    - See https://rnwolf.github.io/mkdocs-blog-offline-main/ when the github action runs successfully.
  + Cloudflare
    - Make sure we have updated requirements.txt
        - `uv pip compile pyproject.toml -o requirements.txt`
        - https://www.youtube.com/watch?v=7-HhLascLuM How to Host MKDocs on Cloudflare Pages

## Home page - Featured Articles

Copy the post article HTML elements from the blog index and put them in the  index.md file.

Make sure to add the class `home-page` to ensure that the post meta information is display horizontally and not vertically.

`<article class="home-page md-post md-post--excerpt">`

Replace blog post ahref links `../..`  with `/blog`


## Blog Post Screen real estate

Add the following to posts frontmatter (Between the --- section at the top of the markdown page) to hide some of the navigation for a page if required.

```
hide:
  - navigation
  - toc
```


## Security improvements

### Content Security Policy (CSP)

A security feature called Content Security Policy (CSP) aids in the prevention of several kinds of attacks, including data injection and cross-site scripting (XSS) assaults. It does this by outlining which material sources are reliable and permitted to be loaded and used on a webpage. Even with its benefits, CSP might be dangerous if not used correctly.

1. Go to https://domsignal.com/csp-test
2. Enter website name: https://www.rnwolf.net
3. Click on Test, Now you can see the CSP (Content-Security-Policy)

When hosting a site on Cloudflare you can control the CSP policy via the `_headers` file.

By adding `-Report-Only` you can iterate to a secure policy because you can publish site and check messages in the browser developer console.

```
Content-Security-Policy-Report-Only:
default-src 'self';
script-src 'self' https://eu-assets.i.posthog.com 'sha256-jO1y8K5qAbZ1U1+Kc8LYS6dK1sxvNDB3u2qkgZ5iCIk=';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' https://www.gravatar.com data:;
connect-src 'self' https://eu.i.posthog.com;
frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;
child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

BUT because the posthog.js file modifies the browser DOM and add additional scripts we need to use a nonce for certidy these scripts as safe to use on our website.  We can do this with Cloudflare worker that will rewrite headers when served.

To deploy whe cloudflare worker:

export $(cat .env | xargs)  # or source .env
cd workers-csp
wrangler deploy --account-id $CF_ACCOUNT_ID
