const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Используем файл из public: /Logo.svg */}
      <img src="/Logo.svg" alt="Logo" className="h-8 w-auto" />
    </div>
  );
};

export default Logo;
