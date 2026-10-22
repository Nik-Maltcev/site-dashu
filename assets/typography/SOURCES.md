# Typography alternatives

Two additional dark landing variants, retaining the current content, composition, images and video:

- `/font-01.html`: Unbounded display headings with Onest body and interface text.
- `/font-02.html`: Manrope headings with Golos Text body and interface text.

Each variant uses two font families. The original `/index.html` and `/concept-light/` remain unchanged. A comparison bar links the two alternatives and the original landing.

Fonts are downloaded from the official Google Fonts CSS API, served locally as WOFF2, and limited to Cyrillic and Latin subsets. Each font's SIL Open Font License is included beside the files.

Official family pages:

- https://fonts.google.com/specimen/Unbounded
- https://fonts.google.com/specimen/Onest
- https://fonts.google.com/specimen/Manrope
- https://fonts.google.com/specimen/Golos+Text

Rebuild downloads with `python scripts/prepare-typography.py`; refresh the two HTML previews from the current index with `python scripts/build-font-previews.py`.
