module.exports = {
  theme: {
    extend: {
      colors: {
        text: {
          high: "var(--text-high-token)",
          subtle: "var(--text-subtle-token)",
          subtlest: "var(--text-subtlest-token)",
        },
        border: {
          dec: "var(--border-dec-token)",
          int: "var(--border-int-token)",
        },
        focus:
          "light-dark(oklch(0.45 0.2 328.3634151749902), oklch(0.75 0.2 328.3634151749902))",
        surface: {
          page: "light-dark(oklch(0.98 0 373.2343), oklch(0 0 328.3634))",
          panel: "light-dark(oklch(0.98 0 373.2343), oklch(0 0 328.3634))",
          card: "light-dark(oklch(0.9536 0 372.7613), oklch(0 0 328.3634))",
          "neon-button":
            "light-dark(oklch(0.1 0.3 330.595), oklch(0.9 0.3 371.1319))",
        },
        chart: {
          1: "light-dark(oklch(0.5085 0.25 300), oklch(0.8406 0.25 300))",
          2: "light-dark(oklch(0.5085 0.25 180), oklch(0.8406 0.25 180))",
          3: "light-dark(oklch(0.5085 0.25 60), oklch(0.8406 0.25 60))",
          4: "light-dark(oklch(0.5085 0.25 0), oklch(0.8406 0.25 0))",
          5: "light-dark(oklch(0.5085 0.25 120), oklch(0.8406 0.25 120))",
          6: "light-dark(oklch(0.5085 0.25 240), oklch(0.8406 0.25 240))",
        },
      },
      boxShadow: {
        sm: "light-dark(0 1px 2px 0 oklch(0 0 0 / 0.05), 0 1px 2px 0 oklch(1 0 0 / 0.15))",
        md: "light-dark(0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -1px oklch(0 0 0 / 0.06), 0 4px 6px -1px oklch(1 0 0 / 0.15), 0 2px 4px -1px oklch(1 0 0 / 0.1))",
        lg: "light-dark(0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -2px oklch(0 0 0 / 0.05), 0 10px 15px -3px oklch(1 0 0 / 0.15), 0 4px 6px -2px oklch(1 0 0 / 0.1))",
        xl: "light-dark(0 20px 25px -5px oklch(0 0 0 / 0.1), 0 10px 10px -5px oklch(0 0 0 / 0.04), 0 20px 25px -5px oklch(1 0 0 / 0.15), 0 10px 10px -5px oklch(1 0 0 / 0.1))",
      },
    },
  },
};
