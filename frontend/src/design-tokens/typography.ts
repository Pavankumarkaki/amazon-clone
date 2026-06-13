export const typography = {
  fontFamily: {
    sans: '"Amazon Ember", Arial, sans-serif',
    mono: "monospace",
  },
  fontSize: {
    xs: "11px",
    sm: "12px",
    base: "14px",
    md: "16px",
    lg: "18px",
    xl: "21px",
    "2xl": "24px",
    "3xl": "28px",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.2",
    normal: "1.4",
    relaxed: "1.6",
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
  },
  product: {
    title: { size: "28px", weight: "400", lineHeight: "1.3" },
    sectionHeading: { size: "21px", weight: "700", lineHeight: "1.3" },
    price: { size: "28px", weight: "400", lineHeight: "1.2" },
    priceDeal: { size: "18px", weight: "400", lineHeight: "1.3" },
    meta: { size: "12px", weight: "400", lineHeight: "1.4" },
    body: { size: "14px", weight: "400", lineHeight: "1.6" },
  },
} as const;
