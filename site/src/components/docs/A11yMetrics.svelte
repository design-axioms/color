<script lang="ts">
  export let apca: number;
  export let wcag: string;
  export let align: "start" | "end" = "start";
</script>

<div class="metric" class:align-end={align === "end"}>
  <span class="metric-label font-mono text-subtle">APCA Target</span>
  <span
    class="metric-value badge-apca font-mono text-strong surface-card bordered"
    >L<sup>c</sup> &approx; {apca}</span
  >
</div>

<div class="metric" class:align-end={align === "end"}>
  <span class="metric-label font-mono text-subtle">WCAG Equiv.</span>
  <span
    class="metric-value badge-wcag font-mono text-strong surface-status-success bordered"
    >{wcag}</span
  >
</div>

<style>
  .metric {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: flex-start;
  }

  .metric.align-end {
    align-items: flex-end;
  }

  .metric-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .metric-value {
    font-size: 0.9rem;
  }

  .badge-apca {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .badge-wcag {
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.85rem;
  }
</style>
