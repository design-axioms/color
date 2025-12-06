import { tokens } from "./theme";

export function Card() {
  return (
    <div
      className={tokens.surface.card}
      style={{ padding: "2rem", borderRadius: "8px" }}
    >
      <h2 style={{ color: tokens.context.text.high }}>Hello World</h2>
      <p style={{ color: tokens.context.text.subtle }}>I am a themed card.</p>
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <Card />
    </div>
  )
}

export default App
