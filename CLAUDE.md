# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pudú is a tiny static site generator based on Handlebars.js, designed for developers who prefer simple HTML/CSS workflows without complex build systems. It generates static sites by combining templates, content, and localization data.

## Core Commands

- `pudu` - Generate the site from current directory (requires config.yaml and directory structure)
- `pudu install` - Initialize new project with default directories and config.yaml
- `pudu min` - Minify CSS files in output directory (keeps originals as .ORIG.css)
- `pudu max` - Restore original CSS files (removes .min.css versions)

## Development Setup

1. Install dependencies: `npm install`
2. For linting: `npm run lint` (uses eslint with airbnb-base config, configured for legacy JS patterns)
3. Initialize project structure: `pudu install`
4. Generate site: `pudu`

## Dependencies Updated (2024)

- **Critical security fixes**: Updated handlebars, minimist, and other dependencies with vulnerabilities
- **js-yaml v4**: Changed `Yaml.safeLoad()` to `Yaml.load()` (breaking change fixed in lib/config.js and lib/utils.js)
- **ESLint v8**: Updated with relaxed rules for legacy JavaScript patterns
- All dependencies updated to latest compatible versions

## Architecture

### Core Generation Flow (`lib/index.js`)
The main generation process follows this sequence:
1. Validate config.yaml and required directories exist
2. Load partials (`lib/partials.js`)
3. Load globals with localization (`lib/globals.js`) 
4. Load page configurations (`lib/pages.js`)
5. Load and compile templates (`lib/templates.js`)
6. Generate final HTML (`lib/generator.js`)

### Key Components

**Configuration (`lib/config.js`)**
- Loads and validates config.yaml from current working directory
- Contains settings for localization, markdown, output paths, and Handlebars options

**Directory Structure**
- `globals/` - Shared localized content accessible via `{{gl.path.to.key}}`
- `pages/` - Page-specific content and configuration (YAML + Markdown)
- `partials/` - Reusable HTML/CSS/JS components via `{{>pa.component}}`
- `templates/` - Handlebars template files
- Output directory (default: `./html/`)

**Localization System (`lib/globals.js`, `lib/pages.js`)**
- Main locale defined in config (default: 'en')
- Additional locales specified in config.additionalLocales
- Localized files use `~locale` suffix (e.g., `about~es.yaml`)
- Falls back to main locale if localized version not found
- Page URLs generated based on directory structure and locale

**Template Processing (`lib/generator.js`)**
- Uses Handlebars.js for templating with custom helpers
- Two-pass compilation to resolve nested expressions
- Built-in helpers: `_locale`, `_br` (newlines to `<br>`)
- Strict mode enabled to catch missing template variables

**Content Processing**
- YAML configuration files for structured data
- Markdown support via Showdown.js with GitHub flavor
- Hash-based file comparison to skip unchanged outputs

## File Organization Patterns

- Page configs must match directory names (configurable via `pageConfigsName`)
- Root page config must be named `index.yaml`
- Markdown files can be referenced in YAML via `_markdown` array
- Partials and globals follow hierarchical naming: `path.to.file.key`

## Localization Workflow

- Directory structure mirrors all locales
- Internal links use `{{_.link.path._}}` syntax for locale-aware URLs
- Locale-specific assets organized in separate directories
- Current page locale available via `{{_locale}}` helper

## Testing the Demo

The `demo/` directory contains a complete example project showing:
- Multi-language setup (English, Spanish, Russian)
- Blog-style content organization
- Shared components (navbar, footer, analytics)
- Localized assets and content