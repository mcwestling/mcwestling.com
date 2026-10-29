# mcwestling.com

🏰 Landing page for McWestling, our family holding company

## What it does

Not much, on purpose. [mcwestling.com](https://mcwestling.com) is one page with a logo, an email address and a GitHub link. Occasionally something else shows up. It's plain HTML, CSS and JavaScript on GitHub Pages.

## Who it's for

Anyone who comes across the McWestling name and wants to know who we are or how to reach us.

## Product pages

Each published McWestling product has its own page at [mcwestling.com/products/](https://mcwestling.com/products/), drawn from the product's own README.

The pages are generated locally and committed; nothing builds in CI. To add a product or refresh the pages:

1. Make sure the product's `README.md` opens with `# Name`, a one-line pitch, `## What it does` and `## Who it's for`. Everything after "Who it's for" stays off the site.
2. Add the product to `products.json`: its `slug`, `repo` (`owner/name`) and `readme` path.
3. Optionally add `content/<slug>.md` for extras shown below the intro, with images in `assets/products/<slug>/` (link them as `/assets/products/<slug>/...`).
4. With `gh` logged in to an account that can read the repo, run `ruby scripts/gather-products.rb`.
5. Commit `products/`.

Tests for the README cut: `ruby scripts/test-gather-products.rb`.

## Links

- [Agent instructions](AGENTS.md)
- [Issue tracker config](docs/issue-tracker.md)
