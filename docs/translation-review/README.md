# Translation review packet (SEC-259)

Every word on the VX44 website, sign-in pages and back office was drafted in 7 languages by AI. Before launch, a native speaker of each language should read it. This folder has one file per language:

| File | Language |
| -- | -- |
| [es.md](es.md) | Spanish (US) |
| [fr.md](fr.md) | French |
| [pt.md](pt.md) | Portuguese (Brazil) |
| [zh.md](zh.md) | Chinese (Simplified) |
| [hi.md](hi.md) | Hindi |
| [ar.md](ar.md) | Arabic |
| [ru.md](ru.md) | Russian |

## How to review

1. Start with **Known concerns** at the top of your file, then the rows with something in the **Check** column:
   - *same as English*: possibly never translated;
   - *placeholders differ*: a `{name}` placeholder was dropped or renamed;
   - *empty* or *missing*.
2. Then read the rest, section by section. **Where** says which page or part of the app shows the string, so you can open it on www.vx44ai.com in your language and see it in context.
3. Write your suggestion in the **Reviewer note** column of a copy of the file (or in a document), with the key. A developer updates `src/i18n/` and regenerates the tables.

## Rules for translations

- **Placeholders:** keep every `{placeholder}` exactly, such as `{brand}` or `{count}`. Move it to wherever your language needs it, but don't translate or remove it.
- **Brand names:** keep VX44, VX44 AI Monitoring, Hikvision and Dahua as they are.
- **Camera labels:** keep camera labels and the alert card header in English (`AI ALERT · CAM 01`, `PERSON`). They are equipment print by design.
- **Placeholder values:** keep values in square brackets such as `[PRICE]` or `[RETENTION PERIOD]` untranslated. They are waiting for real values.
- **Tone:** address the reader politely and plainly: small-business owners, not engineers.
- **Legal pages:** the English version governs. The translations help understanding; a lawyer reviews the English (SEC-256).
- **Video provider:** never name the company that stores the video. Say "a trusted cloud video storage provider" or similar.

## Regenerating

```
npm run translations:export
```

This rebuilds every file here from `src/i18n/dictionaries`, `src/i18n/app` and `src/i18n/legal`, so it stays current as the site changes. It reads the files without running the app, and needs no build or keys. The known concerns live in `scripts/translation-concerns.mjs`.

The client portal's strings join the tables automatically once its pull request (#16) is merged.
