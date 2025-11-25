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

## Key Features

- **Automated Contrast**: Lightness values are solved mathematically to ensure APCA/WCAG compliance.
- **Themeable**: Change a few "Anchors" and "Key Colors" to generate a completely new theme.
- **Platform Native**: Built on modern CSS features like `oklch`, `@property`, and `light-dark()`.
- **Framework Agnostic**: Core logic is pure TypeScript; output is standard CSS.

## Getting Started

Check out the [Usage](./usage/index.md) section to learn how to install and use the system in your project.
