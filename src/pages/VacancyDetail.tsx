import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import type { CandidateStage } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  const { vacancies, interviews, updateVacancy, deleteVacancy, updateCandidate, addCandidateToVacancy, deleteCandidate } = useApp();
  const vacancy = vacancies.find(v => v.id === id);

  const [title, setTitle] = useState(vacancy?.title || '');
  const [department, setDepartment] = useState(vacancy?.department || '');
  const [status, setStatus] = useState<'open' | 'on_hold' | 'closed'>(vacancy?.status || 'open');
  const [description, setDescription] = useState(vacancy?.description || '');
  const [requirements, setRequirements] = useState(vacancy?.requirements || '');
  const [url, setUrl] = useState(vacancy?.url || '');

  if (!vacancy) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Button variant="ghost" onClick={() => navigate('/vacancies')} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад к вакансиям
          </Button>
          <h1 className="text-2xl font-bold mb-4">Вакансия не найдена</h1>
        </div>
      </DashboardLayout>
    );
  }

  const saveChanges = () => {
    updateVacancy(vacancy.id, { title, department, status, description, requirements, url });
  };

  // selection for comparison
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [dragOver, setDragOver] = useState<CandidateStage | null>(null);

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
            <Button variant="ghost" onClick={() => navigate('/vacancies')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold">{vacancy.title}</h1>
            <Badge className="text-white bg-primary">{vacancy.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveChanges}>Сохранить</Button>
            <Button variant="destructive" onClick={() => { deleteVacancy(vacancy.id); navigate('/vacancies'); }}>
              <Trash2 className="w-4 h-4 mr-2" />Удалить
            </Button>
          </div>
        </div>

  {/* Edit form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4 bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Основная информация</h2>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" />
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Департамент" />
            <Select value={status} onValueChange={(v: 'open' | 'on_hold' | 'closed') => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Открыта</SelectItem>
                <SelectItem value="on_hold">Пауза</SelectItem>
                <SelectItem value="closed">Закрыта</SelectItem>
              </SelectContent>
            </Select>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Ссылка на вакансию (https://...)" type="url" />
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />
            <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Требования" />
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Открыть вакансию</a>
            )}
          </div>

          <div className="space-y-4 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">Сравнение <Badge variant="outline">{vacancy.candidates.length}</Badge></h2>
              <div className="flex items-center gap-2">
                <Button disabled={compareIds.length < 2} onClick={() => setCompareOpen(true)} size="sm" variant="secondary">Сравнить {compareIds.length >=2 ? `(${compareIds.length})` : ''}</Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => addCandidateToVacancy(vacancy.id, { name: 'Новый кандидат', stage: 'sourced', rating: 0, notes: '' })}
                >
                  <Users className="w-3 h-3" /> Добавить кандидата
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Выберите двух кандидатов, чтобы сравнить их отчёты. Подробные данные и управление этапами находятся в Канбане ниже.</div>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {sortedCandidates.map((c) => (
                <label key={c.id} className="flex items-center gap-3 rounded-md border bg-white/70 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={compareIds.includes(c.id)}
                    onChange={(e)=>{
                      setCompareIds(prev => e.target.checked ? [...prev, c.id] : prev.filter(id=>id!==c.id));
                    }}
                  />
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="truncate font-medium">{c.name}</span>
                    {c.reportId && (
                      <span className="text-[11px] font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">{getMatch(c.id)}%</span>
                    )}
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${stageBadgeClass[c.stage]}`}>{stageLabel[c.stage]}</span>
                  </div>
                </label>
              ))}
              {vacancy.candidates.length === 0 && (
                <div className="text-xs text-muted-foreground">Нет кандидатов</div>
              )}
            </div>
          </div>
        </div>

        {/* Full-width Kanban below description */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Воронка кандидатов (канбан)</h2>
          {/* Responsive: horizontally scroll when too many columns */}
          <div className="grid gap-4 xl:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 overflow-x-auto pb-2">
            {stages.map(stageKey => {
              const stageItems = sortedCandidates.filter(c=>c.stage===stageKey).sort((a,b)=>getMatch(b.id)-getMatch(a.id));
              const isOver = dragOver === stageKey;
              return (
                <div
                  key={stageKey}
                  className={`rounded-lg border bg-white ${isOver ? 'ring-2 ring-primary' : ''}`}
                  onDragOver={(e)=>{ e.preventDefault(); setDragOver(stageKey); }}
                  onDragEnter={(e)=>{ e.preventDefault(); setDragOver(stageKey); }}
                  onDragLeave={()=> setDragOver(null)}
                  onDrop={(e)=>{
                    const id = e.dataTransfer.getData('text/plain');
                    if (id) handleDropOnStage(stageKey as CandidateStage, id);
                  }}
                >
                  <div className="px-3 py-2 border-b bg-muted/50 flex items-center justify-between sticky top-0 z-10">
                    <span className="text-sm font-semibold">{stageLabel[stageKey]}</span>
                    <Badge variant="outline" className="text-[10px]">{stageItems.length}</Badge>
                  </div>
                  <div className="p-3 space-y-2 max-h-[28rem] overflow-y-auto">
                    {stageItems.length === 0 && (
                      <div className="text-xs text-muted-foreground">Пусто</div>
                    )}
                    {stageItems.map(c => (
                      <div
                        key={c.id}
                        className="rounded-md border bg-muted/20 p-2 text-sm cursor-move"
                        draggable
                        onDragStart={(e)=>{ e.dataTransfer.setData('text/plain', c.id); e.dataTransfer.effectAllowed = 'move'; }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button className="font-medium hover:underline text-left" onClick={()=>{ if (c.reportId) navigate(`/report/${c.reportId}`); }}>{c.name}</button>
                          {c.reportId && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{getMatch(c.id)}%</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${stageBadgeClass[c.stage]}`}>{stageLabel[c.stage]}</span>
                          {typeof c.rating === 'number' && c.rating > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">{c.rating}</span>
                          )}
                        </div>
                        {c.notes && <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{c.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
      </div>
    </DashboardLayout>
  );
};

export default VacancyDetail;
