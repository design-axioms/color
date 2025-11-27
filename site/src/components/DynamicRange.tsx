
export const DynamicRange = () => {
  return (
    <div className="docs-grid docs-mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
      <RangeCard
        title="Light Mode (Dimming)"
        description="Page starts bright. Surfaces get darker to create separation."
        mode="light"
      />
      <RangeCard
        title="Dark Mode (Illumination)"
        description="Page starts dark. Surfaces get lighter to approach the light source."
        mode="dark"
      />
    </div>
  );
};

const RangeCard = ({ title, description, mode }: { title: string, description: string, mode: 'light' | 'dark' }) => {
  const isLight = mode === 'light';
  
  // Colors
  const borderColor = isLight ? 'var(--sl-color-gray-5)' : 'var(--sl-color-gray-5)';
  const textColor = isLight ? 'var(--sl-color-text)' : 'var(--sl-color-text)';
  const subtleColor = 'var(--sl-color-text-gray)';
  
  // Surfaces
  const surfaces = isLight 
    ? [
        { name: 'Page', l: '100%', color: '#ffffff', border: '#e5e5e5', text: '#000' },
        { name: 'Card', l: '95%', color: '#f5f5f5', border: '#e5e5e5', text: '#000' },
        { name: 'Sidebar', l: '90%', color: '#e5e5e5', border: '#d4d4d4', text: '#000' },
      ]
    : [
        { name: 'Sidebar', l: '25%', color: '#333333', border: '#444444', text: '#fff' },
        { name: 'Card', l: '18%', color: '#262626', border: '#404040', text: '#fff' },
        { name: 'Page', l: '10%', color: '#1a1a1a', border: '#333333', text: '#fff' },
      ];

  return (
    <div className="docs-card" style={{ 
      border: `1px solid ${borderColor}`, 
      borderRadius: '8px', 
      overflow: 'hidden', 
      background: 'var(--sl-color-bg-nav)',
      boxShadow: 'var(--sl-shadow-sm)'
    }}>
      <div style={{ padding: '1rem', borderBottom: `1px solid ${borderColor}` }}>
        <strong style={{ display: 'block', marginBottom: '0.5rem', color: textColor }}>{title}</strong>
        <p style={{ margin: 0, fontSize: '0.9em', color: subtleColor, lineHeight: 1.4 }}>{description}</p>
      </div>
      
      <div style={{ position: 'relative', height: '220px', background: isLight ? '#fafafa' : '#0a0a0a', padding: '2rem' }}>
        {/* Range Indicator Line */}
        <div style={{ 
          position: 'absolute', 
          left: '1.5rem', 
          top: '2.5rem', 
          bottom: '2.5rem', 
          width: '4px', 
          background: `linear-gradient(to bottom, ${surfaces[0].color}, ${surfaces[surfaces.length-1].color})`,
          borderRadius: '2px',
          border: `1px solid ${borderColor}`
        }} />

        {/* Anchors Labels */}
        <div style={{ position: 'absolute', left: '2.5rem', top: '2rem', fontSize: '0.75em', fontWeight: 'bold', color: subtleColor, fontFamily: 'var(--sl-font-mono)' }}>
          {isLight ? 'Start (100%)' : 'End (25%)'}
        </div>
        <div style={{ position: 'absolute', left: '2.5rem', bottom: '2rem', fontSize: '0.75em', fontWeight: 'bold', color: subtleColor, fontFamily: 'var(--sl-font-mono)' }}>
          {isLight ? 'End (90%)' : 'Start (10%)'}
        </div>

        {/* Stack Visualization */}
        <div style={{ 
          marginLeft: '5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          {surfaces.map((s, i) => (
            <div key={i} style={{
              background: s.color,
              border: `1px solid ${s.border}`,
              borderRadius: '6px',
              padding: '0 1rem',
              color: s.text,
              fontSize: '0.85em',
              fontWeight: 500,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1
            }}>
              <span>{s.name}</span>
              <span style={{ opacity: 0.5, fontSize: '0.9em', fontFamily: 'var(--sl-font-mono)' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
