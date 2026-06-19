# mcwestling.com

A minimal static landing page for McWestling, a family product company.

## Local Preview

This site has no build step. Serve the repository root with any static file
server:

```sh
ruby -run -e httpd . -p 4173
```

Then open `http://localhost:4173`.

## Deployment

The site deploys to GitHub Pages from `.github/workflows/deploy-pages.yml` on
pushes to `main`. The custom domain is configured with `CNAME`.

GitHub Pages should be configured to use GitHub Actions as its source, and DNS
for `mcwestling.com` should point to GitHub Pages.
