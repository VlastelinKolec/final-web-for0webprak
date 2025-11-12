import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import type { CandidateStage } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trash2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

const stageLabel: Record<string, string> = {
  sourced: 'Поиск',
  screening: 'Скрининг',
  interview: 'Интервью',
  offer: 'Оффер',
  hired: 'Нанят',
  rejected: 'Отказ',
};

// Color styles for stage badges
const stageBadgeClass: Record<CandidateStage, string> = {
  sourced: 'bg-sky-100 text-sky-700 border border-sky-200',
  screening: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  interview: 'bg-amber-100 text-amber-700 border border-amber-200',
  offer: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  hired: 'bg-green-200 text-green-800 border border-green-300',
  rejected: 'bg-red-100 text-red-600 border border-red-200',
};

const VacancyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vacancies, interviews, deleteVacancy, addCandidateToVacancy, updateCandidate, addInterview } = useApp();
  const vacancy = vacancies.find(v => v.id === id);

  if (!vacancy) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад к вакансиям
          </Button>
          <h1 className="text-2xl font-bold mb-4">Вакансия не найдена</h1>
        </div>
      </DashboardLayout>
    );
  }

  // no edit/save – display-only

  // selection for comparison
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [dragOver, setDragOver] = useState<CandidateStage | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newResume, setNewResume] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  // Фильтр по этапу (статусу) кандидата: интервью, оффер, отказ, нанят
  const [stageFilter, setStageFilter] = useState<CandidateStage | 'all'>('all');
  // Поиск по фамилии (берем последнюю часть имени)
  const [surnameQuery, setSurnameQuery] = useState('');

  const getMatch = (candidateId: string) => {
    const c = vacancy.candidates.find(x => x.id === candidateId);
    if (!c?.reportId) return 0;
    return interviews.find(i => i.id === c.reportId)?.match || 0;
  };

  const sortedCandidates = [...vacancy.candidates].sort((a,b) => {
    const am = getMatch(a.id);
    const bm = getMatch(b.id);
    return bm - am;
  });

  // Убираем ранние этапы (Поиск, Скрининг)
  let filteredCandidates = sortedCandidates.filter(c => !['sourced','screening'].includes(c.stage));
  // Фильтр по выбранному этапу если не "all"
  if (stageFilter !== 'all') {
    filteredCandidates = filteredCandidates.filter(c => c.stage === stageFilter);
  }
  // Поиск по фамилии (последнее слово в имени)
  if (surnameQuery.trim()) {
    const q = surnameQuery.trim().toLowerCase();
    filteredCandidates = filteredCandidates.filter(c => {
      const parts = c.name.split(/\s+/);
      const last = parts[parts.length - 1].toLowerCase();
      return last.includes(q);
    });
  }

  const stages = ['sourced','screening','interview','offer','hired','rejected'] as const;

  const handleDropOnStage = (stageKey: CandidateStage, candidateId: string) => {
    updateCandidate(vacancy.id, candidateId, { stage: stageKey });
    setDragOver(null);
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold">{vacancy.title}</h1>
            <Badge className="text-white bg-primary">{vacancy.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => { deleteVacancy(vacancy.id); navigate('/dashboard'); }}>
              <Trash2 className="w-4 h-4 mr-2" />Удалить
            </Button>
          </div>
        </div>
        {/* Top toolbar: compare + add and a small link to vacancy */}
        <div className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-4">
          <div className="text-sm">
            {vacancy.url ? (
              <a href={vacancy.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Открыть вакансию</a>
            ) : (
              <span className="text-muted-foreground">Ссылка на вакансию не указана</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Поиск по фамилии"
                value={surnameQuery}
                onChange={(e)=> setSurnameQuery(e.target.value)}
                className="h-8 w-44 text-xs"
              />
              <Select value={stageFilter} onValueChange={(v:any)=> setStageFilter(v)}>
                <SelectTrigger className="h-8 w-40 text-xs" title="Фильтр по статусу">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="interview">Интервью</SelectItem>
                  <SelectItem value="offer">Оффер</SelectItem>
                  <SelectItem value="rejected">Отказ</SelectItem>
                  <SelectItem value="hired">Нанят</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button disabled={compareIds.length < 2} onClick={() => setCompareOpen(true)} size="sm" variant="secondary">Сравнить {compareIds.length >=2 ? `(${compareIds.length})` : ''}</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={()=> setAddOpen(true)}>
              <Users className="w-3 h-3" /> Добавить кандидата
            </Button>
          </div>
        </div>

        {/* Candidate list (simple view) */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Кандидаты</h2>
          <div className="space-y-2 bg-card border border-border rounded-xl p-4">
            {filteredCandidates.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-4 p-3 rounded-md border bg-white/70 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => { if (c.reportId) navigate(`/report/${c.reportId}`); }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center font-semibold">{c.name.split(' ').map(p=>p[0]).join('')}</div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.notes}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stageBadgeClass[c.stage]}`}>{stageLabel[c.stage]}</span>
                  {c.reportId ? (
                    <span className="text-[11px] font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">{getMatch(c.id)}%</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Нет отчёта</span>
                  )}
                  <input type="checkbox" className="h-4 w-4" onClick={(e)=> e.stopPropagation()} checked={compareIds.includes(c.id)} onChange={(e)=>{
                    setCompareIds(prev => e.target.checked ? [...prev, c.id] : prev.filter(id=>id!==c.id));
                  }} />
                </div>
              </div>
            ))}
            {filteredCandidates.length === 0 && <div className="text-sm text-muted-foreground">Нет кандидатов</div>}
          </div>
        </div>

        {/* Compare dialog */}
        <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Сравнение кандидатов</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              {compareIds.slice(0,2).map(cid => {
                const c = vacancy.candidates.find(x=>x.id===cid)!;
                const interview = c.reportId ? interviews.find(i=>i.id===c.reportId) : undefined;
                return (
                  <div key={cid} className="border rounded-lg p-4 bg-card space-y-2">
                    <div className="text-lg font-semibold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">Этап: {stageLabel[c.stage]}</div>
                    <div className="text-sm">Соответствие: <span className="font-semibold">{interview?.match ?? 0}%</span></div>
                    {interview?.skills && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(interview.skills).map(([k,v]) => (
                          <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add candidate dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Новый кандидат</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="Имя и фамилия" />
              <Input value={newResume} onChange={(e)=>setNewResume(e.target.value)} placeholder="Ссылка на резюме (https://...)" type="url" />
              <div className="border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  id="candidateFile"
                  className="hidden"
                  accept="audio/*,video/*,application/pdf"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="candidateFile" className="text-sm text-muted-foreground cursor-pointer">
                  {newFile ? (
                    <span className="font-medium">{newFile.name} ({(newFile.size/1024/1024).toFixed(2)} МБ)</span>
                  ) : (
                    'Прикрепить файл интервью или резюме'
                  )}
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={()=> { setAddOpen(false); }}>Отмена</Button>
                <Button onClick={()=>{
                  const name = newName.trim() || 'Кандидат';
                  // Создаем интервью сразу при добавлении
                  const reportId = addInterview({
                    candidate: name,
                    position: vacancy.title,
                    status: 'processing',
                    attachments: newFile ? [{ name: newFile.name, size: newFile.size, type: newFile.type }] : undefined,
                  });
                  addCandidateToVacancy(vacancy.id, { name, stage: 'interview', rating: 0, notes: '', resumeUrl: newResume || undefined, reportId });
                  setNewName(''); setNewResume(''); setNewFile(null); setAddOpen(false);
                }}>Добавить</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default VacancyDetail;
