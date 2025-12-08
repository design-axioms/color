# Formal Derivation: Color as a Function of Context and Intent

> **Context**: An algebraic derivation showing how the system's state tuple supports the high-level intuition `Color = f(Context, Intent)`.
> **See Also**: [Corollaries & Emergent Properties](./corollaries.md) for practical implications of this algebra.

## 1. Proposition

The Axiomatic Color system posits that a resolved color is a pure function of two independent domains: **Context** (the environment) and **Intent** (the semantic role).

$$ \text{Color} = \Phi(\text{Context}, \text{Intent}) $$

This document derives this property from the definitions in [The Algebra of Continuous Color Design](../composition-algebra.md).

## 2. State Space Decomposition

Let the system state $\Sigma$ be defined as the **Configuration Space** of two subspaces: Context ($\mathcal{C}$) and Intent ($\mathcal{I}$).

$$ \Sigma = \mathcal{C} \times \mathcal{I} $$

### 2.1. The Subspaces

1.  **Context Space ($\mathcal{C}$)**: The environmental physics.
    This combines the **Atmosphere** (Space) and **Time** (Global Cycle).
    $$ \mathcal{C} = \text{Atmosphere} \times \text{Time} $$
    $$ c \in \mathcal{C} = \langle \alpha, \tau \rangle $$

2.  **Intent Space ($\mathcal{I}$)**: The semantic variables.
    This contains the **Voice** (The actor's script).
    $$ \mathcal{I} = \text{Voice} $$
    $$ i \in \mathcal{I} = \langle \nu \rangle $$

Thus, any state $\Sigma$ is an ordered tuple:
$$ \Sigma = (\langle \alpha, \tau \rangle, \nu) $$

> **In Plain English**: We split the "DNA" into the **Stage** and the **Actor**.
>
> - **Context ($\alpha, \tau$)**: "It is a Blue Room ($\alpha$) at Night ($\tau$)."
> - **Intent ($\nu$)**: "I am speaking Softly ($\nu$)."
>
> The Actor ($\nu$) does not control the Lights ($\alpha$) or the Clock ($\tau$).

## 3. The Resolution Function ($\Phi$)

The CSS Engine's resolution function $\Phi$ maps the state $\Sigma$ to a color space (OKLCH).

$$ \Phi: (\mathcal{C} \times \mathcal{I}) \rightarrow \text{Color} $$

$$ \Phi(\langle \alpha, \tau \rangle, \nu) = \text{oklch}( \underbrace{\text{Lerp}(\nu, \tau)}_{\text{Lightness}}, \underbrace{\text{Limit}(\alpha, \tau)}_{\text{Chroma}}, \underbrace{H_{\alpha}}_{\text{Hue}} ) $$

**Observation**:

1.  **Lightness** is a function of Voice and Time ($L = f(\nu, \tau)$).
2.  **Chroma** is a function of Atmosphere and Time ($C = f(\alpha, \tau)$).
3.  **Hue** is a function of Atmosphere only ($H = f(\alpha)$).

Crucially, **Voice ($\nu$) and Atmosphere ($\alpha$) never interact.** They are mediated only by the shared global Time ($\tau$).

> **In Plain English**: The browser takes the **Stage** and the **Script** and renders the frame. The only thing connecting them is the **Time of Day** (which affects how the stage looks _and_ how bright the actor needs to be to be seen).

## 4. Derivation of Independence (Orthogonality)

We define the system operators as transformations on $\Sigma$. To prove independence, we must show that Moods ($M$) and Voices ($V$) operate on disjoint subspaces.

### 4.1. Operator Definitions

Let $M$ be a Mood function acting on $\alpha$, and $V$ be a Voice function acting on $\nu$.

$$ M(\langle \alpha, \tau \rangle, \nu) = (\langle m(\alpha), \tau \rangle, \nu) $$
$$ V(\langle \alpha, \tau \rangle, \nu) = (\langle \alpha, \tau \rangle, k(\nu)) $$

Where $m$ sets the Vibrancy Coefficient $\beta$, and $k$ sets the Token Reference.

### 4.2. Commutativity Proof

We examine the composition of these operators in both orders.

**Case 1: Voice then Mood ($M \circ V$)**
$$ M(V(\Sigma)) = M(\langle \alpha, \tau \rangle, k(\nu)) = (\langle m(\alpha), \tau \rangle, k(\nu)) $$

**Case 2: Mood then Voice ($V \circ M$)**
$$ V(M(\Sigma)) = V(\langle m(\alpha), \tau \rangle, \nu) = (\langle m(\alpha), \tau \rangle, k(\nu)) $$

**Result**:
$$ M \circ V \equiv V \circ M $$

**Conclusion**: The operators commute. The "Atmosphere" and the "Voice" are orthogonal.

> **In Plain English**:
>
> - `class="text-subtle hue-brand"`
> - `class="hue-brand text-subtle"`
>
> Both result in "Subtle text in a Brand atmosphere." The order doesn't matter because they touch different parts of the tuple.

## 5. Surface Scoping

The **Surface Operator** ($S$) is the topological boundary that acts on the _interaction_ between the subspaces.

### 5.1 Glass Surface ($S_{glass}$)

1.  **Dampens Atmosphere**: Constrains $\alpha$ using the Bicone Limit (based on Time).
2.  **Resets Voice**: Forces $\nu$ to default.

$$ S_{glass}(\langle \alpha, \tau \rangle, \nu) = (\langle \text{Dampen}(\alpha, \tau), \tau \rangle, \nu_{reset}) $$

### 5.2 Solid Surface ($S_{solid}$)

1.  **Replaces Atmosphere**: Establishes a new $\alpha$.
2.  **Resets Voice**: Forces $\nu$ to a new default.

$$ S_{solid}(\langle \alpha, \tau \rangle, \nu) = (\langle \alpha_{new}, \tau \rangle, \nu_{new}) $$

## 6. Summary

By modeling the state $\Sigma$ as the tuple $\langle \alpha, \nu, \tau \rangle$, we have derived that:

1.  **Separability**: The resolution function combines Context ($\alpha, \tau$) and Intent ($\nu$) only at the final projection step.
2.  **Independence**: Changing the Atmosphere ($\alpha$) never changes the semantic meaning ($\nu$).
3.  **Mediated Coupling**: Atmosphere and Voice are coupled only by Time ($\tau$), ensuring that both the background and the text react synchronously to Day/Night transitions.

This confirms that `Color = f(Context, Intent)` is structurally enforced by the algebra.
