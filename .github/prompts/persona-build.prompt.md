---
agent: agent
description: This prompt is used to define or refine a user persona for the project.
---

### Building a Persona

You are helping the user define a new persona or refine an existing one for the project. This persona will be used to guide design decisions and documentation.

**Goal**: Create a detailed profile that captures the user's mindset, needs, and pain points.

**Instructions**:

1.  **Ask Clarifying Questions**: If the user provides a vague description (e.g., "a beginner"), ask specific questions to narrow it down:
    - What is their technical background? (e.g., "Knows Python but new to Rust", "Complete programming novice")
    - What are they trying to build? (e.g., "A configuration file parser", "A full programming language")
    - What are their biggest fears? (e.g., "Compiler errors", "Complex terminology")

2.  **Draft the Persona**: Once you have enough information, draft a persona entry in the following format:
    - **Name**: A catchy title (e.g., "The Pragmatist").
    - **Description**: A brief summary of who they are.
    - **Needs**: What do they need from the project? (e.g., "Clear examples", "Robust error recovery")
    - **Frustrations**: What drives them away? (e.g., "Boilerplate", "Abstract theory")
    - **Focus**: What specific aspects of the project should we focus on for them?

3.  **Update Documentation**:
    - Once the user approves the draft, add it to `${workspaceFolder}/docs/design/personas.md`.
