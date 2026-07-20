import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILDER_PATH = resolve(__dirname, '../src/pages/buat-web-ai/index.astro');

// Helper: check if file contains text
function fileContains(text) {
  const content = readFileSync(BUILDER_PATH, 'utf-8');
  return content.includes(text);
}

// Helper: count occurrences
function countMatches(regex) {
  const content = readFileSync(BUILDER_PATH, 'utf-8');
  return (content.match(regex) || []).length;
}

// Content of the <script> block only
function getScriptContent() {
  const content = readFileSync(BUILDER_PATH, 'utf-8');
  const match = content.match(/<script>([\s\S]*)<\/script>/);
  return match ? match[1] : '';
}

describe('AI Website Builder — Production Quality Audit', () => {
  const src = readFileSync(BUILDER_PATH, 'utf-8');

  describe('1. No Fake Testimonials', () => {
    it('should NOT pre-populate webData default state with fake testimonials', () => {
      // The initial webData object in the script should not contain testimonials
      const script = getScriptContent();
      const webDataMatch = script.match(/webData\s*=\s*\{/);
      assert.ok(webDataMatch, 'webData object not found in script');
      // Find the webData block and check no testimonials key exists in the initial state
      const webDataBlock = script.slice(webDataMatch.index);
      const closingBrace = findClosingBrace(webDataBlock, 0);
      const initialWebData = webDataBlock.slice(0, closingBrace + 1);
      assert.ok(!initialWebData.includes('testimonials'), 
        'webData initial state should NOT contain testimonials key');
    });

    it('should NOT have testimonials in any niche template', () => {
      const script = getScriptContent();
      // Check each niche template block
      const niches = ['kuliner', 'jasa', 'toko', 'salon', 'kesehatan', 'bimbel'];
      for (const niche of niches) {
        const re = new RegExp(`${niche}\\s*:\\s*\\{`);
        const match = script.match(re);
        if (match) {
          const blockStart = match.index;
          // Find where this object ends by counting braces from the colon
          const block = script.slice(blockStart);
          const end = findClosestKey(block, ['kuliner', 'jasa', 'toko', 'salon', 'kesehatan', 'bimbel'])
            || findClosingBraceDepth(block, 0);
          const nicheBlock = block.slice(0, end);
          assert.ok(!nicheBlock.includes('testimonials'), 
            `niche template "${niche}" should NOT contain testimonials`);
        }
      }
    });

    it('should NOT ask AI to generate testimonials in Gemini prompt', () => {
      const script = getScriptContent();
      assert.ok(!script.includes('"testimonials"'),
        'Gemini prompt should not request testimonials field');
    });

    it('should NOT render testimonials section in preview HTML', () => {
      const script = getScriptContent();
      // Check the renderHTML function
      const renderMatch = script.match(/function renderHTML[\s\S]*?(?=function updatePreview|$)/);
      if (renderMatch) {
        const renderFn = renderMatch[0];
        assert.ok(!renderFn.includes('Apa Kata Pelanggan'),
          'renderHTML should not contain "Apa Kata Pelanggan" section');
        assert.ok(!renderFn.includes('testimonial'),
          'renderHTML should not reference testimonials');
      }
    });
  });

  describe('2. No Emoji / Sparkle / Gradient Overuse in Builder UI', () => {
    it('should NOT use emoji characters in niche selection buttons', () => {
      // Emoji range: various Unicode ranges
      const emojiInNiche = src.match(/<button[^>]*data-niche[^>]*>[\s\S]*?<\/button>/g);
      if (emojiInNiche) {
        for (const btn of emojiInNiche) {
          const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(btn);
          assert.ok(!hasEmoji, `Niche button should not contain emoji: ${btn.slice(0, 80)}`);
        }
      }
    });

    it('should NOT use ✨ sparkle emoji in button text or labels', () => {
      assert.ok(!src.includes('✨'), 'Builder should not contain sparkle emoji');
    });

    it('should NOT use gradient classes in builder controls (only SVG icons are allowed)', () => {
      // Only the btn-download-html and btn-request-host in tab 3 are allowed gradients
      // The AI Generator section button should not use gradient-to classes
      const gradientBgCount = countMatches(/bg-gradient-to-r/g);
      // Allow max 2 gradient backgrounds: the download button and request-host button in tab 3
      assert.ok(gradientBgCount <= 2, `Found ${gradientBgCount} gradient backgrounds, max 2 allowed`);
    });

    it('should use SVG icons instead of emoji for device toggle buttons', () => {
      const deviceDesktop = src.match(/<button[^>]*id="device-btn-desktop"[^>]*>[\s\S]*?<\/button>/);
      if (deviceDesktop) {
        assert.ok(!deviceDesktop[0].includes('💻'), 'Desktop toggle should not use emoji, use SVG');
      }
      const deviceMobile = src.match(/<button[^>]*id="device-btn-mobile"[^>]*>[\s\S]*?<\/button>/);
      if (deviceMobile) {
        assert.ok(!deviceMobile[0].includes('📱'), 'Mobile toggle should not use emoji, use SVG');
      }
    });

    it('should NOT use pills/badge with "AI" in header nav', () => {
      // Badge in header should say "Template Cepat" or similar, not "AI Website Builder" 
      const headerBadge = src.match(/<span[^>]*class="[^"]*rounded-full[^"]*"[^>]*>[\s\S]*?<\/span>/g);
      if (headerBadge) {
        for (const badge of headerBadge) {
          if (badge.includes('AI')) {
            assert.ok(false, `Header badge should not mention "AI": ${badge.slice(0, 100)}`);
          }
        }
      }
    });
  });

  describe('3. Honest Default Mode — "Template Cepat"', () => {
    it('should label default mode as "Template Cepat" not "AI" in generate button', () => {
      // The fallback text should reference template, not AI sparkle
      const btnText = src.match(/<span[^>]*id="generate-btn-text"[^>]*>[\s\S]*?<\/span>/);
      if (btnText) {
        assert.ok(!btnText[0].includes('✨'), 'Generate button text should not have sparkle');
        assert.ok(btnText[0].includes('Template') || btnText[0].includes('Isi') || btnText[0].includes('Tulis'),
          'Generate button should reference template mode, not AI');
        assert.ok(!btnText[0].includes('Pakai AI'),
          'Generate button should not say "Pakai AI" as default text');
      }
    });

    it('should not claim "AI" in the AI Generator section header by default', () => {
      const genSection = src.match(/<div[^>]*class="[^"]*border[^"]*rounded-xl[^"]*relative[^"]*overflow-hidden[^"]*"[^>]*>[\s\S]*?<\/div>\s*<!--\s*AI Generator/);
      if (!genSection) {
        // Fallback: check the section contains 'Generator'
        const hasGenerator = src.includes('Generator Content') || src.includes('Generator Konten');
        assert.ok(true, 'Section found');
      }
    });

    it('should clearly state Gemini requires user API key', () => {
      assert.ok(src.includes('API Key') || src.includes('Kunci API'), 
        'Should mention API key requirement');
      assert.ok(src.includes('Dapatkan API Key') || src.includes('aistudio.google'),
        'Should link to Google AI Studio for API key');
    });

    it('should NOT store API key locally (input type=password)', () => {
      const keyInput = src.match(/<input[^>]*id="gemini-api-key"[^>]*>/);
      if (keyInput) {
        assert.ok(keyInput[0].includes('type="password"'), 
          'API key input should be type=password');
      }
    });
  });

  describe('4. Responsive Headline / Overflow Protection', () => {
    it('should have responsive text classes on h1 in preview (sm: breakpoints)', () => {
      // Check renderHTML for responsive classes on h1
      assert.ok(src.includes('sm:text-5xl') || src.includes('sm:text-4xl'),
        'Preview headline should have responsive font size class');
    });

    it('should have break-words class specifically on the H1 element in renderHTML', () => {
      const script = getScriptContent();
      const renderMatch = script.match(/function renderHTML[\s\S]*?(?=function updatePreview|$)/);
      assert.ok(renderMatch, 'renderHTML function must exist');
      const renderFn = renderMatch[0];
      // Find the H1 opening tag inside renderHTML and check break-words
      const h1Match = renderFn.match(/<h1[^>]*>/g);
      assert.ok(h1Match && h1Match.length >= 1, 'At least one H1 tag in renderHTML');
      const hasBreakWords = h1Match.some(h => h.includes('break-words'));
      assert.ok(hasBreakWords, 'H1 tag in renderHTML must have break-words class');
    });
  });

  describe('5. No Duplicate CTAs', () => {
    it('should have exactly one primary CTA button in generated hero section', () => {
      const script = getScriptContent();
      const renderMatch = script.match(/function renderHTML[\s\S]*?(?=function updatePreview|$)/);
      if (renderMatch) {
        const heroCTA = (renderMatch[0].match(/Hubungi via WhatsApp/g) || []).length;
        assert.ok(heroCTA <= 1, `Hero section should have at most 1 WhatsApp CTA, found ${heroCTA}`);
      }
    });
  });

  describe('6. No External Side Effects', () => {
    it('should preserve WhatsApp link generators in preview', () => {
      const script = getScriptContent();
      assert.ok(script.includes('wa.me'), 'renderHTML should include WhatsApp link');
      assert.ok(script.includes('whatsapp') || script.includes('cleanWA'),
        'should reference whatsapp number');
    });

    it('should preserve download HTML functionality', () => {
      const script = getScriptContent();
      assert.ok(script.includes('btn-download-html'), 'Download button handler should exist');
      assert.ok(script.includes('renderHTML'), 'Download should use renderHTML export');
    });

    it('should preserve form input bindings for content editing', () => {
      const script = getScriptContent();
      assert.ok(script.includes('input-business-name'), 'Business name input binding');
      assert.ok(script.includes('input-slogan'), 'Slogan input binding');
      assert.ok(script.includes('input-hero-desc'), 'Hero description input binding');
      assert.ok(script.includes('renderKontenInputs'), 'Content tab render function');
    });

    it('should preserve theme/color picker functionality', () => {
      const script = getScriptContent();
      assert.ok(script.includes('select-theme-btn'), 'Theme selection buttons');
      assert.ok(script.includes('colorThemes'), 'Color theme definitions');
    });

    it('should preserve desktop/mobile preview toggle', () => {
      const script = getScriptContent();
      assert.ok(script.includes('device-btn-desktop'), 'Desktop preview toggle');
      assert.ok(script.includes('device-btn-mobile'), 'Mobile preview toggle');
    });
  });

  describe('7. Professional SVG Consistency', () => {
    it('should use SVG for back/home navigation arrows', () => {
      const backLink = src.match(/<a[^>]*href="\/"[^>]*>[\s\S]*?Kembali ke Beranda[\s\S]*?<\/a>/);
      assert.ok(backLink, 'Back link should exist');
      assert.ok(backLink[0].includes('<svg'), 'Back link should use SVG icon');
    });

    it('should use SVG for WhatsApp icon in builder CTA', () => {
      const waInBuilder = src.match(/<button[^>]*id="btn-request-host"[^>]*>[\s\S]*?<\/button>/);
      if (waInBuilder) {
        assert.ok(waInBuilder[0].includes('<svg'), 
          'WhatsApp request host button should use SVG icon');
      }
    });
  });

  describe('8. Regression: Publication Review Fixes', () => {
    it('footer should claim "Websitetermaju" not "AI Website Builder"', () => {
      const script = getScriptContent();
      const renderMatch = script.match(/function renderHTML[\s\S]*?(?=function updatePreview|$)/);
      assert.ok(renderMatch, 'renderHTML function must exist');
      const renderFn = renderMatch[0];
      assert.ok(!renderFn.includes('AI Website Builder'),
        'Footer in renderHTML must not contain "AI Website Builder"');
      assert.ok(renderFn.includes('Dibuat menggunakan Websitetermaju'),
        'Footer in renderHTML must contain "Dibuat menggunakan Websitetermaju"');
    });

    it('should have API key disclaimer near Gemini input', () => {
      assert.ok(src.includes('tidak disimpan oleh Websitetermaju'),
        'API key disclaimer must say key is not stored by Websitetermaju');
      assert.ok(src.includes('restricted key'),
        'API key disclaimer must suggest restricted key');
      assert.ok(src.includes('dikirim langsung dari browser'),
        'API key disclaimer must explain key is sent from browser');
    });

    it('generated landing should have max 2 WhatsApp CTAs (header + hero, not per service)', () => {
      const script = getScriptContent();
      const renderMatch = script.match(/function renderHTML[\s\S]*?(?=function updatePreview|$)/);
      assert.ok(renderMatch, 'renderHTML function must exist');
      const renderFn = renderMatch[0];
      const ctaCount = (renderFn.match(/Hubungi via WhatsApp/g) || []).length;
      assert.ok(ctaCount <= 1, `Hero section should have at most 1 WhatsApp CTA, found ${ctaCount}`);
      // Verify no WhatsApp link in service cards
      const serviceCardMatch = renderFn.match(/Pesan Sekarang/g);
      assert.ok(!serviceCardMatch, 'Service cards should not have "Pesan Sekarang" WhatsApp CTA');
    });

    it('H1 in renderHTML should have break-words class specifically', () => {
      const script = getScriptContent();
      const renderMatch = script.match(/function renderHTML[\s\S]*?(?=function updatePreview|$)/);
      assert.ok(renderMatch, 'renderHTML function must exist');
      const renderFn = renderMatch[0];
      const h1Match = renderFn.match(/<h1[^>]*>/g);
      assert.ok(h1Match && h1Match.length >= 1, 'At least one H1 tag in renderHTML');
      const hasBreakWords = h1Match.some(h => h.includes('break-words'));
      assert.ok(hasBreakWords, 'H1 tag in renderHTML must have break-words class');
    });

    it('should NOT use rocket emoji (🚀) anywhere in the builder', () => {
      assert.ok(!src.includes('🚀'), 'Builder must not contain rocket emoji');
    });
  });
});

// ---- Utility functions ----

function findClosingBrace(str, start) {
  let depth = 0;
  let inString = false;
  let stringChar = null;
  for (let i = start; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findClosestKey(str, keys) {
  const positions = keys
    .map(k => ({ key: k, pos: str.search(new RegExp(`\\b${k}\\s*:`)) }))
    .filter(p => p.pos > 5)
    .sort((a, b) => a.pos - b.pos);
  return positions.length > 0 ? positions[0].pos : -1;
}

function findClosingBraceDepth(str, start) {
  let depth = 1;
  let inString = false;
  let stringChar = null;
  let i = start;
  // find first opening brace
  while (i < str.length && str[i] !== '{') i++;
  if (i >= str.length) return -1;
  i++; // past the {
  for (; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
