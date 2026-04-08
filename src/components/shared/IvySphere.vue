<script setup>
  const props = defineProps({
    pulseAnimation: {
      type: Boolean,
      default: true,
    },
    size: {
      type: Number,
      default: 108,
    },
    animationDuration: {
      type: String,
      default: "1.4s",
    },
  });
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
    <defs>
      <radialGradient id="ivy-core" cx="38%" cy="28%" r="78%">
        <stop offset="0%" stop-color="#FCFEFF" stop-opacity="0.98"/>
        <stop offset="10%" stop-color="#F4FCFF" stop-opacity="0.98"/>
        <stop offset="22%" stop-color="#D8F3FF" stop-opacity="0.97"/>
        <stop offset="38%" stop-color="#8EDCFB" stop-opacity="0.96"/>
        <stop offset="56%" stop-color="#67B8F2" stop-opacity="0.94"/>
        <stop offset="72%" stop-color="#6A72E0" stop-opacity="0.92"/>
        <stop offset="86%" stop-color="#6554D0" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#5A3FB8" stop-opacity="0.97"/>
      </radialGradient>

      <radialGradient id="ivy-aura-1" cx="50%" cy="50%" r="50%">
        <stop offset="32%" stop-color="#7AAEE6" stop-opacity="0"/>
        <stop offset="52%" stop-color="#69DBFF" stop-opacity="0.40"/>
        <stop offset="74%" stop-color="#6D73FF" stop-opacity="0.56"/>
        <stop offset="100%" stop-color="#C0AFFF" stop-opacity="0.42"/>
      </radialGradient>

      <radialGradient id="ivy-aura-2" cx="48%" cy="48%" r="50%">
        <stop offset="38%" stop-color="#8BC9E6" stop-opacity="0"/>
        <stop offset="62%" stop-color="#86E8FF" stop-opacity="0.32"/>
        <stop offset="84%" stop-color="#7B73FF" stop-opacity="0.34"/>
        <stop offset="100%" stop-color="#CABBFF" stop-opacity="0.32"/>
      </radialGradient>

      <radialGradient id="texture-light-1" cx="30%" cy="24%" r="62%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.28"/>
        <stop offset="26%" stop-color="#E8F9FF" stop-opacity="0.25"/>
        <stop offset="54%" stop-color="#A8E8FF" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#A8E8FF" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="texture-light-2" cx="34%" cy="30%" r="56%">
        <stop offset="0%" stop-color="#F7FCFF" stop-opacity="0.20"/>
        <stop offset="34%" stop-color="#D4F3FF" stop-opacity="0.16"/>
        <stop offset="70%" stop-color="#96DBFF" stop-opacity="0.09"/>
        <stop offset="100%" stop-color="#96DBFF" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="shadow-base" cx="71%" cy="74%" r="74%">
        <stop offset="0%" stop-color="#2A1E5C" stop-opacity="0.48"/>
        <stop offset="34%" stop-color="#4B2FA3" stop-opacity="0.28"/>
        <stop offset="68%" stop-color="#6B52C8" stop-opacity="0.11"/>
        <stop offset="100%" stop-color="#6B52C8" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="shadow-smooth" cx="74%" cy="76%" r="62%">
        <stop offset="0%" stop-color="#5A3FD6" stop-opacity="0.44"/>
        <stop offset="30%" stop-color="#6E5CFF" stop-opacity="0.30"/>
        <stop offset="60%" stop-color="#7B6AE0" stop-opacity="0.13"/>
        <stop offset="100%" stop-color="#7B6AE0" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="shadow-fill" cx="66%" cy="68%" r="78%">
        <stop offset="0%" stop-color="#735DC8" stop-opacity="0.18"/>
        <stop offset="52%" stop-color="#735DC8" stop-opacity="0.09"/>
        <stop offset="100%" stop-color="#735DC8" stop-opacity="0"/>
      </radialGradient>

      <clipPath id="orb-clip">
        <circle cx="54" cy="54" r="54"/>
      </clipPath>

      <filter id="blur-xxl" x="-160%" y="-160%" width="420%" height="420%">
        <feGaussianBlur stdDeviation="32"/>
      </filter>

      <filter id="blur-xl" x="-140%" y="-140%" width="380%" height="380%">
        <feGaussianBlur stdDeviation="21"/>
      </filter>

      <filter id="blur-lg" x="-120%" y="-120%" width="340%" height="340%">
        <feGaussianBlur stdDeviation="8"/>
      </filter>

      <filter id="blur-md" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="5.5"/>
      </filter>

      <filter id="blur-sm" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="3.6"/>
      </filter>

      <filter id="ivy-glow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="4.2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- outer aura -->
    <circle cx="54" cy="54" r="102" fill="url(#ivy-aura-1)" filter="url(#blur-xxl)" opacity="0.84">
      <animate attributeName="r" values="98;94;108;100;98" :dur="animationDuration" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.78;0.70;0.96;0.84;0.78" :dur="animationDuration" repeatCount="indefinite"/>
    </circle>

    <circle cx="54" cy="54" r="88" fill="url(#ivy-aura-2)" filter="url(#blur-xl)" opacity="0.76">
      <animate attributeName="r" values="84;80;94;86;84" :dur="animationDuration" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.70;0.62;0.88;0.76;0.70" :dur="animationDuration" repeatCount="indefinite"/>
    </circle>

    <!-- core -->
    <circle cx="54" cy="54" r="54" fill="url(#ivy-core)" filter="url(#ivy-glow)">
      <animate attributeName="r" values="53.4;52.8;55.4;54.0;53.4" :dur="animationDuration" repeatCount="indefinite"/>
    </circle>

    <!-- interior -->
    <g clip-path="url(#orb-clip)">
      <ellipse cx="36" cy="30" rx="36" ry="30" fill="url(#texture-light-1)" filter="url(#blur-sm)" opacity="0.60">
        <animate attributeName="opacity" values="0.56;0.50;0.68;0.60;0.56" :dur="animationDuration" repeatCount="indefinite"/>
      </ellipse>

      <ellipse cx="42" cy="24" rx="30" ry="22" fill="url(#texture-light-2)" filter="url(#blur-sm)" opacity="0.52">
        <animate attributeName="opacity" values="0.48;0.42;0.60;0.52;0.48" :dur="animationDuration" repeatCount="indefinite"/>
      </ellipse>

      <ellipse cx="62" cy="62" rx="58" ry="48" fill="url(#shadow-fill)" filter="url(#blur-md)" opacity="0.70">
        <animate attributeName="opacity" values="0.66;0.60;0.82;0.70;0.66" :dur="animationDuration" repeatCount="indefinite"/>
      </ellipse>

      <ellipse cx="66" cy="66" rx="52" ry="44" fill="url(#shadow-base)" filter="url(#blur-sm)" opacity="0.88">
        <animate attributeName="opacity" values="0.84;0.78;0.96;0.88;0.84" :dur="animationDuration" repeatCount="indefinite"/>
      </ellipse>

      <ellipse cx="70" cy="70" rx="42" ry="36" fill="url(#shadow-smooth)" filter="url(#blur-sm)" opacity="0.76">
        <animate attributeName="opacity" values="0.72;0.66;0.84;0.76;0.72" :dur="animationDuration" repeatCount="indefinite"/>
      </ellipse>
    </g>

    <!-- highlight -->
    <ellipse cx="36" cy="28" rx="21" ry="13" fill="#FFFFFF" opacity="0.30" filter="url(#blur-lg)">
      <animate attributeName="opacity" values="0.26;0.22;0.36;0.30;0.26" :dur="animationDuration" repeatCount="indefinite"/>
    </ellipse>
  </svg>
</template>
