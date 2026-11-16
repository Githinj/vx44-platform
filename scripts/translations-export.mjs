// Builds the translation review packet in docs/translation-review/ (SEC-259): one Markdown file per
// language with every string side by side with its English source, plus where it appears.
//
//   npm run translations:export
//
// It reads the dictionary files with the TypeScript parser instead of running them, so it needs
// no build, no path aliases and no React. Sources:
//   - src/i18n/dictionaries/<locale>.ts  marketing site
//   - src/i18n/app/<locale>.ts           sign-in, back office (and portal, once merged)
//   - src/i18n/legal/<locale>.tsx        privacy policy and terms, as text blocks
// Known concerns for each language come from scripts/translation-concerns.mjs.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { concerns } from "./translation-concerns.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "translation-review");
const LANGUAGES = {
  es: "Spanish (US)",
  fr: "French",
  pt: "Portuguese (Brazil)",
  zh: "Chinese (Simplified)",
  hi: "Hindi",
  ar: "Arabic",
  ru: "Russian",
};

// ---------------------------------------------------------------------------
// Reading the files
// ---------------------------------------------------------------------------

function parse(file) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, kind);
}

function unwrap(node) {
  while (
    node &&
    (ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isTypeAssertionExpression(node))
  ) {
    node = node.expression;
  }
  return node;
}

function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text === "" ? '""' : name.text;
  }
  return name.getText();
}

// The dictionary is the first top-level `const x = { ... }` in the file.
function mainObject(source) {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const init = unwrap(declaration.initializer);
      if (init && ts.isObjectLiteralExpression(init)) return init;
    }
  }
  throw new Error(`No dictionary object found in ${source.fileName}`);
}

// Flattens an object literal into "a.b.c" → text. Arrays get numeric keys. Anything that isn't a
// plain string (a function, a variable) is shown as its code, so reviewers still see it.
function flatten(node, prefix, out) {
  node = unwrap(node);
  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (ts.isPropertyAssignment(property)) {
        flatten(property.initializer, join(prefix, propertyName(property.name)), out);
      } else if (property.name) {
        out.set(join(prefix, propertyName(property.name)), { code: property.getText() });
      }
    }
  } else if (ts.isArrayLiteralExpression(node)) {
    node.elements.forEach((element, index) => flatten(element, join(prefix, String(index)), out));
  } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    out.set(prefix, { text: node.text });
  } else {
    out.set(prefix, { code: node.getText() });
  }
  return out;
}

const join = (prefix, name) => (prefix ? `${prefix}.${name}` : name);

function readDictionary(file) {
  return flatten(mainObject(parse(file)), "", new Map());
}

// Legal pages are JSX. Each heading, paragraph and list item becomes one block of text; links and
// bold text keep their words, and expressions such as {placeholders.legalEntity} stay as code.
const BLOCKS = new Set(["h2", "h3", "p", "li"]);
const ENTITIES = { "&quot;": '"', "&apos;": "'", "&amp;": "&", "&nbsp;": " ", "&lt;": "<", "&gt;": ">" };

function tagName(element) {
  const opening = ts.isJsxElement(element) ? element.openingElement : element;
  return opening.tagName.getText();
}

function jsxText(node) {
  if (ts.isJsxText(node)) {
    return node.text.replace(/&[a-z]+;/g, (entity) => ENTITIES[entity] ?? entity);
  }
  if (ts.isJsxExpression(node)) {
    const expression = node.expression && unwrap(node.expression);
    if (!expression) return "";
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
    return `{${expression.getText()}}`;
  }
  if (ts.isJsxSelfClosingElement(node)) {
    const name = tagName(node);
    return name === "br" ? " / " : `<${name} />`;
  }
  if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
    return node.children.map(jsxText).join("");
  }
  return "";
}

function legalBlocks(file) {
  const source = parse(file);
  const pages = {};
  const visit = (node) => {
    if (ts.isPropertyAssignment(node) && ["privacy", "terms"].includes(propertyName(node.name))) {
      const blocks = [];
      const collect = (child) => {
        if ((ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) && BLOCKS.has(tagName(child))) {
          const text = jsxText(child).replace(/\s+/g, " ").trim();
          if (text) blocks.push({ tag: tagName(child), text });
          return;
        }
        ts.forEachChild(child, collect);
      };
      collect(node.initializer);
      pages[propertyName(node.name)] = blocks;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return pages;
}

// ---------------------------------------------------------------------------
// Where each string appears
// ---------------------------------------------------------------------------

// Longest matching prefix wins. Keys not listed fall back to their top-level section.
const MARKETING_PLACES = {
  meta: "Browser tab title and search results (every page)",
  common: "Shared: header, footer, phone menu, page chrome",
  nav: "Header section links and phone menu",
  footer: "Footer (every page)",
  home: "Home page / (hero and section headings)",
  "home.alert": "Home page: alert card over the hero footage",
  "home.how": "Home page: How it works",
  "home.live": "Home page: Live AI footage section",
  "home.features": "Home page: Features",
  "home.pricing": "Home page: Pricing card",
  "home.faq": "Home page: FAQ",
  "home.cta": "Home page: closing call to action",
  demo: "Book a demo page /demo",
  leadForm: "Demo request form on /demo",
  options: "Form choices (DVR brands, yes/no answers) on /demo and /check",
  check: "Camera check page /check",
  sales: "Talk to sales page /talk-to-sales",
  calendly: "Booking calendar box on /talk-to-sales and /demo",
  legal: "Privacy and Terms pages: headings and the translation notice",
  notFound: "404 page",
  errorPage: "Error page (when something breaks)",
};

const APP_PLACES = {
  meta: "Browser tab titles (sign-in, back office, portal)",
  common: "Shared: buttons, loading and saved messages",
  login: "Sign-in page /login",
  mfa: "Two-step verification pages",
  noAccess: "No-access page",
  nav: "Back office menu",
  status: "Status labels (leads, clients, sites, subscriptions)",
  dashboard: "Back office: dashboard /admin",
  leads: "Back office: leads inbox",
  clients: "Back office: clients list",
  client: "Back office: client page",
  plans: "Back office: plans",
  reconciliation: "Back office: reconciliation",
  activity: "Back office: activity log",
  errors: "Error messages shown after saving a form",
  notFound: "Sign-in and back office: 404 page",
  errorPage: "Sign-in and back office: error page",
  // The client portal's sections, once PR #16 is merged.
  portal: "Client portal",
  account: "Client portal: account page",
  support: "Client portal: support",
  emails: "Emails sent by the app",
};

function place(key, places) {
  const parts = key.split(".");
  for (let length = parts.length; length > 0; length--) {
    const prefix = parts.slice(0, length).join(".");
    if (places[prefix]) return places[prefix];
  }
  return `Section “${parts[0]}”`;
}

// ---------------------------------------------------------------------------
// Checks a reviewer should see first
// ---------------------------------------------------------------------------

const placeholdersOf = (text) => [...text.matchAll(/\{[a-zA-Z]+\}/g)].map((match) => match[0]).sort().join(" ");

// Names that stay the same in every language, so "same as English" isn't worth flagging.
const KEEP_AS_IS = new Set(["Hikvision", "Dahua", "Stripe", "VX44", "VX44 AI Monitoring"]);

function flags(english, translation) {
  const out = [];
  if (english.text !== undefined && translation.text !== undefined) {
    if (!translation.text.trim() && english.text.trim()) out.push("empty");
    if (placeholdersOf(english.text) !== placeholdersOf(translation.text)) out.push("placeholders differ");
    if (
      translation.text === english.text &&
      !KEEP_AS_IS.has(english.text) &&
      /[a-z]{3}/i.test(english.text) &&
      english.text.length > 3
    ) {
      out.push("same as English");
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

const cell = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .trim();

const show = (entry) => (!entry ? "" : entry.text !== undefined ? entry.text : `\`${entry.code}\``);

function dictionaryTable(english, translated, places) {
  const rows = ["| Key | Where | English | Translation | Check | Reviewer note |", "| -- | -- | -- | -- | -- | -- |"];
  let flagged = 0;
  for (const [key, source] of english) {
    const target = translated.get(key);
    const checks = target ? flags(source, target) : ["missing"];
    if (checks.length) flagged++;
    rows.push(
      `| \`${cell(key)}\` | ${cell(place(key, places))} | ${cell(show(source))} | ${cell(show(target))} | ${cell(checks.join(", "))} |  |`,
    );
  }
  return { table: rows.join("\n"), flagged, count: english.size };
}

function legalTable(englishBlocks, translatedBlocks, page) {
  const rows = ["| # | Block | English | Translation | Reviewer note |", "| -- | -- | -- | -- | -- |"];
  const length = Math.max(englishBlocks.length, translatedBlocks.length);
  for (let index = 0; index < length; index++) {
    const source = englishBlocks[index];
    const target = translatedBlocks[index];
    rows.push(`| ${page}.${index + 1} | ${source?.tag ?? target?.tag ?? ""} | ${cell(source?.text)} | ${cell(target?.text)} |  |`);
  }
  const note =
    englishBlocks.length === translatedBlocks.length
      ? ""
      : `\n\n> **Structure differs:** ${englishBlocks.length} English blocks against ${translatedBlocks.length} translated. Rows are paired by position, so check the rows after the first mismatch with care.`;
  return rows.join("\n") + note;
}

function concernList(locale, dictionaries) {
  const items = concerns[locale] ?? [];
  if (items.length === 0) {
    return "No language-specific concerns were reported in the persona walkthroughs (only Spanish and Arabic readers were simulated). Start with the rows flagged in the **Check** column.";
  }
  return items
    .map(({ find, note }) => {
      const keys = [];
      for (const [label, map] of dictionaries) {
        for (const [key, entry] of map) {
          if (entry.text?.includes(find)) keys.push(`${label} \`${key}\``);
        }
      }
      const where = keys.length ? keys.join(", ") : "text not found any more (it may have been changed)";
      return `- **“${find}”**: ${note}\n  Found in: ${where}`;
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const englishMarketing = readDictionary("src/i18n/dictionaries/en.ts");
const englishApp = readDictionary("src/i18n/app/en.ts");
const englishLegal = legalBlocks("src/i18n/legal/en.tsx");

mkdirSync(OUT_DIR, { recursive: true });

const summary = [];
for (const [locale, language] of Object.entries(LANGUAGES)) {
  const marketing = readDictionary(`src/i18n/dictionaries/${locale}.ts`);
  const app = readDictionary(`src/i18n/app/${locale}.ts`);
  const legal = legalBlocks(`src/i18n/legal/${locale}.tsx`);

  const site = dictionaryTable(englishMarketing, marketing, MARKETING_PLACES);
  const appTable = dictionaryTable(englishApp, app, APP_PLACES);

  const markdown = `# Translation review: ${language} (\`${locale}\`)

Generated by \`npm run translations:export\` from the dictionaries in \`src/i18n/\`. **Don't edit the tables here:** write corrections in the *Reviewer note* column of a copy, or straight into \`src/i18n/\`, then re-run the script. See [README.md](README.md) for how to review.

All ${language} text was drafted by AI and needs a native speaker's review before launch (SEC-259). The English version governs the legal pages.

## Known concerns

${concernList(locale, [["site", marketing], ["app", app]])}

## Website (${site.count} strings, ${site.flagged} flagged)

${site.table}

## Sign-in and back office (${appTable.count} strings, ${appTable.flagged} flagged)

${appTable.table}

## Privacy policy

${legalTable(englishLegal.privacy ?? [], legal.privacy ?? [], "privacy")}

## Terms

${legalTable(englishLegal.terms ?? [], legal.terms ?? [], "terms")}
`;
  writeFileSync(path.join(OUT_DIR, `${locale}.md`), markdown);
  summary.push(`${locale}: ${site.count + appTable.count} strings, ${site.flagged + appTable.flagged} flagged`);
}

console.log(`Wrote ${Object.keys(LANGUAGES).length} files to docs/translation-review/\n${summary.join("\n")}`);
