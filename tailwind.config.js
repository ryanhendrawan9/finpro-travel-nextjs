/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Keep original color palette
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        secondary: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        // Enhanced gray palette for subtle variations
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          150: "#ebedf0", // Extra shade for subtle differences
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        heading: ["var(--font-montserrat)", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(149, 157, 165, 0.1)",
        "card-hover": "0 12px 28px rgba(149, 157, 165, 0.2)",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.05)",
        "subtle-hover": "0 4px 12px rgba(0, 0, 0, 0.05)",
        inner: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
        "border-glow": "0 0 0 1px rgba(14, 165, 233, 0.15)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      borderWidth: {
        0.5: "0.5px",
        3: "3px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-in-out",
        "slide-down": "slideDown 0.5s ease-in-out",
        "slide-left": "slideLeft 0.5s ease-in-out",
        "slide-right": "slideRight 0.5s ease-in-out",
        "float-subtle": "floatSubtle 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        floatSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      backgroundImage: {
        "gradient-subtle":
          "linear-gradient(to right, var(--tw-gradient-stops))",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "dot-pattern": "radial-gradient(currentColor 1px, transparent 1px)",
        "line-pattern":
          "repeating-linear-gradient(to right, currentColor, currentColor 1px, transparent 1px, transparent 16px)",
      },
      backdropBlur: {
        xs: "2px",
      },
      maxWidth: {
        xxs: "16rem",
        "8xl": "88rem",
        "9xl": "96rem",
      },
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        18: "4.5rem",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      transitionDuration: {
        400: "400ms",
      },
      transitionTimingFunction: {
        "bounce-subtle": "cubic-bezier(0.4, 0.0, 0.2, 1)",
      },
    },
  },
  plugins: [
    // Plugin for elegant additions
    function ({ addUtilities }) {
      const newUtilities = {
        // Subtle border utilities
        ".border-hairline": {
          borderWidth: "0.5px",
        },
        ".border-transparent-white": {
          borderColor: "rgba(255, 255, 255, 0.1)",
        },
        ".border-transparent-black": {
          borderColor: "rgba(0, 0, 0, 0.05)",
        },
        // Elegant text utilities
        ".text-balance": {
          textWrap: "balance",
        },
        ".text-pretty": {
          textWrap: "pretty",
        },
        // Elegant background utilities
        ".bg-noise": {
          position: "relative",
          isolation: "isolate",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            background:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            mixBlendMode: "overlay",
            pointerEvents: "none",
            zIndex: -1,
          },
        },
        // Card with hover effect
        ".card-elegant": {
          "@apply bg-white rounded-xl border border-gray-100 shadow-subtle transition duration-300":
            {},
          "&:hover": {
            "@apply shadow-subtle-hover border-gray-200 transform -translate-y-1":
              {},
          },
        },
        // Glass effect
        ".bg-glass-light": {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
        // Dot pattern backgrounds
        ".bg-dot-gray-100": {
          backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        },
        ".bg-dot-gray-200": {
          backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
