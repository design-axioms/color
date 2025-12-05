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
          "light-dark(oklch(0.45 0.2 288.0332139382555), oklch(0.75 0.2 288.0332139382555))",
        surface: {
          page: "light-dark(oklch(1 0 293.0332), oklch(0.1 0 288.1078))",
          workspace:
            "light-dark(oklch(0.9806 0 293.0304), oklch(0.2541 0 288.5778))",
          card: "light-dark(oklch(0.9776 0 293.0296), oklch(0.1 0 288.1078))",
          action: "light-dark(oklch(1 0 293.0332), oklch(0.1 0 288.1078))",
          spotlight: "light-dark(oklch(0.1 0 288.1078), oklch(0.9 0 292.9586))",
        },
        chart: {
          1: "light-dark(oklch(0.6484 0.14 25), oklch(0.7588 0.14 25))",
          2: "light-dark(oklch(0.6484 0.14 190), oklch(0.7588 0.14 190))",
          3: "light-dark(oklch(0.6484 0.14 45), oklch(0.7588 0.14 45))",
          4: "light-dark(oklch(0.6484 0.14 250), oklch(0.7588 0.14 250))",
          5: "light-dark(oklch(0.6484 0.14 85), oklch(0.7588 0.14 85))",
          6: "light-dark(oklch(0.6484 0.14 280), oklch(0.7588 0.14 280))",
          7: "light-dark(oklch(0.6484 0.14 125), oklch(0.7588 0.14 125))",
          8: "light-dark(oklch(0.6484 0.14 320), oklch(0.7588 0.14 320))",
          9: "light-dark(oklch(0.6484 0.14 150), oklch(0.7588 0.14 150))",
          10: "light-dark(oklch(0.6484 0.14 360), oklch(0.7588 0.14 360))",
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
