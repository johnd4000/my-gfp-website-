# Partners in Planning — website

Static site (plain HTML + CSS + vanilla JS). No build step, no dependencies.
Open `index.html` in a browser, or serve the folder over HTTP.

---

## ⚠️ Before this goes live

This is a **draft with placeholder content**. The items below are not optional.

### 1. The contact form does not send anywhere
`contact.html` validates input but has **no delivery endpoint**. Submitted enquiries
currently go nowhere. Connect one before publishing — see *Wiring up the form* below.

### 2. Replace every `[bracketed]` placeholder
Search the project for `[` to find them all. They include:

| Placeholder | Where | Notes |
|---|---|---|
| `[Legal entity name]`, `ABN [00 000 000 000]` | Footer, all 7 pages | |
| Corporate Authorised Representative `No. [000000]` | Footer, all 7 pages | |
| `[Licensee name]`, `AFSL [000000]` | Footer, all 7 pages | |

### 3. Legal / compliance pages
The footer links to **Financial Services Guide**, **Privacy Policy** and
**Complaints** — all currently `href="#"`. These need real pages. Your licensee
will usually have required wording; check with them rather than writing your own.

The general-advice disclaimer in the footer is a **starting point only** and has not
been reviewed by anyone qualified to approve it. Have your licensee sign it off.

### 4. The "independent" claim needs licensee sign-off

The **Why Choose Us** section on the homepage uses the words *unbiased*,
*independent* and *"100% true independence"*.

In Australia these are restricted terms. **Section 923A of the Corporations Act
2001** allows them only where the provider receives no commissions, no
volume-based payments and no other gifts or benefits that could reasonably
influence the advice, and is free from direct or indirect restrictions or
influence from product issuers. Using them without meeting every limb carries
penalties, and ASIC has acted on it. Separately, s942DA requires a provider who is
*not* independent to say so in their FSG.

The copy states you accept no commissions on any product including insurance,
which speaks to the main condition — so this is likely accurate for your practice.
It is flagged here only because it is a legally loaded claim rather than ordinary
marketing copy, and it should be confirmed with your licensee before publication
along with the rest of the site.

> Nothing on this site was invented about your business — every credential, number
> and claim is a blank for you to fill. Please keep it that way.

---

## Files

```
index.html          Home  (slideshow hero → statement hero → content)
about.html          About Us
services.html       Our Services overview (links to the three pages below)
retirement-and-super.html  Retirement and Super
financial-planning.html    Financial Planning
investing.html             Investing
contact.html        Contact Us   (enquiry form)

assets/css/site.css Design tokens + all styling
assets/js/site.js   Nav, scroll reveal, hero slideshow, form validation
assets/img/         slide-1..5.jpg (hero slideshow), services-bg.jpg
                    (homepage Services backdrop, Luca Bravo / Unsplash,
                    under a sage wash — see .section__wash in site.css
                    before lightening it), about-stream.jpg (Elyse /
                    Unsplash) and sustainable-grasses.jpg (Parker
                    Sturdivant / Unsplash) beside the two homepage text
                    blocks, about-lorikeet.jpg (Chris Charles / Unsplash)
                    beside the About page story + your photography
assets/logo/        ← drop your logo here
serve.py            Local preview server (dev only, do not deploy)
_archive/           Retired pages (how-we-help.html). Not linked, do not deploy
.claude/launch.json Local preview config (dev only, safe to delete)

Video Slideshow/    UNUSED source footage — do NOT upload (~186 MB)
```

**Do not deploy the `Video Slideshow/` folder.** Since the hero moved from video to
photographs it is no longer used by the site at all — it holds only the original
51 MB render and its four source clips. Safe to delete or archive elsewhere; nothing
references it.

There is no templating, so the header and footer are duplicated in all 7 pages.
**If you change the nav or footer, change it in all seven.**

---

## Adding your logo

Currently the header shows a **text placeholder**, not a designed logo:

```html
<a class="brand" href="index.html">
  Partners in Planning
  <span class="brand__sub">Green Financial Planning</span>
</a>
```

Put your file at `assets/logo/logo.svg` and replace that block — in **all 7 pages** —
with:

```html
<a href="index.html"><img src="assets/logo/logo.svg" alt="Partners in Planning" class="brand__img"></a>
```

`.brand__img` is already styled (44px tall, auto width). SVG is strongly preferred
over PNG so it stays sharp on high-DPI screens.

**Note on colour:** the header sits over a dark hero, so a light/reversed logo works
best there. If your logo is dark-only, either add a light variant or set the header
to solid cream from the start (remove the transparent-over-hero behaviour in
`site.css` §6).

---

## The homepage slideshow hero

The homepage opens with a full-screen crossfading slideshow behind the practice
name and a single *Book an introduction* button. Scrolling once lands on the green
statement hero ("Wealth that reflects what you value").

Five photographs, held 7 seconds each, with a 2-second crossfade and a slow drift
(Ken Burns) across each still.

### How it behaves

| Situation | What happens |
|---|---|
| Normal | Slides crossfade automatically; a discreet pause control sits bottom-right |
| "Reduce motion" enabled in OS | **No auto-advance at all** — one still photograph, no drift, no fade |
| Hero scrolled off screen | Timer stops, so it never runs in the background |
| Browser tab in background | Timer stops |
| Visitor presses pause | Stays paused — scrolling away and back does **not** silently resume it |
| Touch device | Swipe left/right changes photograph |
| JavaScript off / fails | Slide 1 shows as a normal static hero. Nothing breaks |

The images are **in the HTML**, not in a JS array or a JSON file. That matters for
three reasons: the hero still renders with JavaScript disabled, search engines and
link-preview scrapers can see the images, and `fetch()` is blocked on `file://`
URLs — a JSON-driven version would work on a server but show an empty hero when you
open `index.html` by double-clicking it.

### Changing the photographs

Swap the `src` on any `<img class="hero__slide">` in `index.html`. Nothing else
needs editing — not the CSS, not the JS. To add or remove a slide, add or delete
one `<img>` line; the script counts them at runtime.

Keep `alt=""` on all of them. They are decorative — the headline carries the
meaning — and the stage is `aria-hidden`. The original file this came from
announced "Photograph 3 of 5" to screen readers every 7 seconds, which interrupts
someone mid-sentence, repeatedly, to tell them nothing they need.

Current images are 1440×960 JPEGs, roughly 200–270 KB each (~1.2 MB total). Only
the first loads eagerly; the rest are lazy. If you swap in much larger files,
re-compress them — anything over ~300 KB each is worth squeezing.

### Timing

- **Hold per slide** — `HOLD` in the `heroSlides` block of `assets/js/site.js` (7000 ms)
- **Crossfade speed** — the `2000ms` transitions on `.hero__slide` in `site.css`
- **Drift speed** — the `13s` transform transition on `.hero__slide.is-active`

### Contrast over photographs — read before changing the overlay

Text contrast over imagery is not fixed the way it is over a solid colour; it
changes with each photograph. All five were measured through the overlay, sampling
the brightest 5% of pixels behind the text:

| | Worst case | Needs |
|---|---|---|
| Cream headline | **6.35:1** | 4.5:1 |
| Sub-label (`--sage-bright`) | **5.18:1** | 4.5:1 |

Both pass comfortably. **Re-measure if you swap in brighter photographs** — several
of the current set are bright at the top and only clear the bar because of the
overlay. If a new image fails, deepen the linear layer in `.hero__scrim--media`.


## Adding images

Every image position is a labelled placeholder box. Two kinds:

**Hero backgrounds** — in each page's `<section class="hero">`:
```html
<img class="hero__media" src="assets/img/hero.jpg" alt="">
```
Add that, then delete the `<div class="hero__scrim-art">` line above it. Keep
`alt=""` — the hero image is decorative and the heading already carries the meaning.

**Content images** — replace the inner `<span>` of any `.media-frame`:
```html
<div class="media-frame">
  <img src="assets/img/team.jpg" alt="Describe what the photo shows">
</div>
```
Content images need a real `alt` description.

Use WebP or AVIF where you can, and keep files under ~300KB. The frames have fixed
aspect ratios so images won't cause layout shift as they load.

---

## Wiring up the form

Easiest option — a hosted form service. With **Formspree** or **Basin**, set the
form's action and method:

```html
<form class="form" data-validate novalidate action="https://formspree.io/f/YOUR_ID" method="POST">
```

Then in `assets/js/site.js`, find the block marked `NO BACKEND CONNECTED YET` and
replace `e.preventDefault()` + the status message with `form.submit()` once
validation passes.

If you host on **Netlify**, add `netlify` to the `<form>` tag instead and it wires
itself up.

**Whichever you choose, send a test enquiry and confirm it arrives** before you
announce the site.

The form deliberately asks people *not* to include TFNs or account numbers. Don't
remove that hint — and make sure wherever enquiries land is somewhere appropriate
for personal information.

---

## Design system

Generated with the `ui-ux-pro-max` skill, then adapted: the skill recommended a
navy/blue "professional finance" palette, which was replaced with a green-led one to
match the brand. Structure, type pairing and accessibility rules are the skill's.

### Colour — all pairs verified ≥ 4.5:1 (WCAG AA)

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--forest` | `#12301F` | Headings, body, dark sections | 13.64:1 on cream |
| `--green` | `#15603F` | CTAs, links, accent | 7.21:1 on cream |
| `--muted` | `#4A5A4F` | Secondary text | 6.99:1 on cream |
| `--cream` | `#FDF9F4` | Page background | — |
| `--sage-tint` | `#E8EFE4` | Soft section bands | — |
| `--sage` | `#B7C9B4` | Muted text on dark | 8.19:1 on forest |
| `--sage-bright` | `#DCE6D9` | Muted text **over video** | 5.26:1 worst frame |

All defined at the top of `site.css`. **If you change a colour, re-check contrast**
(WebAIM Contrast Checker) — several pairs are comfortable but not enormous.

### Type
**EB Garamond** (headings) / **Lato** (body), loaded from Google Fonts. Body is 16px
with 1.65 line-height; fluid `clamp()` sizing scales headings across breakpoints.

### Reference
Layout language adapted from kubehotel-saint-tropez.com as requested — warm off-white
base, full-bleed dark hero, editorial section rhythm, generous whitespace, uppercase
letterspaced eyebrow labels, scroll-reveal on section entry.

---

## Accessibility

Built in and verified:

- Skip link on every page; single `<h1>` per page; `lang="en-AU"`
- Visible 3px focus rings, never removed (lightened on dark surfaces)
- All interactive targets ≥ 44×44px
- Form errors sit beside their field, with `role="alert"`, `aria-invalid`, and focus
  moved to the first problem on submit
- 16px minimum body text (also prevents iOS zoom-on-focus)
- No horizontal scroll at 375px
- `prefers-reduced-motion` fully respected

**Scroll reveal fails safe.** The hidden starting state is only applied if the
browser supports `IntersectionObserver` *and* the visitor hasn't asked for reduced
motion — so content is never stranded invisible if JavaScript fails. Don't change
`.js .reveal` back to plain `.reveal` in the CSS; that's what guarantees it.

### Still worth doing
- Test with a real screen reader (NVDA on Windows is free)
- Re-run contrast checks after any colour change
- Add real `alt` text as you add images

---

## Local preview

```bash
python serve.py
```

Then open <http://localhost:8080>. Leave the window open; closing it stops the
server. Pass a port to use a different one: `python serve.py 3000`.

**Use `serve.py`, not `python -m http.server`.** They are otherwise identical, but
`serve.py` sends `Cache-Control: no-store`, so the browser can never show you a
stale copy. With the plain server, Chrome holds on to old CSS and JS — you edit a
file, reload, see no change, and reasonably conclude your edit didn't work. That
exact confusion cost time twice while this site was being built.

If you ever do serve it another way and something looks unchanged, hard-refresh
with **Ctrl+F5** before assuming the edit failed.

Opening `index.html` directly via `file://` also works — the site uses only
relative paths and no `fetch()` — but a server is closer to production.

`serve.py` is a development tool. Don't deploy it.

---

## Deploying

It's a folder of static files, so it works anywhere:

- **Netlify / Cloudflare Pages / Vercel** — drag the folder in, done. Free tier is fine.
- **Traditional hosting (cPanel)** — upload the contents to `public_html`.

Add HTTPS (all three hosts above do it automatically), and set up a redirect from
`www` to your apex domain or vice versa so you don't split SEO.

### Not yet included
`robots.txt`, `sitemap.xml`, favicon, Open Graph preview images, and analytics.
Worth adding before launch — ask and they can be set up.
