import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, MoreVertical, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { toast } from 'sonner';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { interviews } = useApp();

  const interview = interviews.find((i) => i.id === id);

  if (!interview) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Отчет не найден</h2>
            <Button onClick={() => navigate('/dashboard')}>Вернуться к списку</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (interview.status !== 'completed') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Анализ в процессе</h2>
            <p className="text-muted-foreground">Пожалуйста, подождите завершения обработки</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = {
    labels: [
      'Коммуникация',
      'Лидерство',
      'Решение проблем',
      'Командная работа',
      'Адаптивность',
      'Технические навыки',
      'Эмоц. интеллект',
    ],
    datasets: [
      {
        label: 'Оценка навыков',
        data: interview.skills
          ? [
              interview.skills.communication,
              interview.skills.leadership,
              interview.skills.problemSolving,
              interview.skills.teamwork,
              interview.skills.adaptability,
              interview.skills.technical,
              interview.skills.emotional,
            ]
          : [],
        backgroundColor: 'hsl(180 50% 50% / 0.2)',
        borderColor: 'hsl(180 50% 50%)',
        borderWidth: 2,
        pointBackgroundColor: 'hsl(180 50% 50%)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'hsl(180 50% 50%)',
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const getScoreLevel = (score: number) => {
    if (score >= 85) return { label: 'Отличное соответствие', color: 'bg-secondary' };
    if (score >= 70) return { label: 'Хорошее соответствие', color: 'bg-primary' };
    return { label: 'Среднее соответствие', color: 'bg-muted' };
  };

  const scoreLevel = interview.score ? getScoreLevel(interview.score) : null;

  const handleShare = () => {
    toast.success('Ссылка скопирована в буфер обмена');
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к списку
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" /> Поделиться
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Download className="w-4 h-4" /> Экспорт PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <TrendingUp className="w-4 h-4" /> Сравнить с другими
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-lg">
                  {interview.candidate.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground leading-tight">{interview.candidate}</h1>
                  <p className="text-muted-foreground text-sm mt-1">{interview.position}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Интервью: {new Date(interview.date).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                <div className="bg-card/50 border border-border rounded-lg p-3 flex flex-col">
                  <span className="text-[11px] text-muted-foreground">Итоговая оценка</span>
                  <span className="text-2xl font-bold">{interview.score ?? '—'}</span>
                </div>
                <div className="bg-card/50 border border-border rounded-lg p-3 flex flex-col">
                  <span className="text-[11px] text-muted-foreground">Уверенность</span>
                  <span className="text-2xl font-bold">{interview.confidence ?? '—'}{typeof interview.confidence === 'number' && '%'}</span>
                </div>
                <div className="bg-card/50 border border-border rounded-lg p-3 flex flex-col">
                  <span className="text-[11px] text-muted-foreground">Соответствие</span>
                  <span className="text-2xl font-bold">{interview.match ?? '—'}{typeof interview.match === 'number' && '%'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card/50 border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Итоговая оценка</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold">{interview.score ?? '—'}</span>
                {typeof interview.score === 'number' && (
                  <span className="text-muted-foreground">/100</span>
                )}
              </div>
              {interview.score && scoreLevel && (
                <Badge className={`mt-3 ${scoreLevel.color} text-white`}>{scoreLevel.label}</Badge>
              )}
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Уверенность</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold">{interview.confidence ?? '—'}</span>
                {typeof interview.confidence === 'number' && <span className="text-muted-foreground">%</span>}
              </div>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Соответствие</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold">{interview.match ?? '—'}</span>
                {typeof interview.match === 'number' && <span className="text-muted-foreground">%</span>}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Карта софт-скиллов</h2>
              <span className="text-xs text-muted-foreground">Наведи для деталей</span>
            </div>
            <div className="max-w-2xl mx-auto">
              <Radar data={chartData} options={chartOptions} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6 text-xs text-muted-foreground">
              <div><span className="font-semibold">Коммуникация:</span> ясность, активное слушание</div>
              <div><span className="font-semibold">Лидерство:</span> инициатива, влияние</div>
              <div><span className="font-semibold">Решение проблем:</span> анализ, креатив</div>
              <div><span className="font-semibold">Командная работа:</span> сотрудничество</div>
              <div><span className="font-semibold">Адаптивность:</span> гибкость к изменениям</div>
              <div><span className="font-semibold">Технические навыки:</span> проф. компетенции</div>
              <div className="col-span-2"><span className="font-semibold">Эмоц. интеллект:</span> эмпатия, устойчивость</div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Insights */}
          {interview.insights && interview.insights.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Ключевые инсайты</h2>
              <ul className="space-y-3">
                {interview.insights.map((insight, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground flex-1">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {interview.risks && interview.risks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Возможные риски</h2>
              <ul className="space-y-3">
                {interview.risks.map((risk, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-sm font-semibold">
                      !
                    </span>
                    <p className="text-muted-foreground flex-1">{risk}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quotes */}
          {interview.quotes && interview.quotes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Цитаты-доказательства</h2>
              <div className="space-y-4">
                {interview.quotes.map((quote, index) => (
                  <blockquote
                    key={index}
                    className="border-l-4 border-primary pl-4 py-2 italic text-muted-foreground"
                  >
                    {quote}
                  </blockquote>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Report;
