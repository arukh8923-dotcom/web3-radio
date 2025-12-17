'use client';

export function SpeakerGrille() {
  return (
    <div className="relative w-full h-32 md:h-48 rounded-lg overflow-hidden">
      {/* Speaker grille pattern */}
      <div className="speaker-grille absolute inset-0" />
      
      {/* Fabric texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 shadow-inner" />
      
      {/* Chrome frame */}
      <div className="absolute inset-0 border-4 border-brass/20 rounded-lg" />
      
      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brass/40 rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brass/40 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brass/40 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brass/40 rounded-br" />
    </div>
  );
}
