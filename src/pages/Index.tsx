// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="mb-4 text-4xl font-bold">TalentMind AI</h1>
        <p className="text-xl text-muted-foreground">Выберите версию приложения:</p>
        
        <div className="flex flex-col gap-4 mt-8">
          <a 
            href="/prototype.html" 
            target="_blank"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium inline-block"
          >
            Открыть Прототип (HTML)
          </a>
          
          <a 
            href="/login" 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium inline-block"
          >
            React Версия (в разработке)
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
