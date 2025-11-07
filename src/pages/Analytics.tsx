import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const avgScoreData = {
    labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'],
    datasets: [
      {
        label: 'Средний балл кандидатов',
        data: [78, 82, 79, 85, 88, 86],
        borderColor: 'hsl(180 50% 50%)',
        backgroundColor: 'hsl(180 50% 50% / 0.1)',
        tension: 0.4,
      },
    ],
  };

  const competenciesData = {
    labels: [
      'Коммуникация',
      'Лидерство',
      'Решение проблем',
      'Командная работа',
      'Адаптивность',
      'Технические',
    ],
    datasets: [
      {
        label: 'Средняя оценка по компетенциям',
        data: [85, 78, 88, 82, 80, 87],
        backgroundColor: [
          'hsl(180 50% 50% / 0.8)',
          'hsl(95 45% 55% / 0.8)',
          'hsl(200 60% 55% / 0.8)',
          'hsl(150 50% 50% / 0.8)',
          'hsl(220 50% 60% / 0.8)',
          'hsl(170 45% 55% / 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const statusDistribution = {
    labels: ['Высокое соответствие', 'Хорошее соответствие', 'Среднее соответствие'],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: [
          'hsl(95 45% 55%)',
          'hsl(180 50% 50%)',
          'hsl(210 20% 88%)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Аналитика (HRD)</h1>
          <p className="text-muted-foreground">
            Обзор статистики и тенденций по всем интервью
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего интервью
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">247</p>
              <p className="text-xs text-secondary mt-1">+12% за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Средний балл
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">84.5</p>
              <p className="text-xs text-secondary mt-1">+3.2 за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Время анализа
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3.5 мин</p>
              <p className="text-xs text-muted-foreground mt-1">в среднем</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Точность ИИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">94.2%</p>
              <p className="text-xs text-secondary mt-1">+1.5% за месяц</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Динамика среднего балла</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line data={avgScoreData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Распределение по уровню соответствия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-[280px]">
                  <Doughnut data={statusDistribution} options={chartOptions} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Средние оценки по компетенциям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <Bar data={competenciesData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
