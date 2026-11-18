// Known translation concerns, shown at the top of each language's review file in
// docs/translation-review/. `find` is a phrase as it appears in the translation today: the export
// script lists every key that contains it, so the note keeps pointing at the right strings.
//
// Sources: the SEC-280 persona walkthroughs (Spanish and Arabic readers only) and the SEC-277 phone
// checks. These are AI observations, so a native speaker has the final word.
export const concerns = {
  es: [
    {
      find: "subencargado",
      note: "Unfamiliar to US Spanish readers. Consider “subprocesador” or a plain description (“un proveedor que guarda el video por nosotros”).",
    },
    {
      find: "demostración",
      note: "“demo” and “demostración” are both used across the site. Pick one and use it everywhere.",
    },
    {
      find: "Alertas de movimiento con IA",
      note: "Plan list item. The page promises not to flag every shadow, so “movement” alerts sound wrong. This is pricing copy: the wording is a decision for Amar (SEC-280 finding 10).",
    },
    {
      find: "en la entrada",
      note: "The alert line says “en la entrada” while the camera label beside it says FORECOURT (camera labels stay in English by design). Decide whether the event line should match the camera name.",
    },
  ],
  ar: [
    {
      find: "الذكاء الاصطناعي مباشرة",
      note: "The navigation link doesn’t read as the name of a page section.",
    },
    {
      find: "محوّل",
      note: "“Adapter” reads as a power converter here. Use the word customers would use for a small network box.",
    },
    {
      find: "الرئيسية",
      note: "Used as the label of the navigation landmark, but it usually means “home page”.",
    },
  ],
  ru: [
    {
      find: "Индивидуальная цена",
      note: "One long word that didn’t fit a 320 px phone screen until the layout was fixed (PR #19). A shorter label would read better on small phones.",
    },
  ],
};
