# Omi Portfolio

**Live site:** [tamzid16.github.io/Omi-Portfolio](https://tamzid16.github.io/Omi-Portfolio/)

The personal portfolio of **MD Tamzid Hossen Omi** — IoT & Robotics Engineer, Software Developer, and AI Researcher based in Dhaka, Bangladesh.

## Sections

About (responsive portrait, core expertise) · Domain Expertise (rolling technology marquee) · Projects showcase + Other Notable Projects (Featured, Software & Web, IoT & Robotics, All) · Research (JuteRAG, WatchRover) · Awards & Achievements (filterable cards) · Extracurricular Activities · Profiles · Inference Lab (quiz) · Project Gallery (3D screen carousel) · Contact · Omi assistant chatbot

## Built with

Plain HTML, CSS and JavaScript. No framework, no build step. Fonts are self-hosted: Bricolage Grotesque (headings), Plus Jakarta Sans (body), JetBrains Mono (labels), Great Vibes (logo and accents).

## Project structure

```
index.html
styles.css
script.js
Tamzid_Hossen_Omi_CV.pdf
assets/
  fonts/                 self-hosted woff2 fonts
  images/
    about/               portrait.webp
    projects/            <slug>-cover.svg  (wide banner)
                         <slug>-avatar.svg (round profile image)
    research/            juterag-figure.svg, watchrover-figure.svg
    experience/          researcher / presenter / leader / finalist badges
    tech/                self-hosted technology logos for the marquee
    about/               portrait-360/540/703 webp (responsive srcset)
    quotes/              bg-1 ... bg-6 card backgrounds
    gallery/             six screens for the 3D carousel
```

### Replacing images

Keep the same file name and drop in your own picture (`.svg`, `.png`, `.jpg` or `.webp`). If the extension changes, update the path in `script.js` (projects, research, experience, skills, achievements, gallery) or `styles.css` (quotes).

- Project cover: about 1200x480 px. Project avatar: square, 400x400 px.
- Gallery screens: 16:10, about 1280x800 px.

## Running locally

```bash
git clone https://github.com/tamzid16/Omi-Portfolio.git
cd Omi-Portfolio
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Connect

- **Email:** [tamzid.omi@gmail.com](mailto:tamzid.omi@gmail.com)
- **LinkedIn:** [md-tamzid-hossen-omi](https://www.linkedin.com/in/md-tamzid-hossen-omi-93000a2b9)
- **GitHub:** [@tamzid16](https://github.com/tamzid16)

© 2026 MD Tamzid Hossen Omi. All rights reserved.
