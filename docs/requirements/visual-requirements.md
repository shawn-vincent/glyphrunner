# GlyphRunner – Prototype Visual Style Guide (Lean Edition)

*A crisp, cyber-dharma look in three strokes: black canvas, white glyphs, electric-cyan signal.*

---

## 1. Core Palette

| Token       | Hex       | Purpose                |
| ----------- | --------- | ---------------------- |
| **surface** | `#000000` | Background everything  |
| **glyph**   | `#FFFFFF` | Default text & icons   |
| **accent**  | `#00D1FF` | Links, buttons, cursor |

> **Tailwind add-on**

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        surface: "#000",
        glyph:   "#fff",
        accent:  "#00D1FF",
      },
    },
  },
};
```

---

## 2. Typography

| Role            | Font                        | Size                                         |
| --------------- | --------------------------- | -------------------------------------------- |
| Body & headings | `Inter, sans-serif`         | 1 rem (scale headings with Tailwind classes) |
| Code blocks     | `JetBrains Mono, monospace` | 0.95 rem                                     |

White on black; headings may optionally use **accent**.

---

## 3. Spacing & Corners

| Token    | Value    |
| -------- | -------- |
| `gap-sm` | `0.5rem` |
| `gap-md` | `1rem`   |
| `radius` | `0.5rem` |

Use `gap-md` between chat messages; apply `rounded-[radius]` to bubbles & buttons.

---

## 4. Key Components (class hints)

| Component                   | Base Classes                                                                      |
| --------------------------- | --------------------------------------------------------------------------------- |
| **Chat bubble – user**      | `bg-gray-800 text-glyph rounded-radius px-gap-md py-gap-sm`                       |
| **Chat bubble – assistant** | `bg-surface text-glyph border border-gray-700 rounded-radius px-gap-md py-gap-sm` |
| **Send button**             | `bg-accent text-surface hover:bg-accent/80 rounded-radius px-3 py-2`              |
| **Streaming cursor**        | `text-accent animate-pulse`                                                       |

*(Gray-800 & Gray-700 are Tailwind defaults; no custom entries needed.)*

---

## 5. Logo & Favicon

* **Logo icon**: white “GR” monogram on transparent background (SVG, 128 × 128).
* **Favicon**: 16 × 16 PNG, same monogram.

Place files in `/public`.

---

## 6. Quick Snippet (HTML)

```html
<body class="bg-surface text-glyph font-sans">
  <div class="flex flex-col h-screen">
    <main class="flex-1 overflow-y-auto space-y-gap-md p-gap-md">
      <!-- chat bubbles -->
    </main>

    <form class="flex gap-gap-sm p-gap-md border-t border-gray-700">
      <textarea class="flex-1 bg-gray-800 rounded-radius p-gap-sm resize-none"></textarea>
      <button class="bg-accent text-surface rounded-radius px-4">Send</button>
    </form>
  </div>
</body>
```

---

### That’s all you need for a clean, prototype-grade UI that still feels like **GlyphRunner**.
