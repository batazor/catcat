// Small 64×64 illustrations: warm fills, brown outlines, recognizable silhouettes.
export const ICON = {
  dice: `
    <g transform="rotate(-12 22 34)">
      <rect x="6" y="20" width="30" height="30" rx="6" fill="var(--surface)"/>
      <g fill="var(--cat-dark)" stroke="none"><circle cx="14" cy="28" r="2.4"/><circle cx="28" cy="28" r="2.4"/><circle cx="21" cy="35" r="2.4"/><circle cx="14" cy="42" r="2.4"/><circle cx="28" cy="42" r="2.4"/></g>
    </g>
    <g transform="rotate(13 43 27)">
      <rect x="29" y="10" width="28" height="28" rx="6" fill="var(--mango)"/>
      <g fill="var(--cat-dark)" stroke="none"><circle cx="36" cy="17" r="2.4"/><circle cx="43" cy="24" r="2.4"/><circle cx="50" cy="31" r="2.4"/></g>
    </g>`,
  ball: `
    <path d="M10 56 51 5" stroke-width="4"/>
    <path d="M11 54.8 48.5 8.1" stroke="#ddb27f" stroke-width="2.3"/>
    <path d="M48.5 8.1 51 5" stroke="var(--surface)" stroke-width="2.3"/>
    <circle cx="38" cy="36" r="20" fill="var(--cat-eye)"/>
    <path d="M24 29q2-7 9-9" stroke="var(--surface)" opacity=".45"/>
    <circle cx="39" cy="34" r="10" fill="var(--surface)"/>
    <g stroke="var(--cat-dark)" stroke-width="2.3"><ellipse cx="39" cy="31" rx="3.1" ry="2.6"/><ellipse cx="39" cy="36.5" rx="3.5" ry="3"/></g>`,
  bird: `
    <path d="M8 51h47" stroke-width="4"/>
    <g class="parrot-sway">
    <path d="m33 40-8 16 15-8" fill="var(--accent)"/>
    <path d="M19 31c0-9 6-16 15-16h8v18c0 11-5 17-13 17-7 0-11-8-10-19Z" fill="#a8ae65"/>
    <path d="M24 31c8-3 13 1 12 9-1 5-5 7-9 7" fill="#d5c77e"/>
    <path d="M31 17c-1-9 4-13 11-12 8 0 12 5 11 12l-7 8-12-3Z" fill="var(--mango)"/>
    <path d="M49 13c10 0 12 7 6 12l-3-7-4 1Z" fill="var(--accent)"/>
    <circle cx="43" cy="12" r="2" fill="var(--cat-eye)" stroke="none"/>
    </g>
    <path d="m29 48-1 5m10-7-1 7"/>
    <path d="M11 51q-5-7-5-12 9 1 11 12" fill="#a8ae65"/>`,
  leaf: `
    <path d="M8 55h48"/>
    <path d="M31 54V17M31 39 17 30m14 1 15-12"/>
    <g class="garden-leaf" style="--leaf-x:31px;--leaf-y:22px;--leaf-delay:-.8s"><path d="M31 22C20 19 18 10 22 5c10 1 14 8 9 17Z" fill="#a8ae65"/></g>
    <g class="garden-leaf" style="--leaf-x:31px;--leaf-y:33px;--leaf-delay:-1.1s"><path d="M31 33c0-13 9-20 22-19-1 12-8 19-22 19Z" fill="#b7b56b"/></g>
    <g class="garden-leaf" style="--leaf-x:30px;--leaf-y:43px;--leaf-delay:-1.4s"><path d="M30 43C15 43 7 35 8 23c14 1 22 7 22 20Z" fill="#a8ae65"/></g>
    <path d="M40 54V40"/>
    <g fill="var(--accent)"><ellipse cx="40" cy="34" rx="4" ry="6"/><ellipse cx="34" cy="39" rx="6" ry="4"/><ellipse cx="45" cy="40" rx="6" ry="4"/></g>
    <circle cx="40" cy="39" r="3" fill="var(--mango)"/>
    <path d="M17 55v-6m33 6v-5"/>`,
  beach: `
    <g class="sun-rays-clip"><g class="sun-rays" style="--sun-x:32px;--sun-y:33px">
      <path d="M32 4v5M52.5 12.5 49 16M61 33h-5M52.5 53.5 49 50M32 62v-5M11.5 53.5 15 50M3 33h5M11.5 12.5 15 16"/>
    </g></g>
    <path d="M9 33a23 23 0 0 1 46 0" fill="var(--mango)"/>
    <path d="M5 33h54"/>
    <path d="M5 40q7-5 14 0t14 0 14 0 12 0M9 49q7-5 14 0t14 0 14 0M22 57h20"/>
    <path d="M26 33h12" stroke="var(--surface)" stroke-width="3"/>`,
  crane: `
    <path d="m7 40 17-8L18 9l21 19 12-11 9 3-10 4-4 18-16-4-12 15 3-14Z" fill="var(--surface)"/>
    <path d="m24 32 15-4-9 10M18 9l12 29m16 4-7-14m0 0 11-4" stroke-width="1.7"/>
    <path d="m7 40 14-1-3 14" fill="var(--mango)"/>
    <path d="m39 28 12-11-1 7-4 18Z" fill="#f2c79f"/>
    <path d="m30 38 9-10" stroke-width="1.7"/>`,
  home: `
    <path d="M5 54h54"/>
    <path d="M9 34h30v20H9Z" fill="var(--surface)"/>
    <path d="M7 25h33l3 12H5Z" fill="var(--accent)"/>
    <path d="m15 25-2 12m10-12v12m9-12 2 12" stroke="var(--surface)" stroke-width="3"/>
    <path d="M5 37q5 5 9 0 5 5 10 0 5 5 10 0 5 5 9 0" fill="var(--mango)"/>
    <path d="M14 54V43h9v11m6-10h6v5h-6Z" fill="#e3bc84"/>
    <path d="M49 53q4-15 0-32" stroke-width="3"/>
    <g class="palm-leaves"><path d="M49 21c-4-10-12-10-17-5 7-1 13 3 17 5-1-11 7-15 12-10-6 1-10 5-12 10 8-5 12-1 13 5-5-4-9-5-13-5-7-1-11 2-13 8 6-3 10-5 13-8Z" fill="#b7b56b"/></g>`,
  cliff: `
    <g class="sun-rays" style="--sun-x:49px;--sun-y:13px" stroke-width="1.6">
      <path d="M49 2v2m7.8 1.2-1.4 1.4M60 13h-2m-1.2 7.8-1.4-1.4M49 24v-2m-7.8-1.2 1.4-1.4M38 13h2m1.2-7.8 1.4 1.4"/>
    </g>
    <circle cx="49" cy="13" r="7" fill="var(--mango)"/>
    <path d="M5 14h19l6 8-5 9 5 8-9 10H5Z" fill="#d6b28c"/>
    <path d="M5 14h19l-5 6H5Z" fill="#b7b56b"/>
    <path d="m14 23 6 4-5 8 5 4-5 8" stroke-width="1.8"/>
    <path d="M22 49c9-6 11-14 18-14h19v20H21" fill="var(--surface)"/>
    <path d="M32 46q5-4 10 0t10 0 9 0M33 55q5-4 10 0t10 0"/>
    <path d="M39 27h19" stroke-width="1.6"/>`,
  cave: `
    <path d="M5 45V29C5 14 16 6 31 6s27 9 27 23v16Z" fill="#d6b28c"/>
    <path d="M18 44V29c0-9 5-14 13-14s14 5 14 14v15Z" fill="var(--cat-dark)"/>
    <path d="M23 43V29c0-6 3-9 8-9s9 3 9 9v14Z" fill="var(--surface)"/>
    <path d="m17 9 4 7M45 9l-4 7M8 28h10m27 0h10" stroke-width="1.7"/>
    <path d="M25 35h11v7H25v6H14v6H5" fill="var(--mango)"/>
    <path d="M38 47q5-4 10 0t11 0M31 55q5-4 10 0t11 0"/>`,
  bay: `
    <g class="sun-rays" style="--sun-x:32px;--sun-y:10px" stroke-width="1.5">
      <path d="M32 1v1.5m6.4 1.1-1.1 1.1M41 10h-1.5m-1.1 6.4-1.1-1.1M32 19v-1.5m-6.4-1.1 1.1-1.1M23 10h1.5m1.1-6.4 1.1 1.1"/>
    </g>
    <path d="M5 11h13l7 11-6 10 11 9-10 13H5Z" fill="#e3c497"/>
    <path d="M59 11H46l-6 10 6 10-11 9 9 14h15Z" fill="#e3c497"/>
    <path d="m5 11 9 6-3 9m48-15-9 6 3 9" stroke-width="1.7"/>
    <path d="M20 54c3-10 8-16 13-16s10 7 11 16" fill="var(--surface)"/>
    <path d="M23 24q5-4 10 0t10 0M24 31q5-4 10 0t9 0"/>
    <path d="M7 59h50"/>
    <circle cx="32" cy="10" r="5" fill="var(--mango)"/>`,
  fire: `
    <path d="M8 54c-9-3-7-10-3-16l2 7 4-4c5 7 4 11-3 13ZM56 54c9-3 7-10 3-16l-2 7-4-4c-5 7-4 11 3 13Z" fill="var(--accent)" stroke-width="1.8"/>
    <path d="M7 51q-3-3 1-6 4 4-1 6ZM57 51q3-3-1-6-4 4 1 6Z" fill="var(--mango)" stroke="none"/>
    <path d="M26 28 17 24 12 12M38 28l9-4 5-12" stroke-width="5"/>
    <path d="M26 28 17 24 12 12M38 28l9-4 5-12" stroke="var(--cat)" stroke-width="2.5"/>
    <path d="m12 13-4-3m4 3-1-6m41 6 4-3m-4 3 1-6" stroke-width="1.8"/>
    <path d="M27 25h10l5 15H22Z" fill="var(--cat)"/>
    <circle cx="32" cy="18" r="6" fill="var(--cat)"/>
    <path d="m25 13 2-8 5 5 5-5 2 8Z" fill="var(--mango)" stroke-width="1.8"/>
    <path d="M30 19h.1m3.8 0h.1" stroke="var(--cat-eye)" stroke-width="1.8"/>
    <path d="m22 49-7 7 15 3m12-10 7 7-15 3" stroke-width="4"/>
    <path d="M21 38h22l3 11H18Z" fill="var(--surface)"/>
    <path d="M22 39h5v5h-6Zm11 0h5v5h-5Zm-6 5h5v4h-6Zm11 0h5l1 4h-6Z" fill="var(--cat-eye)" stroke="none"/>
    <path d="M5 61h54" stroke-width="1.8"/>`,
  roof: `
    <g class="sun-rays" style="--sun-x:50px;--sun-y:12px" stroke-width="1.6">
      <path d="M50 1v2m7.8 1.2-1.4 1.4M61 12h-2m-1.2 7.8-1.4-1.4M50 23v-2m-7.8-1.2 1.4-1.4M39 12h2m1.2-7.8 1.4 1.4"/>
    </g>
    <circle cx="50" cy="12" r="7" fill="var(--mango)"/>
    <path d="M5 32h17m20 0h17M7 32v19m50-19v19" stroke-width="2"/>
    <path d="M5 51h54v7H5Z" fill="#d6b28c"/>
    <path d="M5 59h54" stroke-width="3"/>
    <path d="m7 34 5 11h10v-6H12l-2-6Z M57 34l-5 11H42v-6h10l2-6Z" fill="var(--surface)" stroke-width="1.8"/>
    <path d="M13 45v5m8-5v5m22-5v5m8-5v5" stroke-width="1.8"/>
    <path d="M32 41v10m-5 0h10" stroke-width="2"/>
    <ellipse cx="32" cy="40" rx="10" ry="2.5" fill="var(--surface)" stroke-width="1.8"/>
    <g class="wine-glass">
      <path d="M25 11h14l-1 10c-1 8-11 8-12 0Z" fill="var(--surface)" stroke="none"/>
      <path d="M26 19q6-2 12 0l-.5 3c-1.5 5-9.5 5-11 0Z" fill="#b6533c" stroke="none"/>
      <path d="M25 11h14l-1 10c-1 8-11 8-12 0ZM32 27v11m-4 0h8" stroke-width="1.8"/>
      <path d="m28 14 .4 4" stroke="var(--surface)" stroke-width="1.5"/>
    </g>`
};
