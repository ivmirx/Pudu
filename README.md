# Pudú Readme

I'm not a web developer, so when I make a site, I write it directly in `.html` and `.css` files – like it's the year 2005. I have no idea how to configure CSS preprocessors and I use FTP sync in [Transmit](https://panic.com/transmit/) for deployment. When I needed some basic templating, I found most static site generators to be too complex and many also weren't suitable for localization (which I still don't have, ha). So I wrote Pudú, which is tiny ([like a pudú](https://www.google.com/search?tbm=isch&as_q=pudu)) and doesn’t stand in your way ([also like a pudú](https://en.wikipedia.org/wiki/Pud%C3%BA#Behavior)). To use it, you only need to learn a few rules for [Handlebars.js templating](https://handlebarsjs.com/guide/#what-is-handlebars). Pudú's core features are:

- Easy to add to an existing site or use only for some pages
- Markdown support for content
- Internationalization and URL localization support (in theory)

Use cases: personal site, landing page for an app or a book, rarely updated blog. It runs [QotoQot.com](https://qotoqot.com)

## Installation
[Install](https://nodejs.org/en/download/package-manager/) Node.js and NPM on your computer if you don't have them. Then in your system's terminal run `npm install -g pudu` to make Pudú available system-wide. Switch to the directory where you plan to work and run: `pudu install` to create default directories and a config. Pudú should work well with its default configuration but there are a few settings in `config.yaml` that you may want to adjust (like the site's root directory).

## The Idea
In contrast to site generators that build everything from scratch, Pudú just adds HTML files to the existing site directory. This way you can start working on your site without generation at all and later extract repeating parts into templates.

Pudú organizes files into 4 directories:
- **pages:** localizable content stored in YAML configs and Markdown files, its subdirectory hierarchy is used to create your site's structure
- **globals:** localizable values that are shared between multiple pages (for example, menu link names for the header)
- **partials:** mini-templates with pieces of HTML, CSS or JavaScript (for example, the header's HTML code), this is a [concept from Handlebars.js](https://handlebarsjs.com/guide/#partials)
- **templates:** skeleton HTML files to fill with content from the three other directories

Check out the `demo` directory to see the configuration and the resulting site.

## Quick start
For example, you have a project in your portfolio, located at example.com/projects/puduscript/:
```
<head>
  <title>Introduction to PudúScript</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>...</nav> <!-- your site navigation menu -->
  <div class="description">Some long text goes here…</div>
</body>
```

The title and the description are unique to this page but the CSS stylesheet and the navigation menu are used across all your site. Let's make a project page template by replacing everything with Handlebars.js paths and saving it to `/templates/project.html`.

```
<head>
  <title>{{title}}</title>
  {{>pa.style}}
</head>
<body>
  {{>pa.navbar}}
  <div class="description">{{text}}</div>
</body>
```

Now you have two [partials](https://handlebarsjs.com/guide/#partials) for pieces of HTML and two [simple expressions](https://handlebarsjs.com/guide/#simple-expressions) for regular text.

Since the page should be located at `/projects/puduscript/` on your site, you need to create a config file at `/pages/projects/puduscript/puduscript.yaml` and copy the values for `title` and `text` there:
```
_template: project.html
title: Introduction to PudúScript
text: Some long text about the subject
```

Then add two small HTML files into the `/partials/` directory:
- `/partials/style.html` that includes just `<link rel="stylesheet" href="/css/style.css">`
- and `/partials/navbar.html` that includes the code inside `<nav>...</nav>`

**That's it!** Now running `pudu` from the directory with `config.yaml` will take `project.html`, add to it partials from `style.html` and `navbar.html`, fill it with values from `puduscript.yaml`, and finally place the resulting HTML file to your output directory at `/projects/puduscript/`.

Sometimes you need to reuse the same text between pages, for example the menu item names in the navigation bar. That's when `/globals/` are useful: you can create something like `menu.yaml` in that directory, fill it with values and use expressions with the `gl` prefix like `{{gl.menu.home}}`.

## Handling your Pudú
One common rule: file names and YAML keys must not include any special characters that are [prohibited](https://handlebarsjs.com/guide/expressions.html#literal-segments) in Handlebars.js expressions.

### Pages
There are three simple rules for `/pages/` content:
- the site root page config must be called `index.yaml`
- by default, the name of other page configs must match its parent directory name (you can change this in Pudú's config file if you want)
- `_template` is a required key and it's a path to a file inside the `/templates/` directory

### Globals
For content in `/globals/`, keys always start with the `gl.` prefix and reflect the path to the file plus the filename without extension **plus** the key path inside YAML if it's a YAML file

Example: if you have a YAML file stored at `/globals/path/to/myTexts.yaml`:
```
someText: Some Text
moreTexts:
  anotherText: Another Text
```
Then the expressions for these text values will be:
- `{{gl.path.to.myTexts.someText}}`
- `{{gl.path.to.myTexts.moreTexts.anotherText}}`

### Partials
For content in `/partials/`, keys always start with the `>pa.` prefix and reflect the path to the file plus the filename without extension. Usually partials are `.html`, `.css` and `.js` files but you can also use `.yaml` with keys as shown in the example for globals.

Now you are ready to generate your site from reusable templates. Check [the demo] to see more complex setup for multiple languages.


## Advanced tricks
You can [use multiline strings](https://stackoverflow.com/a/21699210) in YAML configs with `|-` and then keep them multiline in HTML too by using `_br` helper to replace newline characters with `<br>` tag, for example `{{_br some.expression}}`. If for some reason you want to escape other HTML characters in a string, use the `_bre` helper instead.

Note that HTML parts have **three** curly braces (Handlebars.js calls it "triple-stash") on each side to prevent escaping of HTML symbols like "<", ">", etc. There's also `>` symbol to include shared templates as [partials](http://handlebarsjs.com/partials.html), so you can put templates inside templates inside templates inside templates…

### Storing texts in Markdown files

- content can be split into separate markdown files and their names will be used as keys: for example `text` can be stored as Markdown in `text.md` (.md files auto-convertion to HTML)

- you can have HTML and Handlebars expressions inside Markdown too

```
_markdown:
  - text
  - something_else
```

Don't forget to commit before this:
`find . -type f -name "*.html" -exec sed -i '' 's/elements.common.opengraph/pa.common.opengraph/g' {} +`

If you decide to change site structure one day, simple [find-and-replace] in Bash will work great because the links are unique.

`find . -type f \( -name '*.html' -or -name '*.yaml' \) -exec sed -i '' 's/something.old/something.new/g' {} +`
(check if work on all platforms)

### Markdown

If you use `_.underscores._` for link IDS (you can change it in the config), use them in markdown without spaces, like `{{_.underscores._}}` because it's for cursive there.

Use `<a href="_.somelink._">` in markdown for internal links because others will be opened in a new tab. You can switch it vice versa in the config.

### Replacing
`find . -type f -name "*.html" -exec sed -i '' 's/pa.common.google-analytics/pa.common.analytics/g' {} +`

## Localization

**This part is eternally under construction**

```
Put <link rel="alternate" hreflang="en" href="http://en.example.com/" *> in `/blocks`
!! nginx example: redirect 301 /en/index.html http://www.domain.com

to get locale, use `{{_locale}}`:
like `<html lang="{{_locale}}">`
```

Making your site multilingual with Pudú is somewhat opinionated because of the complexity of the task. See the demo that is available in three languages.

There are four more rules for content:
- your site must keep all language versions in separate directories like `example.com/es/` (except for the default language, it can be hosted directly at `example.com`)
- you can't hardcode internal links in HTML and should replace them with handlebars expressions
- localized files are expected in `/pages/` and `/globals/` directories, with added `~<lang_code>` suffix (for example: `about~es.html`)
- Pudú will fallback to default language file if it can't find a localized one

This approach guarantees tidy organization and quite flexible because you can use completely different templates for each language by adjusting YAML configs in `/pages/`.

Watch out for localizable and non-localizable content like images. See the example project for the suggested organization approach.
REMOVE, use in the example project.
```
/about/
| - /es/
| --- /content/ #content in Spanish
| --- about.html # Spanish page
| - /content/ # content in the default language
| - /partials/ # content used by all languages
| - about.html # the page in the default language
```

If you fallback on English content in some places, for SEO purposes you should add `<rel ...>` to the duplicated pages:
```
example
```

Switching between languages can be done like this:
```
some js
```


## Deployment

Pudú minifies and restores CSS files for easy deployment. This way you can work with your regular CSS files without running Pudú after each small change in styles:
- `pudu min` checks all CSS files in your output directory and minifies them if they don't have `.min.css` version, while keeping the originals as `.ORIG.css`
- `pudu max` removes minified files and renames `.ORIG.css` back to just `.css`

Pudú doesn't have any other deployment mechanisms and I suggest to use some FTP client that support sync by date between local and remote directories (like [Transmit 5](https://library.panic.com/transmit5/synchronize/) does for me). During generation, Pudú compare resulting files with old ones by hash and doesn't overwrite if they were not changed — so sync should be fast enough for most cases.

Use [Broken Link Checker](https://github.com/stevenvachon/broken-link-checker) to verify if there are no typos in both links themselves and `href`'s to site's images and other content.

## Q&A
### Blogging support?
My own blogs are built with plain HTML and generated with Pudú. I rely on globals for post names, header images, and Open Graph metadata. There's no automatic pagination because I don't post that often.

### Why YAML?
Support for multi-line strings without escaping, comments, no need to escape quotes, general readability. I know it's not that good but no other markup language provides these features and Pudú uses the very basic parts of the standard.

### Why Node.js?
Because Handlebars.js was the first simple templating I found.
