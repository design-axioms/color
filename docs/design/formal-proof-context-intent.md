# Formal Derivation: Color as a Function of Context and Intent

> **Context**: An algebraic derivation showing how the system's state space supports the high-level intuition `Color = f(Context, Intent)`.

## 1. Proposition

The Axiomatic Color system posits that a resolved color is a pure function of two independent variables: **Context** (the environment) and **Intent** (the semantic role).

$$ \text{Color} = f(\text{Context}, \text{Intent}) $$

This document derives this property from the definitions in [The Algebra of Color Design](./composition-algebra.md).

## 2. State Space Decomposition

Let the system state $\mathcal{S}$ be defined as the **Configuration Space** of two subspaces: Context ($\Gamma$) and Intent ($\iota$).

$$ \mathcal{S} = \Gamma \times \iota $$

### 2.1. The Subspaces

1.  **Context Space ($\Gamma$)**: The environmental variables.
    $$ \Gamma = \text{Hue} \times \text{Chroma} \times \text{Polarity} $$
    $$ \gamma \in \Gamma = \langle H, C, \rho \rangle $$

2.  **Intent Space ($\iota$)**: The semantic variables.
    $$ \iota = \text{Tokens} $$
    $$ i \in \iota = \langle L\\\_{src} \rangle $$

Thus, any state $\sigma \in \mathcal{S}$ is an ordered pair:
$$ \sigma = (\gamma, i) $$

> **In Plain English**: We are splitting the system's "DNA" into two separate strands.
>
> - **Context ($\Gamma$)**: The "Atmosphere" (Lighting, Mode).
> - **Intent ($\iota$)**: The "Meaning" (Text Importance).
>
> This separation allows us to change the lighting without changing the meaning, and vice versa.

## 3. The Resolution Function ($\Phi$)

The CSS Engine's resolution function $\Phi$ maps the state $\mathcal{S}$ to a color space (OKLCH).

$$ \Phi: (\Gamma \times \iota) \rightarrow \text{Color} $$

$$ \Phi(\langle H, C, \rho \rangle, \langle L\_{src} \rangle) = \text{oklch}(\text{eval}(L\_{src}, \rho), C, H) $$

**Observation**: The function $\Phi$ accepts $\gamma$ and $i$ as distinct arguments. The evaluation of lightness $\text{eval}(L\_{src}, \rho)$ is the only interaction term, representing the "Late Binding" of Intent to Context.

> **In Plain English**: The browser takes the two strands (Atmosphere and Meaning) and weaves them together into a pixel. The only time they "talk" to each other is when the system decides how bright the text should be based on whether it's in Light Mode or Dark Mode.

## 4. Derivation of Independence (Orthogonality)

We define the system operators as transformations on $\mathcal{S}$. To prove independence, we must show that Modifiers ($M$) and Intents ($I$) operate on disjoint subspaces.

### 4.1. Operator Definitions

Let $M$ be a modifier function acting on $\Gamma$, and $I$ be an intent function acting on $\iota$.

$$ M(\gamma, i) = (m(\gamma), i) $$
$$ I(\gamma, i) = (\gamma, k(i)) $$

Where $m: \Gamma \rightarrow \Gamma$ and $k: \iota \rightarrow \iota$ are the specific transformations (e.g., "Set Hue to Brand", "Set Token to Subtle").

### 4.2. Commutativity Proof (General Case)

We examine the composition of these operators in both orders for **Neutral Intents**.

**Case 1: Intent then Modifier ($M \circ I$)**
$$ M(I(\gamma, i)) = M(\gamma, k(i)) = (m(\gamma), k(i)) $$

**Case 2: Modifier then Intent ($I \circ M$)**
$$ I(M(\gamma, i)) = I(m(\gamma), i) = (m(\gamma), k(i)) $$

**Result**:
$$ M \circ I \equiv I \circ M $$

**Conclusion**: For Neutral Intents, the operators commute, and the subspaces $\Gamma$ and $\iota$ are orthogonal.

> **In Plain English**: Because "Subtle Text" only changes Lightness, and "Brand Theme" only changes Color, the order doesn't matter.
>
> - `class="text-subtle hue-brand"`
> - `class="hue-brand text-subtle"`
>
> Both result in "Subtle Brand-Colored Text."

### 4.3. The Semantic Exception

For **Chromatic Intents** (e.g., Error), the Intent function $I\_{chromatic}$ acts on _both_ subspaces to enforce semantic meaning.

$$ I\_{chromatic}(\gamma, i) = (\gamma\_{override}, k(i)) $$

In this case, commutativity is broken ($M \circ I \neq I \circ M$), and the Intent dominates the Context.

> **In Plain English**: An Error Message is _always_ Red. It doesn't care if the room is lit with Blue light. The "Error" intent shouts over the ambient lighting, effectively resetting the local atmosphere to Red.

## 5. Surface Scoping

The **Surface Operator** ($S$) is a special transformation that acts on both subspaces.

### 5.1 Glass Surface ($S\_{glass}$)

Preserves Context, Resets Intent.
$$ S\_{glass}(\gamma, i) = (\gamma, i\_{reset}) $$

### 5.2 Solid Surface ($S\_{solid}$)

Resets Context, Resets Intent.
$$ S\_{solid}(\gamma, i) = (\gamma\_{neutral}, i\\\_{reset}) $$

## 6. Summary

By modeling the state $\mathcal{S}$ as the product $\Gamma \times \iota$, we have derived that:

1.  **Separability**: The resolution function $\Phi$ is defined over the pair $(\gamma, i)$.
2.  **Independence**: Operations on $\Gamma$ and $\iota$ are commutative (except for Semantic Dominance).
3.  **Scoping**: Surfaces act as filters that reset $\iota$, and optionally reset $\Gamma$ (if Solid).

This confirms that `Color = f(Context, Intent)` is structurally enforced by the algebra.
