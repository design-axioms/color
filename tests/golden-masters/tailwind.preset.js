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
          "light-dark(oklch(0.45 0.2 292.7172241670128), oklch(0.75 0.2 292.7172241670128))",
        surface: {
          page: "light-dark(oklch(1 0 297.7172), oklch(0.1 0 292.7918))",
          workspace:
            "light-dark(oklch(0.9926 0 297.7169), oklch(0.1935 0 293.015))",
          card: "light-dark(oklch(0.9687 0 297.7104), oklch(0.2911 0 293.4658))",
          action: "light-dark(oklch(0.1 0 292.7918), oklch(0.9 0 297.6427))",
          "action-soft":
            "light-dark(oklch(0.9355 0 297.6879), oklch(0.3543 0 293.8895))",
          spotlight:
            "light-dark(oklch(0.6056 0.2189 292.7172), oklch(0.6056 0.2189 292.7172))",
          "status-success":
            "light-dark(oklch(0.9 0.15 167.4051), oklch(0.4 0.15 164.0206))",
          "status-warning":
            "light-dark(oklch(0.9 0.15 75.0058), oklch(0.4 0.15 71.6213))",
          "status-error":
            "light-dark(oklch(0.9 0.2 30.2568), oklch(0.4 0.2 26.8723))",
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
