# Appendix: Pedagogical Mapping

> **Context**: A translation layer between the rigorous internal algebra and the user-facing mental models.

The Axiomatic Color system uses a rigorous mathematical model ("The Grand Unified Algebra") to guarantee correctness. However, teaching this algebra directly can be alienating.

We use a set of **Pedagogical Metaphors** to make the system intuitive without sacrificing accuracy.

## The Core Metaphor: Signal Processing

We frame the UI not as a static painting, but as a **Signal Processing System**.

| Internal Algebra ($\Sigma$) | Pedagogical Term | The Metaphor                                                       |
| :-------------------------- | :--------------- | :----------------------------------------------------------------- |
| **Atmosphere ($\alpha$)**   | **Context**      | The "Weather" of the room. It permeates everything.                |
| **Voice ($\nu$)**           | **Content**      | The "Speaker". They can whisper (Subtle) or shout (High).          |
| **Gain ($\gamma$)**         | **Contrast**     | The "Volume Knob". High Contrast Mode amplifies the signal.        |
| **Solar Time ($\tau$)**     | **Mode**         | The "Sun". Light/Dark is a continuous cycle, not a binary switch.  |
| **System ($\sigma$)**       | **X-Ray**        | The "Skeleton". Forced Colors strips the skin to reveal structure. |

## Detailed Mappings

### 1. Time vs. Polarity

- **Math**: $\tau \in [-1, 1]$ (Continuous Scalar).
- **Old Term**: Polarity (Binary Switch).
- **New Term**: **Solar Time**.
- **Why**: "Polarity" implies a hard flip. "Solar Time" implies a cycle with a transition state (Twilight). This justifies the need for the **Tunnel** (safety during transition).

### 2. Taper vs. Gamut Limits

- **Math**: $1 - |2L - 1|$ (Linear Bicone).
- **Old Term**: Anchors / Rubber Band.
- **New Term**: **The Taper**.
- **Why**: "Rubber Band" implies simple stretching. "Taper" correctly implies that as you get closer to Black/White, your ability to carry color (Chroma) diminishes. It explains _why_ you can't have "Neon Black".

### 3. Tunnel vs. Interpolation

- **Math**: $\tau^2$ (Quadratic Ease).
- **Old Term**: N/A (Implicit).
- **New Term**: **The Tunnel**.
- **Why**: We need a name for the safety mechanism that kicks in at Twilight ($\tau=0$). "Tunnel" implies a shielded passage through the dangerous gray zone.

### 4. X-Ray vs. Forced Colors

- **Math**: Topology Transformation (Area $\to$ Border).
- **Term**: **X-Ray Mode**.
- **Why**: "Forced Colors" is a technical OS term. "X-Ray" describes the _visual result_: the skin is gone, and you see the bones (borders). It helps designers understand why "Hollow State" is the default fallback.
