# Introduction

**Stop picking colors. Start defining intent.**

The **Color System** is a semantic, automated palette generator designed for modern web applications. It solves the hardest parts of theming—accessibility, dark mode, and consistency—by using math instead of magic numbers.

## The Problem

In traditional design systems, you pick a color for "Light Mode" and a color for "Dark Mode".

- "Light Card: `#ffffff`"
- "Dark Card: `#1a1a1a`"

But what happens when you need a "High Contrast" mode? Or a "Dim" mode? Or when your brand color changes from Blue to Purple? You have to manually audit and update every single hex code to ensure text remains readable.

## The Solution

This system flips the model. You define **Constraints** and **Intent**:

> "I need a surface that guarantees APCA 60 contrast against the page background."

The system **solves** for the exact lightness value that meets that criteria.

<div class="surface-card docs-p-4 docs-rounded docs-my-4">
  <strong>Wait, what is APCA?</strong>
  <p class="text-subtle docs-mt-2">
    APCA (Advanced Perceptual Contrast Algorithm) is the new standard for measuring contrast. Unlike the old WCAG 2.0 math (which was simple but often wrong), APCA models how the human eye actually perceives light and dark.
  </p>
  <p class="text-subtle docs-mt-2">
    Don't worry about the math. The system handles it for you. Just know that "APCA 60" means "easy to read".
  </p>
  <p class="text-subtle docs-mt-2" style="font-size: 0.9em; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
    <strong>New to accessibility?</strong> The system's defaults are designed to meet or exceed WCAG AA/AAA standards out of the box. You don't need to be an expert to ship an accessible app.
  </p>
</div>

<div style="margin: 2rem 0;">
  <a href="https://color-system-demo.netlify.app" target="_blank" style="background: var(--fg); color: var(--bg); padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
    Try the Theme Builder →
  </a>
</div>

## Key Features

- **Automated Contrast**: Lightness values are solved mathematically to ensure APCA/WCAG compliance.
- **Themeable**: Change a few "Anchors" and "Key Colors" to generate a completely new theme.
- **Platform Native**: Built on modern CSS features like `oklch`, `@property`, and `light-dark()`.
- **Framework Agnostic**: Core logic is pure TypeScript; output is standard CSS.

## Getting Started

Check out the [Usage](./usage/index.md) section to learn how to install and use the system in your project.
