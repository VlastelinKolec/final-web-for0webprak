import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const navigate = useNavigate();

  // Фильтрация по вакансии
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>('all');
  const filteredVacancies = useMemo(() => {
    if (selectedVacancyId === 'all') return vacancies;
    return vacancies.filter((v) => v.id === selectedVacancyId);
  }, [vacancies, selectedVacancyId]);

  const filteredInterviewIds = useMemo(() => {
    if (selectedVacancyId === 'all') return null as Set<string> | null;
    const ids = new Set<string>();
    filteredVacancies.forEach((v) => v.candidates.forEach((c) => { if (c.reportId) ids.add(c.reportId); }));
    return ids;
  }, [filteredVacancies, selectedVacancyId]);

  const filteredInterviews = useMemo(() => {
    if (!filteredInterviewIds) return interviews;
    return interviews.filter((i) => filteredInterviewIds.has(i.id));
  }, [interviews, filteredInterviewIds]);

  const completed = filteredInterviews.filter((i) => i.status === 'completed');

  // KPIs
  const totalInterviews = filteredInterviews.length;
  const averageScore = completed.length ? Math.round(completed.reduce((s, i) => s + (i.score || 0), 0) / completed.length) : 0;
  const averageMatch = completed.length ? Math.round(completed.reduce((s, i) => s + (i.match || 0), 0) / completed.length) : 0;
  const openVacancies = filteredVacancies.filter((v) => v.status === 'open').length;

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

  // Stage distribution removed as per request

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
  // Modal state for per-person breakdown of a selected soft skill
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number | null>(null);
  const perPersonForSelectedSkill = useMemo(() => {
    if (selectedSkillIndex === null) return [] as { name: string; value: number; interviewId: string }[];
    const key = skillKeys[selectedSkillIndex];
    return completed
      .filter(i => i.skills && typeof (i.skills as any)[key] === 'number')
      .map(i => ({ name: i.candidate, value: (i.skills as any)[key] as number, interviewId: i.id }))
      .sort((a,b)=> b.value - a.value);
  }, [completed, selectedSkillIndex]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Аналитика (HRD)</h1>
            <p className="text-muted-foreground">
              {selectedVacancyId === 'all' ? 'Глобальные метрики и тенденции по всем вакансиям' : 'Метрики и графики по выбранной вакансии'}
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Select value={selectedVacancyId} onValueChange={setSelectedVacancyId}>
              <SelectTrigger aria-label="Фильтр по вакансии">
                <SelectValue placeholder="Выберите вакансию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все вакансии</SelectItem>
                {vacancies.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Всего интервью</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalInterviews}</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Средний балл</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{averageScore}</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Среднее соответствие</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{averageMatch}%</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Открытых вакансий</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{openVacancies}</p></CardContent></Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle>Средний балл по позициям</CardTitle></CardHeader>
            <CardContent>
              {posLabels.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Нет данных для отображения</div>
              ) : (
                <div className="h-[300px]"><Bar data={{ labels: posLabels, datasets: [{ label: 'Баллы', data: posScores, backgroundColor: 'hsl(180 50% 50% / 0.6)' }] }} options={chartOptions} /></div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Средние soft skills</CardTitle>
            </CardHeader>
            <CardContent>
              {skillsAvg.every(v => v === 0) ? (
                <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">Нет завершенных интервью с оценками навыков</div>
              ) : (
                <div className="h-[320px]">
                  <Bar
                    data={{ labels: skillLabels, datasets: [{ label: 'Оценка', data: skillsAvg, backgroundColor: 'hsl(200 60% 60% / 0.6)', hoverBackgroundColor: 'hsl(200 70% 50% / 0.7)' }] }}
                    options={{
                      ...chartOptions,
                      onClick: (_evt: any, elements: any[]) => {
                        if (!elements || !elements.length) return;
                        const idx = elements[0].index;
                        setSelectedSkillIndex(idx);
                        setSkillModalOpen(true);
                      },
                    }}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">Нажмите на столбец, чтобы увидеть распределение по людям</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Рекомендованные кандидаты</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCandidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/report/${c.id}`)}
                    className="w-full text-left flex items-center justify-between border border-border rounded-md px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium underline-offset-2 hover:underline">{c.candidate}</div>
                      <div className="text-xs text-muted-foreground">{c.position}</div>
                    </div>
                    <div className="text-sm">{c.score} / <span className="text-muted-foreground">{c.match}%</span></div>
                  </button>
                ))}
                {topCandidates.length === 0 && <div className="text-sm text-muted-foreground">Данных пока недостаточно</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedSkillIndex !== null ? `Распределение: ${skillLabels[selectedSkillIndex]}` : 'Распределение по навыку'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedSkillIndex !== null && perPersonForSelectedSkill.length === 0 && (
                <div className="text-sm text-muted-foreground">Нет данных по людям для этого навыка</div>
              )}
              {selectedSkillIndex !== null && perPersonForSelectedSkill.length > 0 && (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3 font-medium">Кандидат</th>
                      <th className="py-2 pr-3 font-medium">Оценка</th>
                      <th className="py-2 font-medium">Отчет</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perPersonForSelectedSkill.map(row => (
                      <tr key={row.interviewId} className="border-b last:border-none">
                        <td className="py-1 pr-3">{row.name}</td>
                        <td className="py-1 pr-3 font-semibold">{row.value}</td>
                        <td className="py-1">
                          <button
                            onClick={() => navigate(`/report/${row.interviewId}`)}
                            className="text-primary hover:underline text-xs"
                          >Открыть</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
