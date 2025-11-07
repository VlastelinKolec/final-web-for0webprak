const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-primary rounded-lg transform rotate-45"></div>
        <div className="absolute inset-0 bg-secondary rounded-lg transform -rotate-45"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xl z-10">TM</span>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-primary font-bold text-xl">Talent</span>
        <span className="text-secondary font-bold text-xl -mt-1">Mind</span>
      </div>
    </div>
  );
};

export default Logo;
