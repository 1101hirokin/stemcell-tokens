# Changelog

Versioning is suspended until the first release: pins stay at `0.0.0-alpha.N` and
breaking changes are not expressed as major bumps. This file carries what the version
number no longer says. See `GOVERNANCE.md` §3 in `stemcell-component-prompts`.

## 0.0.0-alpha.2

### Fixed — neutral border contrast (WCAG 2.2 SC 1.4.11)

`color.app.border` is the resting outline of inputs and cards, so it is a component
boundary and 1.4.11 asks for 3:1 against the ground. It aliased gray rungs that vanished:
light 1.57:1 (gray.200 on white), dark as low as 1.0:1 (gray.700 equalled the raised
surface), and 1.33:1 on the card surface, 1.73:1 on the flat one. This was documented as an open hole in color.md §10,
found during the Card outlined review.

- Light `border` → `#8592A2`, its own authored value at 3.17:1 against white. The gray
  staircase has no rung near 3:1 (400 is 2.47:1, 500 is 5.37:1), so it is authored, exactly
  as the semantic borders are.
- Dark `border` → `{color.gray.300}`, 3.35:1 on the lightest dark surface (modal). Dark's
  staircase does land a rung in the 3:1 zone, so it stays an alias.

The border check (`bun run check:palette`) now covers `color.app.border`, not only
`color.semantic.*.border`. It was out of scope before, which is how the weak value went
unnoticed. `divider` stays excluded: decorative separation, which 1.4.11 exempts.

Provisional. Token values are otherwise unchanged; the palette-wide author (color.md §10)
will revisit. No token names added or removed.

## 0.0.0-alpha.1

### Fixed — package exports

`density-compact` was shipped in the tarball but missing from the `exports` map, so
`import '@stemcell/tokens/density-compact.css'` (and the `./density-compact` JS subpath)
was blocked for any consumer — `exports` closes every subpath it does not list. Found by
the first publish to the local registry: the svelte playground consumes this file and could
not resolve it. Both subpaths are now exported. Token values are unchanged; this is a
packaging fix only.

## 0.0.0-alpha.0

Renumbered from `0.1.2`. The package has never been published, so nothing downstream
had to move; `0.1.2` implied a release history that does not exist.

### Breaking — elevation

The raw shadow scale is gone. Elevation is now six named levels, each with a `level`
number and `surface` + `shadow` facets. The facets are emitted per theme, so
`base.css` no longer carries them.

| Removed | Replacement |
|---|---|
| `--elevation-0` … `--elevation-23` | `--elevation-<level>-level` (0–5), `--elevation-<level>-surface`, `--elevation-<level>-shadow` |
| `--elevation-semantic-card` | `--elevation-surface-shadow` + `--elevation-surface-surface` |
| `--elevation-semantic-popover` | `--elevation-popover-shadow` + `--elevation-popover-surface` |
| `--elevation-semantic-modal` | `--elevation-modal-shadow` + `--elevation-modal-surface` |
| `--elevation-semantic-overlay` | `--elevation-notification-shadow` + `--elevation-notification-surface` |

Levels: `flat` (0), `surface` (1), `navigation` (2), `popover` (3), `modal` (4),
`notification` (5).

Migrating means applying both facets rather than a shadow alone. A raised surface was:

```css
.card { box-shadow: var(--elevation-semantic-card); }
```

and is now:

```css
.card {
  background: var(--elevation-surface-surface);
  box-shadow: var(--elevation-surface-shadow);
}
```

Dropping the `background` line leaves the component correct in light and flat in dark,
where depth is drawn by lightening the surface instead of by casting a shadow.

There is no mechanical mapping from the old numeric levels: `0`–`23` were shadow
depths, while the new names are structural roles. Pick the level by what the component
*is*, not by which shadow it used to have.

### Fixed

- Elevation shadows were hardcoded `rgba(0, 0, 0, …)` and ignored the theme. They now
  resolve `color.app.shadow` (`#292f36`, a slightly-blue neutral black), which is what
  the elevation foundation has always specified.

### Elevation is not a theme's to change

A theme supplies the colours elevation draws with, and nothing else. The levels and the
shadow geometry live in `src/elevation.tokens.json`, which is not a theme file — the
constitution makes Elevation a structural layer and allows overriding only colour and
material, and a shadow's offsets and blur are quantity, not colour.

The two colours a theme does own are `--color-app-shadow-umbra` and
`--color-app-shadow-penumbra`.

Note that elevation is emitted into *every* theme block rather than once into `base.css`.
That is not duplication for its own sake: a custom property holding `var()` resolves where
it is declared, so a single copy at `:root` would hand every subtree the root theme's
shadow, and `[data-theme]` would silently stop working below the root.

### Dark now casts a slight shadow

Dark used to cast none. The tonal ladder tops out at `gray.600` — going lighter drops body
text below AA — so `modal` and `notification` share a surface, and a toast rendered over a
dialog was invisible. Dark's shadow is black rather than `gray.900`: dark's own surfaces
start at `gray.900`, so a `gray.900` shadow is 1.30:1 against `gray.800` and does not read.

### Notes for other platforms

Shadow colours and `--scrim` carry their colour as a plain alias and their alpha as a
number (`$extensions.stemcell.alpha`). The CSS `rgba()` is composed by the web transform.
Exporters for other platforms should read the alias and the alpha rather than parsing the
CSS string.

### Added

- `--scrim` — the veil behind modals, at `color.app.scrim` / 50%.
- `--layer-*-rank` / `--layer-*-z` — seven layers in a fixed order: `base`, `navigation`,
  `popover`, `scrim`, `modal`, `notification`, `tooltip`. `rank` (0–6) is the order itself;
  `z` (0, 10, 1000, 1300, 1400, 1700, 1800) is how CSS says it, gaps and all. Components
  reference these instead of writing raw z-index values. The split mirrors elevation's
  `level` vs facets: `1700` means nothing off the web, but "above notification, below
  tooltip" means the same everywhere.
- `--breakpoint-*` — `compact` 0, `medium` 600px, `expanded` 840px, `large` 1200px,
  `x-large` 1600px. These stay in device pixels to track native size classes. Note they
  cannot be read from CSS: custom properties are not substituted in `@media` or
  `@container` conditions, so consume them from the TS `vars` export.
- `--container-*` — `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `prose` 66ch.
