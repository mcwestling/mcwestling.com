#!/usr/bin/env python3
"""Regenerate products/ from each product's README.

Run from anywhere: python3 scripts/gather-products.py
Needs a logged-in `gh` that can read the product repos.
"""

import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
WHO_ITS_FOR = re.compile(r"^##\s+Who it['’]s for\s*$", re.IGNORECASE)
SECTION_END = re.compile(r"^(#{1,2}\s|---\s*$)")


def cut_intro(readme, slug):
    """Keep the README from the top through its "Who it's for" section."""
    lines = readme.splitlines(keepends=True)
    start = next((i for i, line in enumerate(lines) if WHO_ITS_FOR.match(line)), None)
    if start is None:
        sys.exit(f"{slug}: README has no \"## Who it's for\" heading")
    stop = next((i for i in range(start + 1, len(lines)) if SECTION_END.match(lines[i])), len(lines))
    return "".join(lines[:stop]).rstrip() + "\n"


def gh(*args):
    result = subprocess.run(["gh", *args], capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(f"gh {' '.join(args[:2])} failed:\n{result.stderr}")
    return result.stdout


def render(markdown):
    return gh("api", "markdown", "-f", f"text={markdown}", "-f", "mode=gfm")


def strip_tags(html):
    return re.sub(r"<[^>]+>", "", html)


def page(title, description, current, body):
    products_current = ' aria-current="page"' if current else ""
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="{description}">
    <meta name="theme-color" content="#f7f2e8" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#171716" media="(prefers-color-scheme: dark)">
    <title>{title} · McWestling</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
    <script src="/app.js" defer></script>
  </head>
  <body>
    <main class="page-main">
      <header class="page-header">
        <a class="page-wordmark" href="/">McWestling</a>
        <nav aria-label="McWestling links">
          <a href="/about/">About</a>
          <a href="/products/"{products_current}>Products</a>
          <a href="mailto:inquiries@mcwestling.com">Contact</a>
        </nav>
      </header>
      <article class="page-content">
{body.rstrip()}
      </article>
    </main>
    <footer class="site-footer">
      <div><a href="/">McWestling LLC, New York</a></div>
      <div><a href="/privacy/">Privacy</a></div>
    </footer>
  </body>
</html>
"""


def write(path, html):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def main():
    if subprocess.run(["gh", "auth", "status"], capture_output=True).returncode != 0:
        sys.exit("gh isn't logged in; run `gh auth login` first")

    products = []
    for product in json.loads((ROOT / "products.json").read_text(encoding="utf-8")):
        slug = product["slug"]
        readme = gh("api", f"repos/{product['repo']}/contents/{product['readme']}",
                    "-H", "Accept: application/vnd.github.raw")
        html = render(cut_intro(readme, slug))
        # Relative links would point into the (often private) product repo.
        bad = [href for href in re.findall(r'href="([^"]*)"', html)
               if not re.match(r"(https?://|mailto:)", href)]
        if bad:
            sys.exit(f"{slug}: intro has relative links: {', '.join(bad)}")

        extras = ROOT / "content" / f"{slug}.md"
        if extras.exists():
            html += render(extras.read_text(encoding="utf-8"))

        name = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.DOTALL)
        pitch = re.search(r"<p>(.*?)</p>", html, re.DOTALL)
        if not name or not pitch:
            sys.exit(f"{slug}: README needs a # heading and a pitch paragraph")
        name, pitch = strip_tags(name.group(1)), pitch.group(1)
        description = re.sub(r"\s+", " ", strip_tags(pitch)).replace('"', "&quot;")

        write(ROOT / "products" / slug / "index.html", page(name, description, False, html))
        products.append((slug, name, pitch))

    listing = "".join(
        f'<h2><a href="/products/{slug}/">{name}</a></h2>\n<p>{pitch}</p>\n'
        for slug, name, pitch in products
    )
    write(ROOT / "products" / "index.html",
          page("Products", "Products made by McWestling.", True, f"<h1>Products</h1>\n{listing}"))


if __name__ == "__main__":
    main()
