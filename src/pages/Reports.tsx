import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Filter, Upload, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import UploadModal from '@/components/UploadModal';

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

const Reports = () => {
  const navigate = useNavigate();
  const { vacancies, interviews, addCandidateToVacancy } = useApp();
  const [uploadOpen, setUploadOpen] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

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
            <h1 className="text-3xl font-bold mb-1">Отчеты</h1>
            <p className="text-muted-foreground text-sm">Вакансии со сводной статистикой, переход к ранжированным кандидатам</p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2" onClick={() => setUploadOpen(true)}>
              <Upload className="w-4 h-4" />
              Загрузить отчет
            </Button>
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
                <TableHead className="text-right">Соответствие (ср./макс.)</TableHead>
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
                    <Badge variant="outline" className="text-xs">{v.candidates.length}</Badge>
                  </TableCell>
                  <TableCell className="text-right align-top">
                    {(() => {
                      const matches = v.candidates
                        .map(c => c.reportId ? (interviews.find(i => i.id === c.reportId)?.match || 0) : 0)
                        .filter(n => n > 0);
                      if (matches.length === 0) return <span className="text-muted-foreground">—</span>;
                      const avg = Math.round(matches.reduce((a,b)=>a+b,0) / matches.length);
                      const max = Math.max(...matches);
                      return <span className="font-semibold">{avg}% <span className="text-muted-foreground">/ {max}%</span></span>;
                    })()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{v.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </DashboardLayout>
  );
};

export default Reports;
