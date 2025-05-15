# Create a personal blog based on MkDocs

## Why?

The Astro Theme beinf used for the current blog is fragile, and when build command does not work with lastest version.

I need a reliable blogging system to create digital content.

## How?

1 - Create Python virtual env with uv
`uv init --bare -p 3.13.3 .`
2 - Add marimo package
`uv add mkdocs-marimo `
3 - Install dependencies
`uv sync`
4 - Check that is working
`uv run  mkdocs serve`
5 -

### Authors

md5 of of lowercase email address is used to get author avatar.

https://www.gravatar.com/avatar/27091eaf5027927e61e36987ab5f14e4?s=200


## RSS feed link

http://127.0.0.1:8000/feed_rss_created.xml
