export const themeConfig = {
  colors: {
    primary: {
      DEFAULT: "hsl(22, 100%, 50%)", // Warm orange
      foreground: "hsl(0, 0%, 100%)",
    },
    secondary: {
      DEFAULT: "hsl(43, 100%, 55%)", // Warm yellow
      foreground: "hsl(0, 0%, 10%)",
    },
    accent: {
      DEFAULT: "hsl(130, 40%, 45%)", // Fresh green
      foreground: "hsl(0, 0%, 100%)",
    },
    muted: {
      DEFAULT: "hsl(30, 20%, 95%)",
      foreground: "hsl(30, 10%, 40%)",
    },
    background: {
      DEFAULT: "hsl(0, 0%, 100%)",
      foreground: "hsl(0, 0%, 10%)",
    },
    card: {
      DEFAULT: "hsl(0, 0%, 100%)",
      foreground: "hsl(0, 0%, 10%)",
    },
    border: "hsl(30, 15%, 90%)",
    input: "hsl(30, 15%, 90%)",
    ring: "hsl(22, 100%, 50%)",
  },
  fonts: {
    sans: "var(--font-inter)",
    heading: "var(--font-montserrat)",
  },
  radii: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
}
