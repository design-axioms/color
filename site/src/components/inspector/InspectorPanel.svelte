<script lang="ts">
  let { element, onClose } = $props<{ 
    element: HTMLElement, 
    onClose: () => void 
  }>();

  type TokenGroup = {
    title: string;
    tokens: { name: string, value: string }[];
  };

  let groups = $state<TokenGroup[]>([]);

  const GROUPS = [
    {
      title: 'Surface',
      names: ['--surface-token', '--surface-page-token']
    },
    {
      title: 'Text',
      names: ['--text-high-token', '--text-strong-token', '--text-subtle-token', '--text-subtlest-token']
    },
    {
      title: 'Border & UI',
      names: ['--border-subtle-token', '--focus-ring-color']
    }
  ];

  $effect(() => {
    if (!element) return;
    
    const computed = getComputedStyle(element);
    
    groups = GROUPS.map(group => ({
      title: group.title,
      tokens: group.names.map(name => ({
        name,
        value: computed.getPropertyValue(name).trim() || '(not set)'
      }))
    }));
  });
</script>

<div class="inspector-panel">
  <div class="header">
    <h4 class="title">Token Inspector</h4>
    <button class="close-btn" onclick={onClose} aria-label="Close inspector">
      &times;
    </button>
  </div>
  
  <div class="tokens-container">
    {#each groups as group}
      <div class="group-section">
        <div class="group-title">{group.title}</div>
        <div class="tokens-grid">
          {#each group.tokens as token}
            <div class="token-row">
              <span class="token-name">{token.name}</span>
              <code class="token-value">{token.value}</code>
              <div class="color-preview" style:background-color={token.value}></div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .inspector-panel {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface-token);
    border-top: 1px solid var(--border-subtle-token);
    padding: 1rem;
    box-shadow: var(--shadow-xl);
    z-index: 100;
    animation: slide-up 0.2s ease-out;
    max-height: 50vh;
    overflow-y: auto;
  }

  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-subtle-token);
    position: sticky;
    top: -1rem; /* Compensate for padding */
    background: var(--surface-token);
    z-index: 10;
    margin-top: -0.5rem;
    padding-top: 0.5rem;
  }

  .title {
    margin: 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-subtle-token);
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--text-subtle-token);
    cursor: pointer;
    padding: 0 0.5rem;
  }
  
  .close-btn:hover {
    color: var(--text-high-token);
  }
  
  .tokens-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .group-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-subtle-token);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }
  
  .tokens-grid {
    display: grid;
    gap: 0.5rem;
  }
  
  .token-row {
    display: grid;
    grid-template-columns: 1fr 2fr 24px;
    align-items: center;
    gap: 1rem;
    font-size: 0.85rem;
  }

  .token-name {
    color: var(--text-subtle-token);
    font-family: monospace;
  }

  .token-value {
    color: var(--text-high-token);
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid var(--border-subtle-token);
  }
</style>
