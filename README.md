# Vira

**Vision · Innovation · Reliability · Automation**

A technology studio site for websites, apps, games, networks, internet setup, tech support and AI, and for business, video, freelance and financial work, with security and quality checks on every release. Based in Kraków, Poland.

[![Live demo](https://img.shields.io/badge/Live_demo-GitHub_Pages-6F4E37?style=for-the-badge&logo=github)](https://arnold-rg.github.io/vira/)

**Live:** [https://arnold-rg.github.io/vira/](https://arnold-rg.github.io/vira/)

[![Vira website](docs/screenshot.jpg)](https://arnold-rg.github.io/vira/)

## What it is

Vira is a static public website. It explains the studio’s values and its services: websites and web systems, mobile and desktop apps, games, networking and connectivity, tech support, AI creation, video content, business and finance support, and freelance support. The name comes from the Sanskrit *vīra* (hero, brave, strong) and the Latin roots of *virtus* (courage, excellence, integrity). It also stands for **Vision, Innovation, Reliability, Automation**.

## Features

- Responsive marketing site that works on phones and desktop browsers
- Wordmark identity in Mocha, Platinum, and Lavender, with a dark and a light theme
- About, services, products, studio gallery, indicative pricing, and a project-inquiry form
- Static hosting on GitHub Pages (no account required to visit)

## Tech stack

| Layer | Tools |
| --- | --- |
| Markup & style | HTML5, CSS3, vanilla JavaScript (ES modules) |
| Hosting | GitHub Pages, from the `main` branch root |
| Photography | Pexels (see [PHOTO-SOURCES.md](PHOTO-SOURCES.md) for page URL, photographer, image ID and licence) |
| Hero video | Four licensed options from Pexels and Mixkit, credited in [SOURCES.txt](SOURCES.txt) and in the site footer |
| Type | Self-hosted Inter and Fraunces, SIL Open Font License |

## Getting started

```bash
git clone https://github.com/Arnold-RG/vira.git
cd vira
python3 -m http.server 8000
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

## Project structure

```text
index.html       Site markup
css/             Design tokens, base, components and sections
js/              Theme, motion, pricing, form and gallery modules
assets/          Photographs, logos, self-hosted fonts and hero video
SOURCES.txt      Video and font credits; points to PHOTO-SOURCES.md
PHOTO-SOURCES.md Page URL, photographer, image ID and licence for each studio photo
docs/            README screenshot
```

## Tests

This is a static site with no automated test suite.

## Author

Arnold Rurangwa
