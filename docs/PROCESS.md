# How this rebuild was made

This document covers the process, the decisions, the AI tooling and prompts, the problems I hit, how it was tested,
and how it is deployed.

## 1. The brief

> Build a complete clone of https://puppy.instabizweb.com/ matching design, layout, responsiveness and functionality as
> closely as possible. Deploy it, share the GitHub repo, and record a Loom explaining the process, structure,
> technologies, AI tools, exact prompts, decisions, challenges, testing and deployment.

## 2. Approach: measure first, then rebuild

The reference is not a template. It is a hand-crafted Next.js site with a rigged SVG mascot, scroll-pinned scenes,
procedurally drawn card frames and a page-transition "curtain". Eyeballing screenshots would have produced a loose
imitation, so I reverse-engineered it systematically and then rebuilt every part as my own, readable source.

| Step | What I did | Tooling |
|---|---|---|
| Recon | Downloaded every page, listed routes, headings and sections | `curl`, small Python scripts |
| Design tokens | Pulled the colour palette, fonts (with variable axes), easing curves and type scale out of the compiled CSS | `prettier` on the CSS, grep |
| Content & data | Decoded the React Server Components payload (`self.__next_f`) into typed JSON: 15 available puppies, 27 gone-home pups, 64 family photos, 9 FAQs, steps | `tools/reverse-engineering/rsc.py`, `data.py`, `gone.py` |
| Media | Downloaded the 230+ photos and videos referenced by the pages | `curl` |
| Styles | Split the ~5,000 lines of component CSS into one stylesheet per feature, keeping cascade order | `splitcss.py` |
| Artwork | Converted the inline SVG illustrations into typed React components (`useId` for clip-path ids) | `jsx.py`, `art.py` |
| Mascot | Found that "Teddy" is one rigged drawing whose parts (`data-p="head|earL|tail|…"`) are re-posed per scene. Generated one `TeddyArt` component + a pose table (13 poses) | `teddy.py` |
| Behaviour | Read the minified client bundles to learn the state contract (`data-armed`, `data-revealed`, `data-pinned`, curtain states, filter URL params, form phases), then wrote my own implementations | prettier + reading |
| Verify | Full-page screenshots of reference vs. rebuild side by side at 1440px and 390px, page-height comparison, functional e2e tests | Playwright (`shot.mjs`, `sbs.py`, `tests/e2e.mjs`) |

## 3. Architecture & key decisions

- **Next.js 16 App Router, everything static.** All 50 routes are prerendered (`generateStaticParams` for 42 puppy
  profiles). The only server code is the enquiry Server Action. I switched off the scaffold's `cacheComponents` /
  partial prefetching because a static brochure site gains nothing from them and they forbid things like `new Date()`
  in the footer.
- **Data-driven components.** Content lives in `src/data/*.json` behind typed accessors in `src/lib/data.ts`. Pages map
  over data; nothing is hand-copied HTML.
- **Tailwind v4 + feature stylesheets.** Theme tokens (`--color-*`, fonts, eases) live in `@theme`; brand type
  utilities (`font-plush`, `font-scrawl`, `text-huge`, `gutter`, `measure`…) are `@utility` rules. The bespoke
  illustrations and scenes keep their own BEM-style stylesheets in `src/styles/` (home, puppies, faq, …), which is
  far easier to maintain than thousands of arbitrary-value utilities.
- **Progressive enhancement.** The server HTML is complete and visible. JavaScript only *arms* reveal animations,
  and only for content below the fold. Filters, gallery, FAQ and forms all work as plain links and forms first.
- **Faithful procedural art.** Puppy cards get a wobbly hand-inked frame, a watercolour wash and doodles. I
  re-implemented the technique in `src/lib/sketch.ts`: an FNV-1a hash of the slug seeds a mulberry32 PRNG, and a
  sine-perturbed circle is smoothed into Béziers with Catmull-Rom. Because it is deterministic, server and client
  render the same frame and the cards match the reference stroke for stroke.
- **Accessibility.** Skip link, real `<dialog>`s for the menu and photo viewer, an ARIA tab pattern with arrow keys
  for "Two ways home", `aria-expanded`/`inert` FAQ notes, focus moved to errors and the success state on the forms,
  and `prefers-reduced-motion` respected everywhere.
- **Not impersonating the business.** `robots: noindex`, `robots.txt` disallow, and a small "not affiliated" line in
  the footer.

### Interactive pieces I wrote

| Feature | File | Notes |
|---|---|---|
| Curtain page transition | `components/layout/Curtain.tsx` | Captures internal link clicks, covers (300ms), `router.push`, lifts on the new pathname |
| Smooth scroll | `components/motion/SmoothScroll.tsx` | Lenis, disabled for reduced motion, resets on navigation |
| Scroll reveals | `components/motion/Reveal.tsx` | IntersectionObserver + MutationObserver for client-rendered lists |
| Pinned "Meet the pups" hallway | `components/home/MeetPin.tsx` | Sticky stage at ≥1024px; spring-smoothed slide (semi-implicit Euler sub-steps); doors start shut and open as they pass 36% of the viewport, cueing Teddy to look |
| WhatsApp chat replay | `components/home/ChatPlayback.tsx` | Typing indicator, then each reply lands as its step lights up |
| Quilt lineup | `components/home/HeroLineup.tsx` | Name tags on hover/focus; a random pup pops up while the hero is on screen |
| Filters | `components/puppies/PuppyBrowser.tsx` | Combinable `origin/breed/gender/collection` URL params via `history.replaceState` |
| Gallery + viewer | `components/puppy/Gallery.tsx`, `media/PhotoViewer.tsx` | Thumbnails, keyboard arrows, swipe, video support |
| FAQ notice board | `components/faq/NoticeBoard.tsx` | Search with `<mark>` highlighting; matching answers unfold |
| Letter contact form | `components/forms/LetterForm.tsx` | Fill-in-the-blanks letter; seal → post → sent animation |
| Walking Teddy | `components/teddy/PupJourney.tsx`, `rig.ts` | See section 3a |
| Paw cursor trail | `components/effects/PawTrail.tsx` | One fixed canvas; a print every 46px of mouse travel, alternating feet, fading over 1s |
| Plane Korea → Dubai | `components/media/Flight.tsx` | Scroll progress → `getPointAtLength` on the route, banked along the tangent |
| Hero lineup | `components/home/HeroLineup.tsx` | Pups duck under the quilt and pop up with a name tag; all tuck away once Teddy leaves the hero |
| Static Teddys | `components/teddy/PupLife.tsx` | Pet the Teddys on other pages for a hop, hearts and a bark |

### 3a. The walking mascot

Teddy is one SVG with named parts (`data-p="head|earL|tail|fn|…"`).

- **`rig.ts`.** A pose is about 20 numbers (body/head offsets, leg angles, which eyes show). `partTransforms()` turns
  a pose plus live motion (walk phase, stride, tail wag, blink, gaze, ear spring) into SVG transforms. `TeddyRig`
  eases toward the target pose every frame, springs the ears and hops, blinks at random intervals, and writes only
  the attributes that changed.
- **`PupJourney.tsx`** (the choreographer):
  1. Measure every `[data-pup-stop]` in the page's scenes, including stops inside sticky/pinned containers.
  2. Give each stop a *hold* range of scroll positions, then squeeze the ranges so each walk gets scroll room in
     proportion to the distance covered.
  3. Between holds, move Teddy along a smootherstep-timed cubic Bézier, hopping out of / into hiding places (the
     quilt, the basket), softly clamped inside the viewport.
  4. Sync the leg cycle to the distance walked so the feet don't slide, and drop paw prints (a pool of 24 SVGs,
     fading over 2.6s) on alternating feet.
  5. While holding, idle: look at the scene's points of interest, wag, tilt. In the hallway he walks in place as the
     doors slide by.
  6. Tell each scene whether Teddy is `data-here`; the hero tucks its pups under the quilt when he leaves.
  7. On phones, switch to a "lane" mode where he peeks in from alternating screen edges.

  Re-measures on resize, font load and image load ease from his old position instead of jumping. Reduced motion
  turns it all off and shows the static Teddys.

## 4. AI tools and prompts

- **Claude Code** (Anthropic's CLI agent, Claude Opus 5.5) for the reverse-engineering scripts, component code,
  debugging and test runs. I reviewed and steered every step.
- The opening prompt was the assignment text itself, pasted in full (section 1). From there I gave the AI a few
  working constraints:
  - *"Measure the reference instead of guessing: extract tokens, data and SVGs, then rebuild them as clean,
    data-driven components."*
  - *"Keep the original class names and CSS cascade so the visuals match, but write all behaviour yourself."*
  - *"After each page, screenshot reference vs. clone side by side and compare page heights."*
  - *"Respect reduced motion, keep the HTML usable without JS, and mark the site noindex so it doesn't impersonate
    the real business."*

  *(Add the follow-up prompts you used in your own session here before recording; the brief asks for the exact
  prompts.)*

## 5. Challenges and how I solved them

| Problem | Cause | Fix |
|---|---|---|
| Tailwind build crashed with `Missing opening (` | Tailwind v4 scans every file for class candidates, including the JSON data (base64 blur strings) and raw CSS | `@source not "../data"` and `@source not "../styles"` |
| CSS split produced broken files | My splitter flushed a block at brace depth 0, which cut multi-line selectors such as `:is(\n…)` in half | Only flush once the buffer contains `{` |
| Prerender error on `new Date()` | The Next 16 scaffold enables Cache Components | Turned it off, since the site is fully static |
| `params` / `searchParams` errors | In Next 16 they are Promises | `await params` with the generated `PageProps<'/puppies/[slug]'>` types |
| Forms lost what was typed after a validation error | React 19 resets forms after an action | The action echoes `values` back and fields use them as `defaultValue` |
| Puppy listing was 388px shorter than the reference | The reference also renders an "Already gone home" strip of 27 rehomed pups that have their own profiles | Scraped all 27 profiles into `gone-home.json` and added the strip, the `/gone-home` tickets and rehomed profile variants |
| Home page wall showed different family photos | The home page orders the 64 photos differently from `/happy-families` | Stored the home order separately (`home-wall-order.json`) |
| The hallway flew off-screen and Teddy flickered left/right | The stiff spring (k≈486, c≈91) was integrated with explicit Euler at frame-sized steps, which is unstable above ~22ms | Semi-implicit Euler in ≤4ms sub-steps |
| Scroll pacing felt faster than the reference | Filmstrips showed the reference lands at 0.85× the wheel distance | Lenis `wheelMultiplier: 0.85` |
| `setState` in effects flagged by the React Compiler lint | Hydration flags and the header reset | DOM attribute write; state adjustment during render |

## 6. Testing

- **Visual parity.** Full-page screenshots at 1440px for every page, compared side by side. Full-page heights match
  the reference to the pixel on all 10 page types I measured: home (10,029px), puppies, an available profile, a
  gone-home profile, gone home, happy families, how it works, FAQ, contact and 404. At 390px the only difference is
  the extra "not affiliated" footer line (+50px). Matching heights catch layout and spacing differences; the side-by-side
  images catch visual ones.
- **Functional e2e** (`tests/e2e.mjs`, 28 checks, all passing): hallway pinning and sliding, chat replay, curtain
  cover/lift, filters and URL sync, empty state, gallery and viewer, enquiry validation and success, FAQ unfold and
  search highlighting, the letter form's post animation, the mobile menu, no horizontal overflow at 390px on every
  page, and the 404 status. The run also checks there are no runtime errors.
- **Motion filmstrips** (`tools/reverse-engineering/film.mjs`). Wheel-scroll both sites to the same checkpoints and
  log Teddy's on-screen position, the door count and active paw prints. Teddy lands on the same pixels as the
  reference at each hold (e.g. 395,518 in the hero and 190,671 in the hallway) on desktop and at 390px.
- `pnpm lint` (ESLint with the React Compiler rules) and `tsc` via `next build` are clean.

## 7. Deployment

1. Push the repo to GitHub.
2. Import it in Vercel (framework auto-detected) or run `vercel --prod` from the CLI.
3. Optional: set `ENQUIRY_WEBHOOK_URL` so enquiries are forwarded somewhere real.
4. Run `node tests/e2e.mjs https://<deployment-url>` against the live URL.

## 8. Known gaps

- The "Your puppy journey" chat on the reference is pinned and advances with scroll; here it replays on a timer
  the first time it comes into view.
- Teddy's idle/click tricks are my own set (woof, hop, love, sneeze, tilt, bow, peekaboo) rather than a copy of every
  routine in the reference.
- The rendered success copy for enquiries is not visible in the reference's static HTML, so I wrote my own. The same
  goes for the step copy of a "local" puppy profile, since the reference currently lists no local puppies.
- Enquiries have no CRM behind them (they go to a webhook or the server log).
