/* Generated from categories.json by generate_categories.py. Works with file:// previews. */
(() => {
  const categories = [
  {
    "id": "application-management",
    "name": "Application Management",
    "family": "zinc",
    "colors": {
      "text": {
        "hex": "#696986",
        "token": "--ivy-color-zinc-500"
      },
      "border": {
        "hex": "#E6E6EA",
        "token": "--ivy-color-zinc-100"
      },
      "background": {
        "hex": "#F8F8F9",
        "token": "--ivy-color-zinc-25"
      }
    }
  },
  {
    "id": "backup-recovery",
    "name": "Backup & Recovery",
    "family": "orange",
    "colors": {
      "text": {
        "hex": "#FB6514",
        "token": "--ivy-color-orange-500"
      },
      "border": {
        "hex": "#FFEAD5",
        "token": "--ivy-color-orange-100"
      },
      "background": {
        "hex": "#FFFAF5",
        "token": "--ivy-color-orange-25"
      }
    }
  },
  {
    "id": "collaboration",
    "name": "Collaboration",
    "family": "bluegray",
    "colors": {
      "text": {
        "hex": "#4E5BA6",
        "token": "--ivy-color-bluegray-500"
      },
      "border": {
        "hex": "#EAECF5",
        "token": "--ivy-color-bluegray-100"
      },
      "background": {
        "hex": "#FCFCFD",
        "token": "--ivy-color-bluegray-25"
      }
    }
  },
  {
    "id": "dns-web-security",
    "name": "DNS / Web Security",
    "family": "coral",
    "colors": {
      "text": {
        "hex": "#DA3616",
        "token": "--ivy-color-coral-500"
      },
      "border": {
        "hex": "#F5E0DB",
        "token": "--ivy-color-coral-100"
      },
      "background": {
        "hex": "#FCF7F6",
        "token": "--ivy-color-coral-25"
      }
    }
  },
  {
    "id": "email-security",
    "name": "Email Security",
    "family": "success",
    "colors": {
      "text": {
        "hex": "#12B76A",
        "token": "--ivy-color-success-500"
      },
      "border": {
        "hex": "#D1FADF",
        "token": "--ivy-color-success-100"
      },
      "background": {
        "hex": "#F6FEF9",
        "token": "--ivy-color-success-25"
      }
    }
  },
  {
    "id": "endpoint-management",
    "name": "Endpoint Management",
    "family": "midnight",
    "colors": {
      "text": {
        "hex": "#4262AE",
        "token": "--ivy-color-midnight-500"
      },
      "border": {
        "hex": "#E1E5EF",
        "token": "--ivy-color-midnight-100"
      },
      "background": {
        "hex": "#F7F8FA",
        "token": "--ivy-color-midnight-25"
      }
    }
  },
  {
    "id": "endpoint-security",
    "name": "Endpoint Security",
    "family": "error",
    "colors": {
      "text": {
        "hex": "#F04438",
        "token": "--ivy-color-error-500"
      },
      "border": {
        "hex": "#FEE4E2",
        "token": "--ivy-color-error-100"
      },
      "background": {
        "hex": "#FFFBFA",
        "token": "--ivy-color-error-25"
      }
    }
  },
  {
    "id": "governance-policy",
    "name": "Governance & Policy",
    "family": "brand",
    "colors": {
      "text": {
        "hex": "#465FFF",
        "token": "--ivy-color-primary"
      },
      "border": {
        "hex": "#DDE9FF",
        "token": "--ivy-color-brand-100"
      },
      "background": {
        "hex": "#F2F7FF",
        "token": "--ivy-color-brand-25"
      }
    }
  },
  {
    "id": "human-risk",
    "name": "Human Risk",
    "family": "pink",
    "colors": {
      "text": {
        "hex": "#EE46BC",
        "token": "--ivy-color-pink-500"
      },
      "border": {
        "hex": "#FCE7F6",
        "token": "--ivy-color-pink-100"
      },
      "background": {
        "hex": "#FEF6FB",
        "token": "--ivy-color-pink-25"
      }
    }
  },
  {
    "id": "identity",
    "name": "Identity",
    "family": "purple",
    "colors": {
      "text": {
        "hex": "#7A5AF8",
        "token": "--ivy-color-purple-500"
      },
      "border": {
        "hex": "#EBE9FE",
        "token": "--ivy-color-purple-100"
      },
      "background": {
        "hex": "#FAFAFF",
        "token": "--ivy-color-purple-25"
      }
    }
  },
  {
    "id": "network",
    "name": "Network",
    "family": "warning",
    "colors": {
      "text": {
        "hex": "#F79009",
        "token": "--ivy-color-warning-500"
      },
      "border": {
        "hex": "#FEF0C7",
        "token": "--ivy-color-warning-100"
      },
      "background": {
        "hex": "#FFFCF5",
        "token": "--ivy-color-warning-25"
      }
    }
  },
  {
    "id": "operations",
    "name": "Operations",
    "family": "stone",
    "colors": {
      "text": {
        "hex": "#897867",
        "token": "--ivy-color-stone-500"
      },
      "border": {
        "hex": "#EAE8E6",
        "token": "--ivy-color-stone-100"
      },
      "background": {
        "hex": "#F9F9F8",
        "token": "--ivy-color-stone-25"
      }
    }
  },
  {
    "id": "ticketing-itsm",
    "name": "Ticketing / ITSM",
    "family": "brown",
    "colors": {
      "text": {
        "hex": "#A5704A",
        "token": "--ivy-color-brown-500"
      },
      "border": {
        "hex": "#EEE7E2",
        "token": "--ivy-color-brown-100"
      },
      "background": {
        "hex": "#FAF8F7",
        "token": "--ivy-color-brown-25"
      }
    }
  }
];
  function createPill(name) {
    const category = categories.find(category => category.name === name);
    if (!category) throw new Error(`Unknown Ivy category: ${name}`);
    const pill = document.createElement('span');
    pill.className = 'ivy-category-pill inline-flex items-center rounded-full border px-2 font-body text-xs font-normal leading-text-xs h-[22px]';
    pill.dataset.ivyCategory = category.id;
    pill.setAttribute('aria-label', `Category: ${name}`);
    pill.textContent = name;
    return pill;
  }
  window.IvyCategories = { categories, createPill };
})();
