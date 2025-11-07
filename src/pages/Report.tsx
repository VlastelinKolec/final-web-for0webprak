import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </Button>

        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {interview.candidate}
              </h1>
              <p className="text-xl text-muted-foreground">{interview.position}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Дата интервью: {new Date(interview.date).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Экспорт PDF
              </Button>
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
            <h2 className="text-2xl font-bold mb-6">Карта софт-скиллов</h2>
            <div className="max-w-2xl mx-auto">
              <Radar data={chartData} options={chartOptions} />
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
