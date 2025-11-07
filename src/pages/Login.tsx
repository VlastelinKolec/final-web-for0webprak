import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import Logo from '@/components/Logo';

const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate('/analytics');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-xl border border-border">
        <div className="flex justify-center mb-8">
          <Logo className="scale-125" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-4 text-foreground">
          TalentMind
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Нажмите, чтобы авторизоваться и перейти в систему
        </p>

        <div className="space-y-4">
          <Button onClick={handleLogin} className="w-full h-12 text-base font-semibold" size="lg">
            Авторизоваться
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
