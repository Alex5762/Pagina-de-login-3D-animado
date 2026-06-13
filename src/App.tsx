import React, { useState, useEffect, useRef } from 'react';

type PersonalityType = 'balanced' | 'hyper' | 'sleepy' | 'chill' | 'observant';

interface MascotProps {
  mousePos: { x: number; y: number };
  isUsernameFocused: boolean;
  isPasswordFocused: boolean;
  hasError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  containerClass: string;
  eyeSizeClass: string;
  pupilSizeClass: string;
  handSizeClass: string;
  handColorClass: string;
  delayOffset: number;
  coverOffset?: string;
  eyeSpacing?: string;
  personality?: PersonalityType;
  usernameLength?: number;
}

const PERSONALITIES: Record<PersonalityType, {
  idleBase: number;
  idleRandom: number;
  blinkBase: number;
  blinkRandom: number;
  preferredActions: Array<'yawn' | 'nod' | 'sway'>;
}> = {
  balanced: { idleBase: 4000, idleRandom: 4000, blinkBase: 2000, blinkRandom: 4000, preferredActions: ['yawn', 'nod', 'sway'] },
  hyper: { idleBase: 2000, idleRandom: 2000, blinkBase: 1000, blinkRandom: 2000, preferredActions: ['sway', 'sway', 'nod'] },
  sleepy: { idleBase: 3500, idleRandom: 3000, blinkBase: 4000, blinkRandom: 4000, preferredActions: ['yawn', 'nod', 'yawn'] },
  chill: { idleBase: 5000, idleRandom: 5000, blinkBase: 3000, blinkRandom: 3000, preferredActions: ['sway', 'yawn'] },
  observant: { idleBase: 4500, idleRandom: 2000, blinkBase: 1500, blinkRandom: 2000, preferredActions: ['sway', 'nod', 'nod'] }
};

function Mascot({
  mousePos,
  isUsernameFocused,
  isPasswordFocused,
  hasError,
  isSuccess,
  isIdle,
  containerClass,
  eyeSizeClass,
  pupilSizeClass,
  handSizeClass,
  handColorClass,
  delayOffset,
  coverOffset = "-4rem",
  eyeSpacing = "gap-4",
  personality = "balanced",
  usernameLength = 0
}: MascotProps) {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [idleAction, setIdleAction] = useState<'none' | 'yawn' | 'nod' | 'sway'>('none');
  const [isHovered, setIsHovered] = useState(false);
  const [isSurprised, setIsSurprised] = useState(false);

  const handleInteract = () => {
    if (isSurprised) return;
    setIsSurprised(true);
    setIdleAction('none');
    setTimeout(() => setIsSurprised(false), 1500);
  };

  useEffect(() => {
    if (!isIdle || isUsernameFocused || isPasswordFocused || hasError || isSuccess) {
      setIdleAction('none');
      return;
    }
    
    let timer: ReturnType<typeof setTimeout>;
    const pConfig = PERSONALITIES[personality];
    
    const triggerAction = () => {
       const randomAction = pConfig.preferredActions[Math.floor(Math.random() * pConfig.preferredActions.length)];
       setIdleAction(randomAction);
       
       const duration = randomAction === 'yawn' ? 2500 : (randomAction === 'nod' ? 2500 : 3500);
       setTimeout(() => setIdleAction('none'), duration);
       
       timer = setTimeout(triggerAction, Math.random() * pConfig.idleRandom + pConfig.idleBase + duration);
    };
    
    timer = setTimeout(triggerAction, Math.random() * 2000 + 1000); // Initial offset
    
    return () => clearTimeout(timer);
  }, [isIdle, isUsernameFocused, isPasswordFocused, hasError, isSuccess, personality]);

  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;
    const pConfig = PERSONALITIES[personality];
    
    const triggerBlink = () => {
      setIsBlinking(true);
      resetTimer = setTimeout(() => setIsBlinking(false), 150); // fast blink close/open
      blinkTimer = setTimeout(triggerBlink, Math.random() * pConfig.blinkRandom + pConfig.blinkBase);
    };
    
    blinkTimer = setTimeout(triggerBlink, Math.random() * 3000 + 1000);
    
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(resetTimer);
    };
  }, [personality]);

  const calcTransform = (eyeRef: React.RefObject<HTMLDivElement | null>) => {
    if (isSurprised) return { transform: 'translate(0, 0) scale(0.6)', animation: 'none' };
    if (isPasswordFocused) {
      if (personality === 'observant') {
        return { transform: 'translate(0, 10%)', animation: 'none' };
      }
      return { transform: 'translate(0, 0)', animation: 'none' };
    }
    if (isUsernameFocused) {
      const offset = Math.min(Math.max((usernameLength * 0.8) - 10, -10), 10);
      return { transform: `translate(${offset}px, 4px)`, animation: 'none' };
    }
    if (idleAction === 'sway') {
      return { transform: 'translate(0, 0)', animation: 'dartEyesAnim 3.5s infinite ease-in-out' };
    }

    if (!eyeRef.current) return { transform: 'translate(0, 0)', animation: 'none' };

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const angle = Math.atan2(mousePos.y - eyeCenterY, mousePos.x - eyeCenterX);
    const distanceToMouse = Math.hypot(mousePos.x - eyeCenterX, mousePos.y - eyeCenterY);
    
    // Ensure pupil doesn't leave the orbit
    const limit = (eye.width / 2) - (eye.width * 0.2); 
    const distance = Math.min(distanceToMouse / 5, limit > 0 ? limit : 0);

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { transform: `translate(${x}px, ${y}px)`, animation: 'none' };
  };

  const isAngry = hasError && (personality === 'balanced' || personality === 'observant');
  const isLaughing = hasError && personality === 'hyper';
  const isAsleepErr = hasError && personality === 'sleepy';
  const isUnfazed = hasError && personality === 'chill';

  let idleAnimation = `breatheAnim 3s ease-in-out infinite ${delayOffset}s`;
  if (idleAction === 'yawn') idleAnimation = 'stretchAnim 2.5s ease-in-out';
  else if (idleAction === 'nod') idleAnimation = 'nodAnim 2.5s ease-in-out';
  else if (idleAction === 'sway') idleAnimation = 'swayAnim 3.5s ease-in-out';

  let eyeScaleClass = 'scale-y-100 duration-300';
  if (isAsleepErr) eyeScaleClass = 'scale-y-0 duration-500';
  else if (idleAction === 'yawn') eyeScaleClass = 'scale-y-0 duration-500';
  else if (idleAction === 'nod') eyeScaleClass = 'scale-y-0 duration-1000';
  else if (isPasswordFocused) {
    if (personality === 'observant') eyeScaleClass = 'scale-y-[0.3] duration-300';
    else eyeScaleClass = 'scale-y-0 duration-300';
  }
  else if (isLaughing) eyeScaleClass = 'scale-[1.1] scale-y-[0.1] duration-150';
  else if (isBlinking && !isSurprised) eyeScaleClass = 'scale-y-0 duration-75';
  else if (isSurprised) eyeScaleClass = 'scale-[1.3] duration-150';
  else if (isUnfazed) eyeScaleClass = 'scale-y-[0.6] duration-300';

  const getAnimation = () => {
    if (isSurprised) return 'surpriseAnim 1.5s ease-out';
    if (hasError) {
      if (isLaughing) return 'laughAnim 0.3s ease-in-out infinite';
      if (isAsleepErr) return 'nodAnim 3s ease-in-out infinite';
      if (isUnfazed) return 'none';
      return `shakeAnim 0.4s ease-in-out 2 ${delayOffset * 0.5}s`;
    }
    return idleAnimation;
  };

  const getLeftHandTransform = () => {
    if (isPasswordFocused) return `translateY(${coverOffset}) scale(1.1) rotate(15deg)`;
    if (isUsernameFocused) return 'translateY(0)';
    if (idleAction === 'yawn') return 'translateY(-1.5rem) scale(1) rotate(-35deg)';
    return 'translateY(2rem)';
  };

  const getRightHandTransform = () => {
    if (isPasswordFocused) return `translateY(${coverOffset}) scale(1.1) rotate(-15deg)`;
    if (isUsernameFocused) return 'translateY(0)';
    if (idleAction === 'yawn') return 'translateY(-1.5rem) scale(1) rotate(35deg)';
    return 'translateY(2rem)';
  };

  const getMouthClass = () => {
    if (isSurprised) return 'w-[15%] h-[20%] bg-neutral-800 rounded-[50%]';
    if (isPasswordFocused) return 'w-[8%] h-[8%] bg-neutral-800 rounded-[50%]';
    if (idleAction === 'yawn') return 'w-[15%] h-[25%] bg-neutral-800 rounded-[50%]';
    if (isHovered) return 'w-[12%] h-[15%] bg-neutral-800 rounded-[50%]';
    if (hasError) {
      if (isLaughing) return 'w-[25%] h-[25%] bg-neutral-800 rounded-[30%_30%_50%_50%]';
      if (isUnfazed) return 'w-[15%] h-[4px] bg-neutral-800 rounded-full';
      if (isAsleepErr) return 'w-[8%] h-[8%] bg-neutral-800 rounded-[50%]';
      return 'w-[20%] h-[15%] border-t-[4px] border-neutral-700 rounded-t-[100%]';
    }
    return 'w-[20%] h-[15%] border-b-[4px] border-neutral-800 rounded-b-[100%]';
  };

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-700 ease-in-out cursor-pointer ${containerClass} ${eyeSpacing}`}
      style={{
        animation: getAnimation(),
        backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 65%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
        boxShadow: 'inset -12px -15px 30px rgba(0,0,0,0.3), inset 12px 15px 30px rgba(255,255,255,0.5), 0 30px 40px rgba(0,0,0,0.4)',
        transformStyle: 'preserve-3d'
      }}
      onClick={handleInteract}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Left Eye Wrapper */}
      <div className="relative flex items-center justify-center" style={{ transform: 'translateZ(30px)' }}>
        {/* Closed eye curve / Eyebrow */}
        <div className={`absolute w-[90%] h-[5px] bg-neutral-800 transition-all duration-300 z-20 origin-right
          ${(eyeScaleClass.includes('scale-y-0') || eyeScaleClass.includes('scale-y-[0.1]')) && !isAngry ? 'opacity-100 rounded-full top-[50%] -translate-y-1/2' : 
            isAngry ? 'opacity-100 rounded-sm top-[10%] rotate-[20deg]' : 'opacity-0 top-[50%] -translate-y-1/2'}
        `} />
        <div 
          ref={leftEyeRef}
          className={`relative z-10 ${hasError && !isLaughing && !isUnfazed && !isAsleepErr ? 'bg-red-200' : 'bg-gray-50'} rounded-full flex items-center justify-center overflow-hidden transition-colors duration-300 transition-transform origin-center ${eyeScaleClass} ${eyeSizeClass}`}
          style={{ boxShadow: 'inset -2px -4px 6px rgba(0,0,0,0.15), inset 2px 4px 6px rgba(255,255,255,0.9), 0 4px 8px rgba(0,0,0,0.1)' }}
        >
          <div
            className={`bg-black rounded-full ${pupilSizeClass}`}
            style={{
              ...calcTransform(leftEyeRef),
              transition: 'transform 0.15s ease-out'
            }}
          />
        </div>
      </div>

      {/* Right Eye Wrapper */}
      <div className="relative flex items-center justify-center" style={{ transform: 'translateZ(30px)' }}>
        {/* Closed eye curve / Eyebrow */}
        <div className={`absolute w-[90%] h-[5px] bg-neutral-800 transition-all duration-300 z-20 origin-left
          ${(eyeScaleClass.includes('scale-y-0') || eyeScaleClass.includes('scale-y-[0.1]')) && !isAngry ? 'opacity-100 rounded-full top-[50%] -translate-y-1/2' : 
            isAngry ? 'opacity-100 rounded-sm top-[10%] -rotate-[20deg]' : 'opacity-0 top-[50%] -translate-y-1/2'}
        `} />
        <div 
          ref={rightEyeRef}
          className={`relative z-10 ${hasError && !isLaughing && !isUnfazed && !isAsleepErr ? 'bg-red-200' : 'bg-gray-50'} rounded-full flex items-center justify-center overflow-hidden transition-colors duration-300 transition-transform origin-center ${eyeScaleClass} ${eyeSizeClass}`}
          style={{ boxShadow: 'inset -2px -4px 6px rgba(0,0,0,0.15), inset 2px 4px 6px rgba(255,255,255,0.9), 0 4px 8px rgba(0,0,0,0.1)' }}
        >
          <div
            className={`bg-black rounded-full ${pupilSizeClass}`}
            style={{
              ...calcTransform(rightEyeRef),
              transition: 'transform 0.15s ease-out'
            }}
          />
        </div>
      </div>

      {(idleAction === 'nod' || isAsleepErr) && (
        <div className="absolute right-[10%] top-[-10%] pointer-events-none z-30" style={{ transform: 'translateZ(50px)' }}>
          <span className="absolute animate-[zzzAnim_2s_infinite] text-white/50 font-bold text-xs" style={{ animationDelay: '0s', right: '0px', top: '0px' }}>z</span>
          <span className="absolute animate-[zzzAnim_2.5s_infinite] text-white/60 font-bold text-sm" style={{ animationDelay: '0.4s', right: '-10px', top: '-15px' }}>z</span>
          <span className="absolute animate-[zzzAnim_3s_infinite] text-white/70 font-bold text-base" style={{ animationDelay: '0.8s', right: '-20px', top: '-35px' }}>Z</span>
        </div>
      )}

      {/* Left Hand */}
      <div 
        className="absolute transition-all duration-500 ease-in-out z-20 origin-bottom flex justify-center"
        style={{
          bottom: '-10px',
          left: '15%',
          transform: `translateZ(40px) ${getLeftHandTransform()}`,
          opacity: isUsernameFocused || isPasswordFocused || idleAction === 'yawn' ? 1 : 0,
        }}
      >
        <div 
          className={`${handColorClass} rounded-t-full border-t border-white/20 ${handSizeClass}`}
          style={{
            boxShadow: 'inset -2px -4px 6px rgba(0,0,0,0.15), inset 2px 4px 6px rgba(255,255,255,0.3), 0 -4px 6px rgba(0,0,0,0.2)',
            animation: isUsernameFocused && !isPasswordFocused ? `typeAnim 0.3s infinite alternate ease-in-out ${delayOffset}s` : 'none'
          }}
        />
      </div>
      
      {/* Right Hand */}
      <div 
        className="absolute transition-all duration-500 ease-in-out z-20 origin-bottom flex justify-center"
        style={{
          bottom: '-10px',
          right: '15%',
          transform: `translateZ(40px) ${getRightHandTransform()}`,
          opacity: isUsernameFocused || isPasswordFocused || idleAction === 'yawn' ? 1 : 0,
        }}
      >
        <div 
          className={`${handColorClass} rounded-t-full border-t border-white/20 ${handSizeClass}`}
          style={{
            boxShadow: 'inset -2px -4px 6px rgba(0,0,0,0.15), inset 2px 4px 6px rgba(255,255,255,0.3), 0 -4px 6px rgba(0,0,0,0.2)',
            animation: isUsernameFocused && !isPasswordFocused ? `typeAnim 0.3s infinite alternate ease-in-out ${delayOffset + 0.15}s` : 'none'
          }}
        />
      </div>

      {/* Mouth */}
      <div 
        className={`absolute transition-all duration-300 ${getMouthClass()}`}
        style={{
          bottom: hasError ? '15%' : isPasswordFocused ? '12%' : '18%',
          opacity: isPasswordFocused || hasError || idleAction === 'yawn' || isHovered || isSurprised ? 0.8 : 0,
          transform: `translateZ(35px)`
        }}
      />
    </div>
  );
}

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [normalizedMouse, setNormalizedMouse] = useState({ x: 0, y: 0 });
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setHasError(true);
      setIsSuccess(false);
      setTimeout(() => setHasError(false), 1200); // Shake/sad duration
    } else {
      setHasError(false);
      setIsSuccess(true);
      
      // Remove focus from inputs
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      setTimeout(() => {
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        setTimeout(() => alert('Login efetuado com sucesso!'), 50);
      }, 2500); // Celebration duration
    }
  };

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsIdle(true), 10000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setNormalizedMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
      resetIdle();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('click', resetIdle);

    resetIdle();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row-reverse min-h-screen bg-[#1a1a1a] text-[#ffffff] font-sans">
      
      {/* Coluna A - Área do Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 z-30">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center md:text-left tracking-tight">
            Bem-vindo de volta
          </h2>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300" htmlFor="username">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsUsernameFocused(true)}
                onBlur={() => setIsUsernameFocused(false)}
                className={`w-full px-4 py-3 bg-[#242424] border ${hasError && !username ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50] transition-colors`}
                placeholder="Digite seu usuário"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={`w-full px-4 py-3 bg-[#242424] border ${hasError && !password ? 'border-red-500' : 'border-gray-700'} rounded-xl focus:outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50] transition-colors`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#4caf50] hover:bg-[#43a047] text-white font-semibold rounded-xl shadow-[0_4px_14px_0_rgb(76,175,80,39%)] transition-transform transform active:scale-[0.98] mt-4"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>

      {/* Coluna B - Área do Personagem */}
      <div 
        className="flex-1 flex items-center justify-center p-8 bg-[#111111] overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        
        <div 
          className="relative w-full max-w-[500px] h-[400px] flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out"
          style={{ 
            transform: `rotateX(${-normalizedMouse.y * 15}deg) rotateY(${normalizedMouse.x * 15}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
            
          {/* Bebê 1 (Top Esquerda) */}
          <div 
            className="absolute -translate-x-[120px] -translate-y-[100px] z-10"
            style={{ transform: 'translateZ(20px)' }}
          >
            <Mascot 
              mousePos={mousePos}
              isUsernameFocused={isUsernameFocused}
              isPasswordFocused={isPasswordFocused}
              hasError={hasError}
              isSuccess={isSuccess}
              isIdle={isIdle}
              containerClass="w-28 h-28 bg-cyan-400 rounded-[70%_30%_30%_70%/60%_40%_60%_40%] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.2)]"
              eyeSizeClass="w-6 h-8"
              pupilSizeClass="w-3 h-3"
              handSizeClass="w-5 h-8"
              handColorClass="bg-cyan-500"
              eyeSpacing="gap-2"
              delayOffset={0.2}
              coverOffset="-45px"
              personality="hyper"
              usernameLength={username.length}
            />
          </div>

          {/* Bebê 3 (Bottom Esquerda) */}
          <div 
            className="absolute -translate-x-[140px] translate-y-[90px] z-10"
            style={{ transform: 'translateZ(60px)' }}
          >
            <Mascot 
              mousePos={mousePos}
              isUsernameFocused={isUsernameFocused}
              isPasswordFocused={isPasswordFocused}
              hasError={hasError}
              isSuccess={isSuccess}
              isIdle={isIdle}
              containerClass="w-24 h-24 bg-fuchsia-500 rounded-[2rem] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.2)]"
              eyeSizeClass="w-5 h-7"
              pupilSizeClass="w-2.5 h-2.5"
              handSizeClass="w-4 h-7"
              handColorClass="bg-fuchsia-600"
              eyeSpacing="gap-2"
              delayOffset={0.6}
              coverOffset="-40px"
              personality="observant"
              usernameLength={username.length}
            />
          </div>

          {/* Personagem Principal (Centro) */}
          <div 
            className="relative z-20"
            style={{ transform: 'translateZ(40px)' }}
          >
            <Mascot 
              mousePos={mousePos}
              isUsernameFocused={isUsernameFocused}
              isPasswordFocused={isPasswordFocused}
              hasError={hasError}
              isSuccess={isSuccess}
              isIdle={isIdle}
              containerClass="w-48 h-48 bg-orange-500 rounded-[35%_65%_60%_40%/40%_45%_55%_60%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2)]"
              eyeSizeClass="w-10 h-14"
              pupilSizeClass="w-5 h-5"
              handSizeClass="w-10 h-16"
              handColorClass="bg-orange-600"
              eyeSpacing="gap-4"
              delayOffset={0}
              coverOffset="-90px"
              personality="balanced"
              usernameLength={username.length}
            />
          </div>

          {/* Bebê 2 (Bottom Direita) */}
          <div 
            className="absolute translate-x-[130px] translate-y-[100px] z-10"
            style={{ transform: 'translateZ(80px)' }}
          >
            <Mascot 
              mousePos={mousePos}
              isUsernameFocused={isUsernameFocused}
              isPasswordFocused={isPasswordFocused}
              hasError={hasError}
              isSuccess={isSuccess}
              isIdle={isIdle}
              containerClass="w-32 h-32 bg-lime-400 rounded-[50%_50%_20%_20%/60%_60%_20%_20%] shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.2)]"
              eyeSizeClass="w-8 h-10"
              pupilSizeClass="w-4 h-4"
              handSizeClass="w-6 h-10"
              handColorClass="bg-lime-500"
              eyeSpacing="gap-3"
              delayOffset={0.4}
              coverOffset="-55px"
              personality="chill"
              usernameLength={username.length}
            />
          </div>

          {/* Bebê 4 (Top Direita) */}
          <div 
            className="absolute translate-x-[110px] -translate-y-[110px] z-10"
            style={{ transform: 'translateZ(10px)' }}
          >
            <Mascot 
              mousePos={mousePos}
              isUsernameFocused={isUsernameFocused}
              isPasswordFocused={isPasswordFocused}
              hasError={hasError}
              isSuccess={isSuccess}
              isIdle={isIdle}
              containerClass="w-20 h-28 bg-pink-500 rounded-[3rem] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.2)]"
              eyeSizeClass="w-4 h-6"
              pupilSizeClass="w-2 h-2"
              handSizeClass="w-3 h-6"
              handColorClass="bg-pink-600"
              eyeSpacing="gap-1.5"
              delayOffset={0.8}
              coverOffset="-35px"
              personality="sleepy"
              usernameLength={username.length}
            />
          </div>

        </div>

      </div>

      <style>{`
        @keyframes surpriseAnim {
          0% { transform: scale(1) translateY(0); }
          15% { transform: scale(1.1, 0.9) translateY(10px); }
          30% { transform: scale(0.9, 1.1) translateY(-30px); }
          50% { transform: scale(1.05, 0.95) translateY(0); }
          75% { transform: scale(0.98, 1.02) translateY(-5px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes typeAnim {
          0% { transform: translateY(0); }
          100% { transform: translateY(8px); }
        }
        @keyframes shakeAnim {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px) rotate(-3deg); }
          40%, 80% { transform: translateX(8px) rotate(3deg); }
        }
        @keyframes jumpAnim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes stretchAnim {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          50% { transform: scale(0.95, 1.05) translateY(-5px); }
        }
        @keyframes nodAnim {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          40% { transform: scale(1.05, 0.9) translateY(8px); }
          80% { transform: scale(1.05, 0.9) translateY(8px); }
          85% { transform: scale(0.98, 1.02) translateY(-3px); }
        }
        @keyframes laughAnim {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          50% { transform: scale(1.05, 0.95) translateY(-8px); }
        }
        @keyframes fistBumpJumpAnim {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          50% { transform: scale(0.95, 1.05) translateY(-10px); }
        }
        @keyframes swayAnim {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg) translateX(-8px); }
          75% { transform: rotate(8deg) translateX(8px); }
        }
        @keyframes dartEyesAnim {
          0%, 100% { transform: translate(0, 0); }
          15%, 35% { transform: translate(-6px, 0); }
          65%, 85% { transform: translate(6px, 0); }
        }
        @keyframes breatheAnim {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          50% { transform: scale(1.02, 0.98) translateY(2px); }
        }
        @keyframes zzzAnim {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          20% { opacity: 1; transform: translate(5px, -10px) scale(0.8); }
          80% { opacity: 0.8; transform: translate(-5px, -30px) scale(1.2); }
          100% { opacity: 0; transform: translate(5px, -40px) scale(1.5); }
        }
      `}</style>
    </div>
  );
}
