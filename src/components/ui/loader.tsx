"use client"

const LETTERS = ["G", "R", "N", "D", "u", "P"]

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <style>{`
        @keyframes cubeRotate {
          0%   { transform: rotateX(0deg)  rotateY(0deg); }
          25%  { transform: rotateX(90deg) rotateY(0deg); }
          50%  { transform: rotateX(90deg) rotateY(90deg); }
          75%  { transform: rotateX(180deg) rotateY(90deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        @keyframes cubeFaceGlow {
          0%, 100% { opacity: 0.65; }
          50%       { opacity: 1; }
        }
        @keyframes loaderDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        .cube-scene {
          perspective: 140px;
          width: 40px;
          height: 40px;
        }
        .cube-body {
          width: 40px;
          height: 40px;
          position: relative;
          transform-style: preserve-3d;
          animation: cubeRotate 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .cube-face {
          position: absolute;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 900;
          color: #FFD700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid rgba(255, 215, 0, 0.28);
          animation: cubeFaceGlow 2.4s ease-in-out infinite;
          backface-visibility: hidden;
        }
        .cube-face.f-front  { transform: translateZ(20px);               background: rgba(255,215,0,0.12); }
        .cube-face.f-back   { transform: rotateY(180deg) translateZ(20px); background: rgba(255,215,0,0.04); color: transparent; }
        .cube-face.f-right  { transform: rotateY(90deg)  translateZ(20px); background: rgba(255,215,0,0.07); color: transparent; }
        .cube-face.f-left   { transform: rotateY(-90deg) translateZ(20px); background: rgba(255,215,0,0.07); color: transparent; }
        .cube-face.f-top    { transform: rotateX(90deg)  translateZ(20px); background: rgba(255,215,0,0.09); color: transparent; }
        .cube-face.f-bottom { transform: rotateX(-90deg) translateZ(20px); background: rgba(255,215,0,0.04); color: transparent; }
        .loader-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #FFD700;
          animation: loaderDot 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Cube row */}
      <div className="flex items-center gap-2.5">
        {LETTERS.map((letter, i) => (
          <div key={i} className="cube-scene">
            <div
              className="cube-body"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="cube-face f-front">{letter}</div>
              <div className="cube-face f-back" />
              <div className="cube-face f-right" />
              <div className="cube-face f-left" />
              <div className="cube-face f-top" />
              <div className="cube-face f-bottom" />
            </div>
          </div>
        ))}
      </div>

      {/* Dot pulse row */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="loader-dot"
            style={{ animationDelay: `${i * 0.2}s`, opacity: 0.3 }}
          />
        ))}
      </div>
    </div>
  )
}
