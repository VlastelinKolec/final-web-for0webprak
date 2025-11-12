import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DepartmentAnalytics = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { vacancies, interviews } = useApp();

  const deptVacancies = vacancies.filter((v) => (v.department || '').toLowerCase() === (name || '').toLowerCase());
  const candidateInterviews = deptVacancies
    .flatMap((v) => v.candidates)
    .map((c) => interviews.find((i) => i.id === c.reportId))
    .filter((i): i is NonNullable<typeof i> => Boolean(i && i.status === 'completed'));

  const avgScore = candidateInterviews.length
    ? Math.round(candidateInterviews.reduce((s, i) => s + (i.score || 0), 0) / candidateInterviews.length)
    : 0;
  const avgMatch = candidateInterviews.length
    ? Math.round(candidateInterviews.reduce((s, i) => s + (i.match || 0), 0) / candidateInterviews.length)
    : 0;

  // Average score by vacancy title within department
  const byVacancy = deptVacancies.reduce<Record<string, { sum: number; count: number }>>((acc, v) => {
    const relatedInterviews = v.candidates
      .map((c) => interviews.find((i) => i.id === c.reportId))
      .filter((i): i is NonNullable<typeof i> => Boolean(i && i.status === 'completed'));
    const sum = relatedInterviews.reduce((s, i) => s + (i.score || 0), 0);
    const count = relatedInterviews.filter((i) => typeof i.score === 'number').length;
    acc[v.title] = { sum, count };
    return acc;
  }, {});
  const vacLabels = Object.keys(byVacancy);
  const vacScores = vacLabels.map((t) => (byVacancy[t].count ? Math.round(byVacancy[t].sum / byVacancy[t].count) : 0));

  // Leaders by soft skill
  const skillKeys = ['communication', 'leadership', 'problemSolving', 'teamwork', 'adaptability', 'technical', 'emotional'] as const;
  const skillNames: Record<string, string> = {
    communication: 'Коммуникация',
    leadership: 'Лидерство',
    problemSolving: 'Решение проблем',
    teamwork: 'Командная работа',
    adaptability: 'Адаптивность',
    technical: 'Технические',
    emotional: 'Эмоциональный интеллект',
  };
  const leaders = skillKeys.map((k) => {
    const best = candidateInterviews
      .filter((i) => i.skills)
      .map((i) => ({ id: i.id, name: i.candidate, value: (i.skills as Record<string, number>)[k] || 0 }))
      .sort((a, b) => b.value - a.value)[0];
    return { key: k, label: skillNames[k], best };
  });

  // Recommendations inside department (top 5)
  const recommended = candidateInterviews
    .map((i) => ({ name: i.candidate, position: i.position, score: i.score || 0, match: i.match || 0, id: i.id, composite: (i.score || 0) * 0.6 + (i.match || 0) * 0.4 }))
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 5);

  // Stage distribution for department
  const stageCounts = deptVacancies.reduce<Record<string, number>>((acc, v) => {
    v.candidates.forEach((c) => { acc[c.stage] = (acc[c.stage] || 0) + 1; });
    return acc;
  }, {});
  const stageLabels = ['sourced', 'screening', 'interview', 'offer', 'hired', 'rejected'];
  const stageData = stageLabels.map((s) => stageCounts[s] || 0);

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } as const;

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Департамент: {name}</h1>
            <p className="text-muted-foreground">Аналитика по вакансиям и кандидатам департамента</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2"><ArrowLeft className="w-4 h-4"/>Назад</Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Вакансий</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{deptVacancies.length}</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Кандидатов</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{deptVacancies.reduce((s, v) => s + v.candidates.length, 0)}</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Средний балл</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{avgScore}</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Среднее соответствие</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{avgMatch}%</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Средний балл по вакансиям</CardTitle></CardHeader>
            <CardContent>
              {vacLabels.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Нет завершенных интервью для вычисления</div>
              ) : (
                <div className="h-[300px]"><Bar data={{ labels: vacLabels, datasets: [{ label: 'Баллы', data: vacScores, backgroundColor: 'hsl(180 50% 50% / 0.6)' }] }} options={chartOptions} /></div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Распределение этапов</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {stageData.every(v => v === 0) ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Нет кандидатов на этапах</div>
                ) : (
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
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Лидеры по soft skills</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leaders.map((l) => (
                  <div key={l.key} className="border border-border rounded-md p-3">
                    <div className="text-xs text-muted-foreground mb-1">{l.label}</div>
                    {l.best ? (
                      <button
                        className="font-medium underline-offset-2 hover:underline text-left"
                        onClick={() => navigate(`/report/${l.best!.id}`)}
                      >
                        {l.best.name} — {l.best.value}
                      </button>
                    ) : (
                      <div className="font-medium">Недостаточно данных</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Кого рекомендуем</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommended.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/report/${c.id}`)}
                    className="w-full text-left flex items-center justify-between border border-border rounded-md px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium underline-offset-2 hover:underline">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.position}</div>
                    </div>
                    <div className="text-sm">{c.score} / <span className="text-muted-foreground">{c.match}%</span></div>
                  </button>
                ))}
                {recommended.length === 0 && <div className="text-sm text-muted-foreground">Данных пока недостаточно</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DepartmentAnalytics;
