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
const toNonNegativeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};
const DEFAULT_TIMING = {
  startDelay: 150,
  minDelay: 0,
  maxDelay: 3,
  whitespaceMinDelay: 0,
  whitespaceMaxDelay: 6,
};

const getSpeedFactor = (speed) => {
  if (typeof speed === "number" && Number.isFinite(speed) && speed > 0) {
    return speed;
  }

  return 1;
};

const applySpeedFactor = (timing, speedFactor) => {
  if (speedFactor === 1) {
    return timing;
  }

  return {
    startDelay: Math.round(timing.startDelay / speedFactor),
    minDelay: Math.round(timing.minDelay / speedFactor),
    maxDelay: Math.round(timing.maxDelay / speedFactor),
    whitespaceMinDelay: Math.round(timing.whitespaceMinDelay / speedFactor),
    whitespaceMaxDelay: Math.round(timing.whitespaceMaxDelay / speedFactor),
  };
};

const normalizeTimingRange = (timing) => {
  const minDelay = toNonNegativeNumber(timing.minDelay, 0);
  const maxDelay = Math.max(minDelay, toNonNegativeNumber(timing.maxDelay, minDelay));
  const whitespaceMinDelay = toNonNegativeNumber(timing.whitespaceMinDelay, 0);
  const whitespaceMaxDelay = Math.max(
    whitespaceMinDelay,
    toNonNegativeNumber(timing.whitespaceMaxDelay, whitespaceMinDelay),
  );

  return {
    startDelay: toNonNegativeNumber(timing.startDelay, 0),
    minDelay,
    maxDelay,
    whitespaceMinDelay,
    whitespaceMaxDelay,
  };
};

const resolveTimingOptions = ({ timing = {}, speed = 1 } = {}) => {
  const mergedTiming = {
    ...DEFAULT_TIMING,
    ...timing,
  };
  const speedFactor = getSpeedFactor(speed);
  const scaledTiming = applySpeedFactor(mergedTiming, speedFactor);
  return normalizeTimingRange(scaledTiming);
};

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
    minDelay = 0,
    maxDelay = 3,
    whitespaceMinDelay = 0,
    whitespaceMaxDelay = 6,
    onUpdate,
    signal,
  } = {}
) => {
  for (let i = 0; i < text.length; i++) {
    await typeCharacter(element, text[i], elementContentRef, {
      minDelay,
      maxDelay,
      onUpdate,
      signal,
    });

    // Optional tiny pause after whitespace to make it feel more human
    if (/\s/.test(text[i])) {
      await sleep(rand(whitespaceMinDelay, whitespaceMaxDelay), signal);
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
      await typewriterText(element, node.textContent || "", "innerHTML", options);
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
 * @param {number} [options.speed=1] Numeric multiplier (2 = faster, 0.5 = slower).
 * @param {Object} [options.timing] Optional timing overrides.
 * @param {number} [options.timing.startDelay]
 * @param {number} [options.timing.minDelay]
 * @param {number} [options.timing.maxDelay]
 * @param {number} [options.timing.whitespaceMinDelay]
 * @param {number} [options.timing.whitespaceMaxDelay]
 * @param {(info: {element: HTMLElement, char: string}) => void} [options.onUpdate]
 * @param {AbortSignal} [options.signal]
 */
const typewriter = async (element, markup, options = {}) => {
  const {
    clearElementFirst = false,
    onUpdate,
    signal,
  } = options;
  const timing = resolveTimingOptions(options);

  if (clearElementFirst) {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") element.value = "";
    else element.innerHTML = "";
  }

  if (timing.startDelay > 0) {
    await sleep(timing.startDelay, signal);
  }

  await runTypewriterPerTag(element, markup, {
    ...timing,
    onUpdate,
    signal,
  });
};

export default typewriter;
