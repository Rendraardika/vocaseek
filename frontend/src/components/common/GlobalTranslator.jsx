import { useEffect } from "react";
import { getSavedLanguage } from "../../utils/languagePreference";
import { normalizeTranslatableText, translatePhrase } from "../../i18n/phrases";

const textNodeOriginalMap = new WeakMap();
const attributeOriginalMap = new WeakMap();
const untranslatedTexts = new Set();
const NON_TRANSLATABLE_EXACT_TEXTS = new Set([
  "id",
  "en",
  "google",
  "vocaseek",
  "vokaseek",
  "vokasik",
  "est. 2026",
]);

function shouldSkipNode(parentElement) {
  if (!parentElement) {
    return true;
  }

  const tagName = parentElement.tagName;
  return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(tagName);
}

function preserveSpacing(originalText, translatedText) {
  const leading = originalText.match(/^\s*/)?.[0] || "";
  const trailing = originalText.match(/\s*$/)?.[0] || "";
  return `${leading}${translatedText}${trailing}`;
}

function resolveTextSource(currentText) {
  const storedText = textNodeOriginalMap.get(currentText.node);
  const visibleText = currentText.value;

  if (!storedText) {
    return visibleText;
  }

  const normalizedVisible = normalizeTranslatableText(visibleText);
  const knownTranslations = [
    storedText,
    translatePhrase(storedText, "id"),
    translatePhrase(storedText, "en"),
  ]
    .filter(Boolean)
    .map((text) => normalizeTranslatableText(text));

  return knownTranslations.includes(normalizedVisible) ? storedText : visibleText;
}

function isLikelyDynamicText(normalizedText) {
  const lowerText = normalizedText.toLowerCase();

  return (
    NON_TRANSLATABLE_EXACT_TEXTS.has(lowerText) ||
    normalizedText.includes("@") ||
    /^https?:\/\//i.test(normalizedText) ||
    /^[+\d\s().-]+$/.test(normalizedText) ||
    /^[\d\s.,:/-]+$/.test(normalizedText) ||
    /^[\u2022*]+$/.test(normalizedText) ||
    /^[a-z]{2}$/i.test(normalizedText) ||
    /(?:\u00a9|\(c\)|all rights reserved)/i.test(normalizedText)
  );
}

function shouldReportMissingTranslation(text, context = {}) {
  const normalized = normalizeTranslatableText(text);

  if (!normalized || untranslatedTexts.has(normalized)) {
    return false;
  }

  if (context.attributeName === "value" && context.element?.tagName === "INPUT") {
    return false;
  }

  return !isLikelyDynamicText(normalized);
}

function reportMissingTranslation(text, context) {
  if (!import.meta.env.DEV) {
    return;
  }

  const normalized = normalizeTranslatableText(text);

  if (!shouldReportMissingTranslation(normalized, context)) {
    return;
  }

  untranslatedTexts.add(normalized);
  console.warn(`[i18n] Missing translation: ${normalized}`);
}

function translateTextNodes(root, locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent?.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      if (shouldSkipNode(node.parentElement)) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode();

  while (currentNode) {
    const currentText = currentNode.textContent ?? "";
    const originalText = resolveTextSource({
      node: currentNode,
      value: currentText,
    });

    const translatedText = translatePhrase(originalText, locale);

    if (translatedText) {
      textNodeOriginalMap.set(currentNode, originalText);
      currentNode.textContent = preserveSpacing(originalText, translatedText);
    } else {
      textNodeOriginalMap.delete(currentNode);
      reportMissingTranslation(originalText);
      currentNode.textContent = currentText;
    }

    currentNode = walker.nextNode();
  }
}

function translateAttributes(root, locale) {
  const elements = [root, ...root.querySelectorAll("*")];
  const attributeNames = ["placeholder", "title", "aria-label", "value"];

  elements.forEach((element) => {
    attributeNames.forEach((attributeName) => {
      const attributeValue = element.getAttribute(attributeName);
      if (!attributeValue) {
        return;
      }

      if (attributeName === "value" && !["BUTTON", "INPUT"].includes(element.tagName)) {
        return;
      }

      const originalAttributes = attributeOriginalMap.get(element) || {};
      if (!originalAttributes[attributeName]) {
        originalAttributes[attributeName] = attributeValue;
        attributeOriginalMap.set(element, originalAttributes);
      }

      const translatedText = translatePhrase(originalAttributes[attributeName], locale);
      if (!translatedText) {
        reportMissingTranslation(originalAttributes[attributeName], {
          attributeName,
          element,
        });
      }
      element.setAttribute(attributeName, translatedText || originalAttributes[attributeName]);
    });
  });
}

function applyGlobalTranslations(locale) {
  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  translateTextNodes(root, locale);
  translateAttributes(root, locale);
}

export default function GlobalTranslator() {
  useEffect(() => {
    let animationFrameId = 0;

    const translate = () => {
      const locale = normalizeTranslatableText(getSavedLanguage()) || "id";
      applyGlobalTranslations(locale === "en" ? "en" : "id");
    };

    const scheduleTranslate = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(translate);
    };

    const observer = new MutationObserver(() => {
      scheduleTranslate();
    });

    const root = document.getElementById("root");
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    scheduleTranslate();
    window.addEventListener("language-changed", scheduleTranslate);
    window.addEventListener("auth-changed", scheduleTranslate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("language-changed", scheduleTranslate);
      window.removeEventListener("auth-changed", scheduleTranslate);
    };
  }, []);

  return null;
}
