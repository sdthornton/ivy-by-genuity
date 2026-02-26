// src/utils/typewriter.js

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(t);
        signal.removeEventListener("abort", onAbort);
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// elementContentRef assumes the element is an input or textarea. Pass 'innerHTML' for other elements.
const typeCharacter = async (
  element,
  char,
  elementContentRef = "value",
  { minDelay = 0, maxDelay = 3, onUpdate, signal } = {}
) => {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  await sleep(rand(minDelay, maxDelay), signal);
  element[elementContentRef] += char;

  if (typeof onUpdate === "function") {
    onUpdate({ element, char });
  }
};

// Types *exactly* the text provided (no re-splitting into words), so spacing matches the source.
const typewriterText = async (
  element,
  text,
  elementContentRef = "value",
  {
    startDelay = 150,
    minDelay = 0,
    maxDelay = 3,
    onUpdate,
    signal,
  } = {}
) => {
  if (startDelay) await sleep(startDelay, signal);

  for (let i = 0; i < text.length; i++) {
    await typeCharacter(element, text[i], elementContentRef, {
      minDelay,
      maxDelay,
      onUpdate,
      signal,
    });

    // Optional tiny pause after whitespace to make it feel more human
    if (/\s/.test(text[i])) {
      await sleep(rand(0, 6), signal);
    }
  }
};

const copyAttributes = (fromEl, toEl) => {
  // keep it minimal & safe: class + basic attrs
  for (const attr of Array.from(fromEl.attributes || [])) {
    // Skip inline event handlers
    if (/^on/i.test(attr.name)) continue;
    toEl.setAttribute(attr.name, attr.value);
  }
};

const runTypewriterPerTag = async (element, markup, options) => {
  const container = document.createElement("div");
  container.innerHTML = markup;

  // Inputs/textareas: strip markup and type plain text
  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    const stripped = container.textContent || container.innerText || "";
    await typewriterText(element, stripped, "value", options);
    return;
  }

  for (const node of Array.from(container.childNodes)) {
    if (options?.signal?.aborted) throw new DOMException("Aborted", "AbortError");

    if (node.nodeType === Node.TEXT_NODE) {
      // Type text exactly, preserving whitespace
      await typewriterText(element, node.textContent || "", "innerHTML", {
        ...options,
        startDelay: 0,
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const newElement = document.createElement(node.nodeName.toLowerCase());
      copyAttributes(node, newElement);
      element.appendChild(newElement);

      // If it’s a void/self-closing tag (img/br/hr/etc), no inner typing needed
      if (!node.childNodes || node.childNodes.length === 0) {
        if (typeof options?.onUpdate === "function") options.onUpdate({ element: newElement, char: "" });
        continue;
      }

      await runTypewriterPerTag(newElement, node.innerHTML, options);
    }
  }
};

/**
 * Typewriter markup into element, preserving tag structure.
 *
 * @param {HTMLElement} element
 * @param {string} markup
 * @param {Object} options
 * @param {boolean} [options.clearElementFirst=false]
 * @param {number} [options.startDelay=150]
 * @param {number} [options.minDelay=0]
 * @param {number} [options.maxDelay=3]
 * @param {(info: {element: HTMLElement, char: string}) => void} [options.onUpdate]
 * @param {AbortSignal} [options.signal]
 */
const typewriter = async (element, markup, options = {}) => {
  const {
    clearElementFirst = false,
    startDelay = 150,
    minDelay = 0,
    maxDelay = 3,
    onUpdate,
    signal,
  } = options;

  if (clearElementFirst) {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") element.value = "";
    else element.innerHTML = "";
  }

  await runTypewriterPerTag(element, markup, {
    startDelay,
    minDelay,
    maxDelay,
    onUpdate,
    signal,
  });
};

export default typewriter;
