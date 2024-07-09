import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        blurple: "#5865F2",
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    {
      handler: (tw) => {
        tw.matchUtilities(
          {
            "text-glow": (value) => ({
              "text-shadow": `0 0 10px ${value}, 0 0 150px ${value}`,
            }),
            glow: (value) => ({
              filter: `drop-shadow(0px 0px 7px ${value})`,
            }),
          },
          {
            values: flattenColorPalette(tw.theme("colors")),
            type: "color",
          }
        );

        tw.matchUtilities(
          {
            "nice-underline": (value) => ({
              position: "relative",
              zIndex: "0",
              "&:before": {
                zIndex: "-1",
                content: "''",
                position: "absolute",
                bottom: "0.4px",
                left: "1.5px",
                right: "1.5px",
                "border-bottom": `1.8px solid ${value}`,
              },
            }),
          },
          {
            values: flattenColorPalette(tw.theme("colors")),
            type: "color",
          }
        );
      },
    },
    typography,
  ],
};
export default config;
