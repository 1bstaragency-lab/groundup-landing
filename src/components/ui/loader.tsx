"use client"

// Adapted from ravikatiyar162/loader — 3D rotating cube "LOADING" letters
// Brand color: #FFD700 gold highlight

const LETTERS = ["L", "O", "A", "D", "I", "N", "G"]

const CSS = `
  :root {
    --highlight-color: #FFD700;
    --cube-color: #00000000;
    --wrapper-bg: #000000;
  }

  .loader-wrapper-grid {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .loader-cube {
    position: relative;
    width: 40px;
    height: 40px;
    transform-style: preserve-3d;
    perspective: 140px;
  }

  .loader-cube-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    animation: loader-translate-z 1.6s ease-in-out infinite;
  }

  .loader-face {
    position: absolute;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.05em;
    border: 1px solid rgba(255, 215, 0, 0.15);
    animation: loader-face-color 1.6s ease-in-out infinite,
               loader-edge-glow  1.6s ease-in-out infinite;
    backface-visibility: hidden;
    background-color: var(--cube-color);
  }

  .loader-face-front  {
    transform: translateZ(20px);
    animation: loader-face-color 1.6s ease-in-out infinite,
               loader-edge-glow  1.6s ease-in-out infinite,
               loader-face-glow  1.6s ease-in-out infinite;
  }
  .loader-face-back   { transform: rotateY(180deg) translateZ(20px); }
  .loader-face-right  { transform: rotateY(90deg)  translateZ(20px); }
  .loader-face-left   { transform: rotateY(-90deg) translateZ(20px); }
  .loader-face-top    { transform: rotateX(90deg)  translateZ(20px); }
  .loader-face-bottom { transform: rotateX(-90deg) translateZ(20px); }

  @keyframes loader-translate-z {
    0%, 40%, 100% { transform: translateZ(-2px); }
    30%           { transform: translateZ(16px) translateY(-1px); }
  }

  @keyframes loader-face-color {
    0%, 50%, 100% { background-color: var(--cube-color); }
    10%           { background-color: var(--highlight-color); }
  }

  @keyframes loader-face-glow {
    0%, 50%, 100% { color: rgba(255,255,255,0); filter: none; }
    30%           { color: #fff; filter: drop-shadow(0 14px 10px var(--highlight-color)); }
  }

  @keyframes loader-edge-glow {
    0%, 40%, 100% {
      box-shadow: inset 0 0 2px 1px rgba(0,0,0,0.07),
                  inset 0 0 12px 1px rgba(255,255,255,0.07);
    }
    30% {
      box-shadow: 0 0 2px 0px var(--highlight-color);
    }
  }
`

function Cube({ letter, delay }: { letter: string; delay: string }) {
  return (
    <div className="loader-cube">
      <div className="loader-cube-inner" style={{ animationDelay: delay }}>
        <div className="loader-face loader-face-front" style={{ animationDelay: delay }}>{letter}</div>
        <div className="loader-face loader-face-back"   style={{ animationDelay: delay }} />
        <div className="loader-face loader-face-right"  style={{ animationDelay: delay }} />
        <div className="loader-face loader-face-left"   style={{ animationDelay: delay }} />
        <div className="loader-face loader-face-top"    style={{ animationDelay: delay }} />
        <div className="loader-face loader-face-bottom" style={{ animationDelay: delay }} />
      </div>
    </div>
  )
}

export function Loader() {
  return (
    <>
      <style>{CSS}</style>
      <div className="loader-wrapper-grid">
        {LETTERS.map((letter, i) => (
          <Cube key={i} letter={letter} delay={`${i * 0.1}s`} />
        ))}
      </div>
    </>
  )
}
