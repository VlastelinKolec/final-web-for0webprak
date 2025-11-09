import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Plus, Pencil, Trash2, Users, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { CandidateStage, VacancyStatus } from '@/contexts/AppContext';

const VacancyStatusMap: Record<string, { label: string; color: string }> = {
  open: { label: 'Открыта', color: 'bg-green-500' },
  on_hold: { label: 'Пауза', color: 'bg-yellow-500' },
  closed: { label: 'Закрыта', color: 'bg-red-500' },
};

const stageLabel: Record<string, string> = {
  sourced: 'Поиск',
  screening: 'Скрининг',
  interview: 'Интервью',
  offer: 'Оффер',
  hired: 'Нанят',
  rejected: 'Отказ',
};

const Vacancies = () => {
  const { vacancies, addVacancy, updateVacancy, deleteVacancy, addCandidateToVacancy, updateCandidate, deleteCandidate } = useApp();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  // Use 'all' sentinel instead of empty string to avoid Radix Select crash (value cannot be empty)
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<VacancyStatus>('open');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setStatus('open');
    setDescription('');
    setRequirements('');
  };

  const handleCreateVacancy = () => {
    if (!title.trim()) return;
    addVacancy({ title, department, status, description, requirements });
    resetForm();
    setModalOpen(false);
  };

  const filtered = vacancies.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) || (v.department || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : v.status === filterStatus;
    const matchesStage = filterStage === 'all' ? true : v.candidates.some(c => c.stage === filterStage);
    const matchesRating = ratingMin > 0 ? v.candidates.some(c => (c.rating || 0) >= ratingMin) : true;
    const matchesDepartment = selectedDepartments.length > 0 ? selectedDepartments.includes(v.department || '') : true;
    return matchesSearch && matchesStatus && matchesStage && matchesRating && matchesDepartment;
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Вакансии</h1>
            <p className="text-muted-foreground text-sm">Управление вакансиями и профилями кандидатов</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Новая вакансия
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать вакансию</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
                  <Input placeholder="Департамент" value={department} onChange={e => setDepartment(e.target.value)} />
                  <Select value={status} onValueChange={(v: VacancyStatus) => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Открыта</SelectItem>
                      <SelectItem value="on_hold">Пауза</SelectItem>
                      <SelectItem value="closed">Закрыта</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
                  <Textarea placeholder="Требования" value={requirements} onChange={e => setRequirements(e.target.value)} />
                  <Button onClick={handleCreateVacancy} className="w-full">Создать</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

  <div className="flex flex-wrap gap-3 mb-6 items-center sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 z-10 border-b border-border">
          <div className="relative">
            <Input placeholder="Поиск" value={search} onChange={e => setSearch(e.target.value)} className="w-56" />
          </div>
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="open">Открыта</SelectItem>
              <SelectItem value="on_hold">Пауза</SelectItem>
              <SelectItem value="closed">Закрыта</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStage} onValueChange={v => setFilterStage(v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Этап кандидата" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все этапы</SelectItem>
              {Object.entries(stageLabel).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-28">Мин. рейтинг: {ratingMin}</span>
            <Slider value={[ratingMin]} max={100} step={5} onValueChange={(vals) => setRatingMin(vals[0] ?? 0)} className="w-40" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Департаменты</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Фильтр по департаменту</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[...new Set(vacancies.map(v => v.department).filter(Boolean))].map(dep => (
                <DropdownMenuCheckboxItem
                  key={dep}
                  checked={selectedDepartments.includes(dep!)}
                  onCheckedChange={(checked) => {
                    setSelectedDepartments(prev => checked ? [...prev, dep!] : prev.filter(d => d !== dep));
                  }}
                >{dep}</DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="gap-2" onClick={() => { setFilterStatus('all'); setFilterStage('all'); setSearch(''); setRatingMin(0); setSelectedDepartments([]); }}>
            <Filter className="w-4 h-4" />
            Сбросить
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Вакансия</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Кандидаты</TableHead>
                <TableHead>Обновлено</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(v => (
                <TableRow key={v.id} className="align-top cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/vacancies/${v.id}`)}>
                  <TableCell>
                    <div className="font-semibold">{v.title}</div>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => { e.stopPropagation(); if (v.department) navigate(`/departments/${encodeURIComponent(v.department)}`); }}
                    >
                      {v.department || '—'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-white ${VacancyStatusMap[v.status].color}`}>{VacancyStatusMap[v.status].label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {v.candidates.length === 0 && (
                        <div className="text-xs text-muted-foreground">Нет кандидатов</div>
                      )}
                      {v.candidates.map(c => (
                        <div key={c.id} className="flex items-center justify-between gap-2 bg-muted/50 rounded-md px-2 py-1">
                          <div className="flex flex-col">
                            <button
                              type="button"
                              className="text-left text-sm font-medium hover:underline"
                              onClick={(e) => { e.stopPropagation(); if (c.reportId) navigate(`/report/${c.reportId}`); }}
                            >{c.name}</button>
                            <span className="text-[10px] text-muted-foreground">{stageLabel[c.stage]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {typeof c.rating === 'number' && c.rating > 0 && (
                              <span className="text-xs font-semibold">{c.rating}</span>
                            )}
                            {c.reportId && (
                              <Badge
                                variant="outline"
                                className="text-[10px] cursor-pointer hover:bg-muted"
                                onClick={(e) => { e.stopPropagation(); navigate(`/report/${c.reportId}`); }}
                              >Отчет</Badge>
                            )}
                            <Select value={c.stage} onValueChange={(val: CandidateStage) => updateCandidate(v.id, c.id, { stage: val })}>
                              <SelectTrigger className="h-7 w-28 text-[10px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(stageLabel).map(([k, v]) => (
                                  <SelectItem key={k} value={k}>{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteCandidate(v.id, c.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full justify-center gap-1" onClick={() => addCandidateToVacancy(v.id, { name: 'Новый кандидат', stage: 'sourced', rating: 0, notes: '' })}>
                        <Users className="w-3 h-3" />
                        Добавить кандидата
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{v.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vacancies;
