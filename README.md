This README is AI-generated.

Live site: https://Ancient7999.github.io/Finals/

# Finals — Question Banks · Final Exam

GitHub Pages app for **Finals** (Final Exam). English, Medical Terminology, Anatomy, Medical Physics and Study Skills are listed under **Week 16-18**.

This is a skeleton: most subjects do not have question banks yet. Study Skills is live (Lectures 1-14 plus Mixed 5-10). Medical Physics currently has draft banks for Chapters 7 and 8, a Mixed Chapters set, and Chapter 7 formula practice.

- `index.html` — main menu (Quiz / Info)
- `quiz.html` — question banks
- `data/catalog.json` — the list of materials and the bank file of each set
- `banks/…/*.json` — one file per question bank, fetched only when its material is opened (always fresh, `cache: 'no-store'`), so an edited bank shows on a normal refresh

Progress is saved only in your browser, under keys that do not overlap with the Periodic Test 2 site.
