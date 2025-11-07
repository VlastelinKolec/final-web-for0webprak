import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const { interviews, vacancies } = useApp();
  const completed = interviews.filter((i) => i.status === 'completed');

  // KPIs
  const totalInterviews = interviews.length;
  const averageScore = completed.length ? Math.round(completed.reduce((s, i) => s + (i.score || 0), 0) / completed.length) : 0;
  const averageMatch = completed.length ? Math.round(completed.reduce((s, i) => s + (i.match || 0), 0) / completed.length) : 0;
  const openVacancies = vacancies.filter((v) => v.status === 'open').length;

  // Average score by position
  const byPosition = completed.reduce<Record<string, { sum: number; count: number }>>((acc, i) => {
    const key = i.position;
    if (!acc[key]) acc[key] = { sum: 0, count: 0 };
    acc[key].sum += i.score || 0;
    acc[key].count += i.score ? 1 : 0;
    return acc;
  }, {});
  const posLabels = Object.keys(byPosition);
  const posScores = posLabels.map((p) => (byPosition[p].count ? Math.round(byPosition[p].sum / byPosition[p].count) : 0));

  // Stage distribution across all vacancies
  const stageCounts = vacancies.reduce<Record<string, number>>((acc, v) => {
    v.candidates.forEach((c) => {
      acc[c.stage] = (acc[c.stage] || 0) + 1;
    });
    return acc;
  }, {});
  const stageLabels = ['sourced', 'screening', 'interview', 'offer', 'hired', 'rejected'];
  const stageData = stageLabels.map((s) => stageCounts[s] || 0);

  // Average soft skills (completed interviews only)
  const skillKeys = ['communication', 'leadership', 'problemSolving', 'teamwork', 'adaptability', 'technical', 'emotional'] as const;
  const skillSums: Record<string, { sum: number; count: number }> = {};
  for (const key of skillKeys) skillSums[key] = { sum: 0, count: 0 };
  completed.forEach((i) => {
    if (!i.skills) return;
    for (const key of skillKeys) {
      const value = (i.skills as Record<string, number>)[key] || 0;
      skillSums[key].sum += value;
      skillSums[key].count += 1;
    }
  });
  const skillLabels = ['Коммуникация', 'Лидерство', 'Решение проблем', 'Командная работа', 'Адаптивность', 'Технические', 'Эмоциональный интеллект'];
  const skillsAvg = skillKeys.map((k) => (skillSums[k].count ? Math.round(skillSums[k].sum / skillSums[k].count) : 0));

  // Recommendations: top 5 by (score*0.6 + match*0.4)
  const topCandidates = completed
    .map((i) => ({
      candidate: i.candidate,
      position: i.position,
      score: i.score || 0,
      match: i.match || 0,
      composite: (i.score || 0) * 0.6 + (i.match || 0) * 0.4,
      id: i.id,
    }))
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 5);

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } as const;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Аналитика (HRD)</h1>
          <p className="text-muted-foreground">Глобальные метрики и тенденции по всем вакансиям</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Всего интервью</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalInterviews}</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Средний балл</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{averageScore}</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Среднее соответствие</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{averageMatch}%</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Открытых вакансий</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{openVacancies}</p></CardContent></Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle>Средний балл по позициям</CardTitle></CardHeader>
            <CardContent><div className="h-[300px]"><Bar data={{ labels: posLabels, datasets: [{ label: 'Баллы', data: posScores, backgroundColor: 'hsl(180 50% 50% / 0.6)' }] }} options={chartOptions} /></div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Распределение по этапам найма</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: stageLabels.map((s) => (
                      ({
                        sourced: 'Поиск',
                        screening: 'Скрининг',
                        interview: 'Интервью',
                        offer: 'Оффер',
                        hired: 'Нанят',
                        rejected: 'Отказ',
                      } as Record<string, string>)[s]
                    )),
                    datasets: [
                      { label: 'Кол-во', data: stageData, backgroundColor: 'hsl(95 45% 55% / 0.6)' },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Средние soft skills</CardTitle></CardHeader>
            <CardContent><div className="h-[320px]"><Bar data={{ labels: skillLabels, datasets: [{ label: 'Оценка', data: skillsAvg, backgroundColor: 'hsl(200 60% 60% / 0.6)' }] }} options={chartOptions} /></div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Рекомендованные кандидаты</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCandidates.map((c) => (
                  <div key={c.id} className="flex items-center justify-between border border-border rounded-md px-3 py-2">
                    <div>
                      <div className="font-medium">{c.candidate}</div>
                      <div className="text-xs text-muted-foreground">{c.position}</div>
                    </div>
                    <div className="text-sm">{c.score} / <span className="text-muted-foreground">{c.match}%</span></div>
                  </div>
                ))}
                {topCandidates.length === 0 && <div className="text-sm text-muted-foreground">Данных пока недостаточно</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
