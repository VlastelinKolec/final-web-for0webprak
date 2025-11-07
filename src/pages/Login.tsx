import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import Logo from '@/components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  navigate('/analytics');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-xl border border-border">
        <div className="flex justify-center mb-8">
          <Logo className="scale-125" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
          Добро пожаловать
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Войдите в систему для продолжения
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg">
            Войти
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-primary hover:underline">
            Забыли пароль?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
