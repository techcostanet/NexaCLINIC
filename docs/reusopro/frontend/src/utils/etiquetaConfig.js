// Dialyzer label settings shared by the HTML (browser print) and ZPL
// (direct Zebra print) renderers.

/** Physical label size in mm (Zebra ZD230 roll used originally). */
export const TAMANHO_ETIQUETA_PADRAO = { largura: 102, altura: 44 };

// The unit's protocol prints fixed serology values on every label instead of
// the patient's registered serology. Change here if your protocol differs.
export const SOROLOGIA_ETIQUETA = ['HCV-', 'HIV-', 'ANTI HBS+'];

/**
 * Optional logo.
 *  - LOGO_URL: image under /public used by the HTML label (null = no logo).
 *  - LOGO_ZPL: { gfa, larguraDots } for the ZPL label. `gfa` is a full
 *    "^GFA,..." command (monochrome bitmap, e.g. from Zebra's image converter
 *    or labelary.com); `larguraDots` is its width in dots. null = no logo.
 */
export const LOGO_URL = null;
export const LOGO_ZPL = null;
