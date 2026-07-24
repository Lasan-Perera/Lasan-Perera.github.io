# Lasan Perera — Portfolio Website

A personal portfolio site built with plain HTML, CSS and JavaScript, styled after the
[CommunityPro portfolio-html](https://github.com/CommunityPro/portfolio-html) template (MIT licensed).

No build tools, no frameworks, no installation. Just open `index.html` in a browser.

---

## Files

```
portfolio/
├── index.html          <- all the text and content of the site
├── css/
│   ├── style.css       <- layout: navbar, hero, timeline, awards, footer
│   └── utilities.css   <- buttons, colours, project cards
├── js/
│   └── script.js       <- mobile menu, dark mode, footer year
├── assets/
│   ├── logo.svg              <- the "LP" logo in the navbar
│   ├── profile-image.svg     <- placeholder avatar (replace with your photo)
│   ├── moon.svg / sun.svg    <- dark mode toggle icons
│   ├── Lasan-Perera-CV.pdf   <- what the RESUME button downloads
│   └── project/              <- put project photos here
└── README.md
```

---

## First three things to change

Open `index.html` in any text editor. [VS Code](https://code.visualstudio.com/) is free and good.
Use **Ctrl+F** to find the text you want to change.

### 1. Your photo

Save a square photo (e.g. 500×500 px) as `assets/profile-image.jpg`, then find this line and swap
`.svg` for `.jpg`:

```html
<img class="profile-image" src="assets/profile-image.svg" alt="Lasan Perera" />
```

### 2. Your LinkedIn link

Search for `linkedin.com` and replace the URL with your real profile link. Same for the GitHub
links — search `Lasan-Perera` and confirm the username is right.

### 3. Project links

Every project card has a GitHub icon pointing to your profile. Replace each `href` with the
specific repository URL:

```html
<a href="https://github.com/Lasan-Perera/mazerunner" target="_blank" aria-label="GitHub">
```

To add a live demo or video link next to it, drop in a second line inside the same
`<div class="project-link">`:

```html
<a href="YOUR-LINK-HERE" target="_blank" aria-label="Live"><i class="fas fa-globe"></i></a>
```

---

## Adding photos to project cards

Cards currently use a dark gradient with a faded icon. To use a real photo of a robot or PCB:

1. Put the image in `assets/project/` — say `mazerunner.jpg` (around 600×400 px works well).
2. Add `style="background-image: url('assets/project/mazerunner.jpg')"` to that card's opening tag:

```html
<div class="card" style="background-image: url('assets/project/mazerunner.jpg')">
```

The dark overlay stays on top automatically, so the white text is still readable.

---

## Changing colours

All colours live at the top of `css/style.css` in the `:root` block. Change one value and the whole
site follows:

```css
--primary-color: #ffcd42;   /* the yellow accent */
--bg-primary: #ffffff;      /* page background in light mode */
--text-color: #222222;      /* main text colour */
```

The `[data-theme="dark"]` block right below it does the same for dark mode.

---

## Adding a new project card

Copy any block that starts with `<div class="card">` and ends with `</div>` after the
`card-detail` paragraph, paste it inside `<article class="project">`, then edit the title, tech
line, link and description. The grid handles the layout on its own.

Icon names come from [Font Awesome](https://fontawesome.com/v5/search) — change
`fas fa-robot` to any icon there.

---

## Publishing it free with GitHub Pages

1. Create a new repository on GitHub named exactly **`Lasan-Perera.github.io`** (use your username)
   and make it **Public**.
2. On the repository page click **Add file → Upload files**, then drag in *the contents* of the
   `portfolio` folder — `index.html`, the `css`, `js` and `assets` folders. `index.html` must sit
   at the top level, not inside another folder.
3. Click **Commit changes**.
4. Go to **Settings → Pages**. Under "Branch" pick `main` and `/ (root)`, then **Save**.
5. Wait about a minute. Your site is live at `https://lasan-perera.github.io`.

Every time you upload a changed file, the live site updates within a minute or two.

**Netlify alternative:** go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the
whole folder onto the page. It's live in seconds, though the URL is random until you rename it.

---

## Checking your work locally

Double-click `index.html` and it opens in your browser. After every edit, save the file and press
**Ctrl+R** in the browser to see the change. If something looks broken, press **F12** to open the
developer console — errors show up in red there.

---

## Credit

Design based on [portfolio-html](https://github.com/CommunityPro/portfolio-html) by CommunityPro,
used under the MIT License (see `LICENSE`). If you find the template useful, star their repository.
