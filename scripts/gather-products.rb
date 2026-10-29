#!/usr/bin/env ruby
# Regenerates products/ from each product's README. Run from anywhere:
#   ruby scripts/gather-products.rb
# Needs a logged-in `gh` that can read the product repos.

require "json"
require "open3"
require "fileutils"

ROOT = File.expand_path("..", __dir__)
WHO_ITS_FOR = /^##\s+Who it['’]s for\s*$/i

# Keeps the README from the top through its "Who it's for" section.
def cut_intro(readme, slug)
  lines = readme.lines
  start = lines.index { |line| line =~ WHO_ITS_FOR }
  abort "#{slug}: README has no \"## Who it's for\" heading" unless start
  stop = (start + 1...lines.length).find { |i| lines[i] =~ /^(\#{1,2}\s|---\s*$)/ }
  lines[0...(stop || lines.length)].join.rstrip + "\n"
end

def gh(*args)
  out, err, status = Open3.capture3("gh", *args)
  abort "gh #{args.first(2).join(" ")} failed:\n#{err}" unless status.success?
  out
end

def render(markdown)
  gh("api", "markdown", "-f", "text=#{markdown}", "-f", "mode=gfm")
end

def strip_tags(html)
  html.gsub(/<[^>]+>/, "")
end

def page(title:, description:, current:, body:)
  <<~HTML
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="#{description}">
        <meta name="theme-color" content="#f7f2e8" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#171716" media="(prefers-color-scheme: dark)">
        <title>#{title} · McWestling</title>
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
              <a href="/products/"#{current ? ' aria-current="page"' : ""}>Products</a>
              <a href="mailto:inquiries@mcwestling.com">Contact</a>
            </nav>
          </header>
          <article class="page-content">
    #{body.rstrip}
          </article>
        </main>
        <footer class="site-footer">
          <div><a href="/">McWestling LLC, New York</a></div>
          <div><a href="/privacy/">Privacy</a></div>
        </footer>
      </body>
    </html>
  HTML
end

def write(path, html)
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, html)
  puts "wrote #{path.sub(ROOT + "/", "")}"
end

def main
  _, status = Open3.capture2e("gh", "auth", "status")
  abort "gh isn't logged in; run `gh auth login` first" unless status.success?

  products = JSON.parse(File.read(File.join(ROOT, "products.json"))).map do |product|
    slug = product.fetch("slug")
    readme = gh("api", "repos/#{product.fetch("repo")}/contents/#{product.fetch("readme")}",
                "-H", "Accept: application/vnd.github.raw")
    html = render(cut_intro(readme, slug))
    # Relative links would point into the (often private) product repo.
    bad = html.scan(/href="([^"]*)"/).flatten.reject { |href| href =~ %r{\A(https?://|mailto:)} }
    abort "#{slug}: intro has relative links: #{bad.join(", ")}" if bad.any?

    extras = File.join(ROOT, "content", "#{slug}.md")
    html += render(File.read(extras)) if File.exist?(extras)

    name = strip_tags(html[%r{<h1[^>]*>(.*?)</h1>}m, 1] || abort("#{slug}: README has no # heading"))
    pitch = html[%r{<p>(.*?)</p>}m, 1] || abort("#{slug}: README has no pitch paragraph")
    description = strip_tags(pitch).gsub(/\s+/, " ").gsub('"', "&quot;")

    write(File.join(ROOT, "products", slug, "index.html"),
          page(title: name, description: description, current: false, body: html))
    { slug: slug, name: name, pitch: pitch }
  end

  list = products.map do |p|
    %(<h2><a href="/products/#{p[:slug]}/">#{p[:name]}</a></h2>\n<p>#{p[:pitch]}</p>\n)
  end.join
  write(File.join(ROOT, "products", "index.html"),
        page(title: "Products", description: "Products made by McWestling.", current: true,
             body: "<h1>Products</h1>\n#{list}"))
end

main if __FILE__ == $PROGRAM_NAME
