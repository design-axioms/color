# The Algebra of Color Design

> **Context**: The physics and grammar of the Axiomatic Color system. ([View Changelog](./composition-algebra-changelog.md))

This document defines the "Physics" of the Axiomatic Color system. While the system is built on rigorous math, you can think of it using a theatrical analogy:

- **Context (, C$) is the Stage Lighting**: It sets the atmosphere. If the stage is lit with red light, everything on it is tinted red. This "atmosphere" permeates everything.
- **Intent ($) is the Voice**: It's how the actor speaks. They can whisper (Subtle) or shout (High).
- **Surfaces are Set Changes**: When you walk into a new room (a Card, a Sidebar), the conversation resets. The actor stops shouting, but the lighting might stay the same.

Below, we formalize these intuitions into a set of rules that guarantee your UI always looks consistent.

## 1. The State Space ($\mathcal{S}$)

The system state at any point in the DOM tree is defined by a configuration $\mathcal{S}$. Note that this is a **Configuration Space** (Manifold), not a Vector Space, as the components are not all continuous fields.

\mathcal{S} = \langle H, C, L\\\_{src}, \rho \rangle

Where:

- \in S^1$ (Circle Group): **Context Hue**. The base hue for the current environment. Being circular, 60^\circ \equiv 0^\circ$.
- \in [0, 1]$: **Context Chroma**. The base vibrancy for the current environment.
- {src} \in \text{Token}$: **Intent Lightness**. A reference to a lightness token (e.g., `text-high`, `text-subtle`).
- $\rho \in \{ \text{Light}, \text{Dark} \}$: **Polarity**. The local resolved mode. This is a discrete binary switch.

### 1.1 The Axiomatic Origin ($\sigma\_{root}$)

The system is a closed universe. The initial state is defined at the `:root` of the document.

\sigma\_{root} = \langle H\_{theme}, C\_{theme}, L\_{base}, \rho\\\_{user} \rangle

> **In Plain English**: Think of $\mathcal{S}$ as the "DNA" of the current element. It carries four genes: what color family we are in ($), how vibrant it is ($), how bright the text should be ({src}$), and whether we are in light or dark mode ($\rho$). Every element inherits this DNA from its parent.

## 2. The Resolution Function ($\Phi$)

The CSS Engine acts as a projection function $\Phi$ that maps the state $\mathcal{S}$ to a concrete CSS color value.

\Phi(\mathcal{S}) \mapsto \text{ColorSpace}(\text{oklch})

\Phi(\langle H, C, L\_{src}, \rho \rangle) = \text{oklch}(\text{eval}(L\_{src}, \rho), C, H)

Where $\text{eval}(L\_{src}, \rho)$ represents the **Late Binding** of the token. It is a lookup function into the token definition set:

\forall t \in \text{Tokens}, \exists (l\_{light}, l\_{dark}) \text{ s.t. } \text{eval}(t, \rho) = (\rho = \text{Dark}) ? l\_{dark} : l\_{light}

> **In Plain English**: $\Phi$ is the browser's rendering engine. It takes the DNA ($\mathcal{S}$) and turns it into actual pixels. Crucially, it decides the actual lightness _at the last moment_ based on whether we are in light or dark mode.

## 3. The Operators

Classes in the system are **Operators** that transform the state $\mathcal{S} \rightarrow \mathcal{S}'$.

### 3.1. The Container Operator ($)

Layout primitives (like `div`, `span`, `section` without a surface class) act as the Identity Operator.

K(\mathcal{S}) = \mathcal{S}

- **Conservation**: Preserves , C, L\\\_{src}, \text{and } \rho$ exactly.
- **Translucency**: A container is mathematically invisible to the state. It allows the parent's "Voice" (Intent) and "Atmosphere" (Context) to pass through unchanged.

**The Glass Universe Topology**: Because the default container is transparent, the system operates in a "Glass Universe." Context propagates downwards infinitely until it strikes a boundary.

> **In Plain English**: A Container is just a grouping mechanism. If you put text inside a `div`, it doesn't stop being "Subtle" or "Brand colored." This formalizes the difference between a **Card** (Surface) and a **Wrapper** (Container).

### 3.2. Surface Operators ($)

A Surface establishes a new spatial context. All surfaces act as a **Lossy Barrier** for Intent ({src}$), forcibly resetting the "Voice" to the default. However, they differ in how they handle the "Atmosphere" (, C$).

We distinguish between two topological types of surfaces:

#### 3.2.1. Glass Surface ({glass}$)

A Glass Surface (e.g., `surface-card`, `surface-floating`) preserves the ambient environment.

S\_{glass}(\langle H, C, L\_{src}, \rho \rangle) = \langle H, C, L\\\_{high}, \rho' \rangle

- **Context Identity**: $ and $ are preserved. The surface is tinted by the parent's light.
- **Intent Erasure**: {src}$ is reset to {high}$.
- **Polarity**: $\rho'$ is resolved (usually $\rho' = \rho$, unless inverted).

> **In Plain English**: A standard Card is like a pane of frosted glass. It resets the text conversation (so you can start a new sentence), but it lets the room's colored lighting shine through. If the room is red, the card is tinted red.

#### 3.2.2. Solid Surface ({solid}$)

A Solid Surface (e.g., `surface-neutral`, `surface-paper`) blocks the ambient environment, grounding the local state. This is the **Topological Inverse** of the Container.

S\_{solid}(\langle H, C, L\_{src}, \rho \rangle) = \langle H, 0, L\\\_{high}, \rho' \rangle

- **Context Reset**: $ is forced to /usr/bin/bash$ (or a neutral floor $\epsilon$). $ becomes irrelevant (undefined) when =0$.
- **Intent Erasure**: {src}$ is reset to {high}$.

> **In Plain English**: A Solid Surface is opaque white (or black) paper. It ignores the room's red lighting and creates a purely neutral canvas. This is essential for "breaking out" of a strong brand section to display data or neutral content.

### 3.3. Intent Operator ($)

Intent classes (e.g., `.text-subtle`) modify the Lightness Source.

I\_{token}(\langle H, C, L\_{src}, \rho \rangle) = \langle H, C, L\\\_{token}, \rho \rangle

- **Identity on Context**: $ and $ are preserved.
- **Action**: Updates {src}$.

> **In Plain English**: Intent classes are adjectives. They modify the _current_ noun. They do not change the color of the noun, only its weight or emphasis.

### 3.4. Modifier Operator ($)

Modifier classes (e.g., `.hue-brand`) modify the Context variables.

M\_{brand}(\langle H, C, L\_{src}, \rho \rangle) = \langle H\_{brand}, C\_{ambient}, L\\\_{src}, \rho \rangle

- **Identity on Intent**: {src}$ is preserved.
- **Context Definition**: Updates $ to the brand hue and $ to the ambient chroma level.

> **In Plain English**: Modifier classes change the lighting of the room. They don't touch the text hierarchy. A title is still a title, but now it's illuminated by purple light.

## 4. Laws of Composition

### 4.1. Orthogonality (Commutativity of $ and $)

For **Neutral Intents** (where $ only affects $), Intent and Modifiers are commutative.

I(M(\mathcal{S})) \equiv M(I(\mathcal{S}))

**Implication**: The order of classes in HTML (`class="text-subtle hue-brand"` vs `class="hue-brand text-subtle"`) does not matter for the resulting color.

#### Exception: The Theorem of Semantic Dominance

For **Chromatic Intents** (e.g., Error, Success), the Intent must override the Context to convey meaning.

$$ I\_{error}(\langle H, C, L, \rho \rangle) = \langle H\_{error}, C\_{error}, L\_{error}, \rho \rangle $$

In these cases, commutativity breaks, and the Intent acts as a localized Context Reset.

#### The Gamut Trap

Note that while $ and $ are mathematically orthogonal in the state vector, they are **physically coupled** by the color gamut. At high Chroma, the available range of Lightness is compressed.

### 4.2. Surface Dominance

A Surface ($) resets the local intent. Therefore, an Intent applied _outside_ a surface does not penetrate _into_ the surface's default text.

\text{Inside Surface: } \Phi(S(I(\mathcal{S}))) \neq \Phi(I(S(\mathcal{S})))

- (I(\mathcal{S}))$: The surface resets the intent. The outer intent is lost.
- (S(\mathcal{S}))$: The intent is applied _to_ the surface's context.

**Implication**: You must apply text utilities _inside_ or _on_ the element that needs them.

> **In Plain English**: Surfaces are barriers. If you make a container "subtle", and then put a Card inside it, the text inside the Card goes back to normal. The Card protects its contents from the outside world's text styles.

## 5. Invariants

### 5.1. Contrast Preservation

Modifiers ($) are **Contrast Preserving**.

\text{Contrast}(\Phi(\mathcal{S}), \text{Background}) \approx \text{Contrast}(\Phi(M(\mathcal{S})), \text{Background})

Since $ only changes $ and $, and OKLCH is perceptually uniform, the perceived lightness (and thus contrast against the background) remains constant.

> **In Plain English**: Changing the hue (e.g., adding `.hue-brand`) never breaks accessibility. If the text was readable before, it stays readable, because the system only changes the color, not the brightness.

### 5.2. Intent Stability

Intent ($) is **Chromatically Transparent**.

\text{Hue}(\Phi(I(\mathcal{S}))) = \text{Hue}(\Phi(\mathcal{S}))

Changing the text importance (High -> Subtle) never shifts the hue.

> **In Plain English**: Changing the text style (e.g., making it `.text-subtle`) never changes its color family. If you are in a "Brand" section, the subtle text will still be tinted with the brand color, just dimmer. The text style doesn't "reset" the color to gray.

## 6. Derived Theorems

### 6.1. Theorem A: The Saturation Limit (The Depth Theorem)

Since the Resolution Function $\Phi$ maps to a bounded color space, there exists a limit to nesting modifiers. If $ is a contrast-reducing function (e.g., `opacity: 0.5`), there exists a depth $ where:

$$ |\Phi(m^n(\gamma), i\*a) - \Phi(m^n(\gamma), i\*b)| < \epsilon\\\_{visual} $$

**Plain English**: "The Fade-Out Limit." If you nest "Subtle" contexts too deeply, the system mathematically guarantees that text becomes illegible.

### 6.2. Theorem B: The Irreversibility Principle

\Phi^{-1}(\text{Color}) \text{ is undefined.}

You cannot look at a pixel (e.g., `#334455`) and mathematically derive the State $\mathcal{S}$ that produced it. (Is it a Dark Token in Light Mode? Or a Light Token in Dark Mode?).

**Practical Consequence**: State must flow strictly **Top-Down**. You cannot "read" the design system from the computed styles; you can only write to it.

## 7. Implications & Corollaries

### 7.1. Idempotency of Modifiers

Applying the same modifier twice is equivalent to applying it once.

M\_{brand}(M\_{brand}(\mathcal{S})) \equiv M\\\_{brand}(\mathcal{S})

This means nesting a `.hue-brand` section inside another `.hue-brand` section is safe and redundant.

### 7.2. The "Leakage" Corollary

In a Glass Universe, all nested Contexts are additive. Visual isolation can only be achieved by the explicit application of an Opaque Surface ({solid}$), which acts as a Context Reset.

\text{Container}(I\\\_{subtle}(\mathcal{S})) \rightarrow \text{Text is still subtle inside}

This distinguishes **Layout Containers** (divs, spans) from **Surfaces** (cards, sidebars). Surfaces are opaque boundaries for Intent; Containers are transparent.

### 7.3. Universal Theming

Since $ operators control the environment (, C$) for all child elements, changing the top-level modifier effectively re-themes the entire subtree without requiring changes to the leaf nodes (text, borders).

### 7.4. The Portal Effect (Subspace Involution)

Because Inverted Surfaces perform a Hard Flip ($\rho' = \neg \rho$), nesting them creates an alternating polarity stack. However, because $ is lossy on Intent ($), this is not a true inverse of the state.

S\_{inv}(S\_{inv}(\mathcal{S})) \neq \mathcal{S}

While the polarity returns to the original ($\neg(\neg \rho) = \rho$), the Intent {src}$ is reset to {high}$ at each step. You recover the _mode_, but you lose the _semantic context_.
