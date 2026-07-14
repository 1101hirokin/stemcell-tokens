# Changelog

Versioning is suspended until the first release: pins stay at `0.0.0-alpha.N` and
breaking changes are not expressed as major bumps. This file carries what the version
number no longer says. See `GOVERNANCE.md` §3 in `stemcell-component-prompts`.

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
- `--layer-*` — a seven-step z-index scale (`base` 0, `navigation` 10, `popover` 1000,
  `scrim` 1300, `modal` 1400, `notification` 1700, `tooltip` 1800). Components should
  reference these instead of writing raw z-index values.
- `--breakpoint-*` — `compact` 0, `medium` 600px, `expanded` 840px, `large` 1200px,
  `x-large` 1600px. These stay in device pixels to track native size classes. Note they
  cannot be read from CSS: custom properties are not substituted in `@media` or
  `@container` conditions, so consume them from the TS `vars` export.
- `--container-*` — `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `prose` 66ch.
