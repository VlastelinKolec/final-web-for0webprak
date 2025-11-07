import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const users = [
    { id: 1, name: 'Александр Козлов', email: 'a.kozlov@company.ru', role: 'Рекрутер', status: 'active' },
    { id: 2, name: 'Мария Петрова', email: 'm.petrova@company.ru', role: 'HRD', status: 'active' },
    { id: 3, name: 'Иван Смирнов', email: 'i.smirnov@company.ru', role: 'Админ', status: 'active' },
    { id: 4, name: 'Ольга Волкова', email: 'o.volkova@company.ru', role: 'Рекрутер', status: 'inactive' },
  ];

  const integrations = [
    { 
      name: 'Huntflow', 
      logo: '🔷', 
      description: 'ATS-система для автоматизации рекрутинга',
      connected: false 
    },
    { 
      name: 'Talantix', 
      logo: '🟢', 
      description: 'Платформа для управления талантами',
      connected: false 
    },
    { 
      name: 'hh.ru API', 
      logo: '🔴', 
      description: 'Интеграция с крупнейшим job-порталом',
      connected: true 
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Настройки (Админ)</h1>
          <p className="text-muted-foreground">
            Управление пользователями, интеграциями и конфигурацией системы
          </p>
        </div>

        {/* Users Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Пользователи</CardTitle>
                <CardDescription className="mt-1">
                  Управление доступом и ролями сотрудников
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Добавить пользователя
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.status === 'active' ? (
                        <Badge className="bg-secondary">Активен</Badge>
                      ) : (
                        <Badge variant="outline">Неактивен</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Редактировать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Integrations Section */}
        <Card>
          <CardHeader>
            <CardTitle>Интеграции</CardTitle>
            <CardDescription className="mt-1">
              Подключение внешних систем и сервисов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{integration.logo}</div>
                    <div>
                      <h3 className="font-semibold text-foreground">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {integration.connected ? (
                      <Badge className="bg-secondary">Подключено</Badge>
                    ) : (
                      <Badge variant="outline">Не подключено</Badge>
                    )}
                    <Button variant="outline" className="gap-2">
                      <Settings2 className="w-4 h-4" />
                      {integration.connected ? 'Настроить' : 'Подключить'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
