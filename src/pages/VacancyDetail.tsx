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
import { useState } from 'react';

const stageLabel: Record<string, string> = {
  sourced: 'Поиск',
  screening: 'Скрининг',
  interview: 'Интервью',
  offer: 'Оффер',
  hired: 'Нанят',
  rejected: 'Отказ',
};

const VacancyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vacancies, updateVacancy, deleteVacancy, updateCandidate, addCandidateToVacancy, deleteCandidate } = useApp();
  const vacancy = vacancies.find(v => v.id === id);

  const [title, setTitle] = useState(vacancy?.title || '');
  const [department, setDepartment] = useState(vacancy?.department || '');
  const [status, setStatus] = useState<'open' | 'on_hold' | 'closed'>(vacancy?.status || 'open');
  const [description, setDescription] = useState(vacancy?.description || '');
  const [requirements, setRequirements] = useState(vacancy?.requirements || '');

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
    updateVacancy(vacancy.id, { title, department, status, description, requirements });
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
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />
            <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Требования" />
          </div>

          <div className="space-y-4 bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Кандидаты <Badge variant="outline">{vacancy.candidates.length}</Badge>
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => addCandidateToVacancy(vacancy.id, { name: 'Новый кандидат', stage: 'sourced', rating: 0, notes: '' })}
            >
              <Users className="w-3 h-3" /> Добавить кандидата
            </Button>
            <div className="space-y-3">
              {vacancy.candidates.map((c) => (
                <div key={c.id} className="flex items-start gap-3 bg-muted/40 rounded-md p-3">
                  <div className="flex-1">
                    <button
                      type="button"
                      className="font-medium text-sm hover:underline text-left"
                      onClick={() => { if (c.reportId) navigate(`/report/${c.reportId}`); }}
                    >{c.name}</button>
                    <div className="text-[11px] text-muted-foreground mb-1">{stageLabel[c.stage]}</div>
                    <div className="flex items-center gap-2">
                      <Select value={c.stage} onValueChange={(val: CandidateStage) => updateCandidate(vacancy.id, c.id, { stage: val })}>
                        <SelectTrigger className="h-8 w-36 text-xs" />
                        <SelectContent>
                          {Object.entries(stageLabel).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {typeof c.rating === 'number' && c.rating > 0 && (
                        <Badge variant="secondary" className="text-[10px]">{c.rating}</Badge>
                      )}
                      {c.reportId && (
                        <Badge
                          variant="outline"
                          className="text-[10px] cursor-pointer"
                          onClick={() => navigate(`/report/${c.reportId}`)}
                        >Отчет</Badge>
                      )}
                    </div>
                    {c.notes && <div className="mt-2 text-xs text-muted-foreground">{c.notes}</div>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCandidate(vacancy.id, c.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {vacancy.candidates.length === 0 && (
                <div className="text-xs text-muted-foreground">Нет кандидатов</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VacancyDetail;
