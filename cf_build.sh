#!/bin/sh
# Use this script as build command in Cloudflare Pages
mkdocs build
## Overwrite the default robots.txt file to ensure this site is indexed.
cat << EOF > ./site/robots.txt
User-agent: *
Disallow:

Sitemap: https://www.rnwolf.net/sitemap.xml
Sitemap: https://rnwolf.net/sitemap.xml
EOF