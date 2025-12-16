<script>
  const fonts = [
    { name: "Latin Modern Math", family: '"Latin Modern Math", serif' },
    { name: "STIX Two Math", family: '"STIX Two Math", serif' },
    { name: "Libertinus Math", family: '"Libertinus Math", serif' },
    { name: "TeX Gyre Pagella", family: '"TeX Gyre Pagella Math", serif' },
    { name: "TeX Gyre Termes", family: '"TeX Gyre Termes Math", serif' },
    { name: "Garamond Math", family: '"Garamond Math", serif' },
    { name: "Erewhon Math", family: '"Erewhon Math", serif' },
    { name: "Asana Math", family: '"Asana Math", serif' },
    { name: "XITS Math", family: '"XITS Math", serif' },
    { name: "KpMath", family: '"KpMath", serif' },
    { name: "Neo Euler", family: '"Neo Euler", serif' },
    { name: "Pennstander Math", family: '"Pennstander Math", serif' },
    { name: "Fira Math (Sans)", family: '"Fira Math", sans-serif' },
  ];
</script>

<div class="font-comparison-grid">
  {#each fonts as font (font.name)}
    <div class="font-card surface-card bordered">
      <div class="font-label text-subtle">{font.name}</div>
      <div class="math-preview" style="font-family: {font.family};">
        <math display="block">
          <mrow>
            <mi mathvariant="normal">Σ</mi>
            <mo>=</mo>
            <mo stretchy="false">⟨</mo>
            <mi>H</mi>
            <mo>,</mo>
            <mi>C</mi>
            <mo>,</mo>
            <msub>
              <mi>L</mi>
              <mi mathvariant="italic">src</mi>
            </msub>
            <mo>,</mo>
            <mi>α</mi>
            <mo stretchy="false">⟩</mo>
          </mrow>
        </math>
        <math display="block">
          <mrow>
            <mi mathvariant="normal">Φ</mi>
            <mo stretchy="false">(</mo>
            <mi mathvariant="normal">Σ</mi>
            <mo stretchy="false">)</mo>
            <mo stretchy="false">↦</mo>
            <mtext>ColorSpace</mtext>
            <mo stretchy="false">(</mo>
            <mtext>oklch</mtext>
            <mo stretchy="false">)</mo>
          </mrow>
        </math>
      </div>
    </div>
  {/each}
</div>

<style>
  .font-comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .font-card {
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .font-label {
    position: relative;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }

  .font-label::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: currentColor;
    opacity: 0.12;
  }

  .math-preview {
    font-size: 1.25em;
    text-align: center;
  }

  /* Override global math styles to force the specific font for this preview */
  .math-preview :global(math) {
    font-family: inherit !important;
  }
</style>
