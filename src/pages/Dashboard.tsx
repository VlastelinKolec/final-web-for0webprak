import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import DashboardLayout from '@/components/DashboardLayout';
import UploadModal from '@/components/UploadModal';
import { useApp } from '@/contexts/AppContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { interviews } = useApp();
  const navigate = useNavigate();

  // Filters state
  const [statusFilter, setStatusFilter] = useState<{ completed: boolean; processing: boolean; error: boolean }>({
    completed: false,
    processing: false,
    error: false,
  });
  const [minScore, setMinScore] = useState(0);
  const [minConfidence, setMinConfidence] = useState(0);
  const [minMatch, setMinMatch] = useState(0);

  const resetFilters = () => {
    setStatusFilter({ completed: false, processing: false, error: false });
    setMinScore(0);
    setMinConfidence(0);
    setMinMatch(0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Готово
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="border-primary text-primary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            В обработке
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Ошибка
          </Badge>
        );
      default:
        return null;
    }
  };

  const anyStatusSelected = statusFilter.completed || statusFilter.processing || statusFilter.error;
  const filteredInterviews = interviews
    .filter((interview) => {
      const matchesSearch =
        interview.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = anyStatusSelected
        ? (statusFilter as Record<string, boolean>)[interview.status]
        : true;
      const meetsScore = typeof interview.score === 'number' ? interview.score >= minScore : minScore === 0;
      const meetsConfidence =
        typeof interview.confidence === 'number' ? interview.confidence >= minConfidence : minConfidence === 0;
      const meetsMatch = typeof interview.match === 'number' ? interview.match >= minMatch : minMatch === 0;
      return matchesSearch && matchesStatus && meetsScore && meetsConfidence && meetsMatch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">История отчетов</h1>
          <p className="text-muted-foreground">Управляйте и просматривайте отчеты по интервью</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по кандидату или вакансии..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Фильтры
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Статус интервью</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter.completed}
                onCheckedChange={(v) => setStatusFilter((s) => ({ ...s, completed: Boolean(v) }))}
              >
                Готово
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.processing}
                onCheckedChange={(v) => setStatusFilter((s) => ({ ...s, processing: Boolean(v) }))}
              >
                В обработке
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.error}
                onCheckedChange={(v) => setStatusFilter((s) => ({ ...s, error: Boolean(v) }))}
              >
                Ошибка
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Пороговые значения</DropdownMenuLabel>
              <div className="px-2 py-2 space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Итоговая оценка</span>
                    <span>{minScore}</span>
                  </div>
                  <Slider value={[minScore]} max={100} step={5} onValueChange={(v) => setMinScore(v[0] ?? 0)} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Уверенность</span>
                    <span>{minConfidence}%</span>
                  </div>
                  <Slider
                    value={[minConfidence]}
                    max={100}
                    step={5}
                    onValueChange={(v) => setMinConfidence(v[0] ?? 0)}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>% соответствия</span>
                    <span>{minMatch}%</span>
                  </div>
                  <Slider value={[minMatch]} max={100} step={5} onValueChange={(v) => setMinMatch(v[0] ?? 0)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Сбросить
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setUploadModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Загрузить интервью
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Кандидат</TableHead>
                <TableHead className="font-semibold">Вакансия</TableHead>
                <TableHead className="font-semibold">Дата</TableHead>
                <TableHead className="font-semibold">Статус</TableHead>
                <TableHead className="font-semibold text-right">Итог</TableHead>
                <TableHead className="font-semibold text-right">Уверенность</TableHead>
                <TableHead className="font-semibold text-right">% Соответствия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.map((interview) => (
                <TableRow
                  key={interview.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    if (interview.status === 'completed') {
                      navigate(`/report/${interview.id}`);
                    }
                  }}
                >
                  <TableCell className="font-medium">{interview.candidate}</TableCell>
                  <TableCell className="text-muted-foreground">{interview.position}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(interview.date).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>{getStatusBadge(interview.status)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {interview.score ? (
                      <span>
                        {interview.score}
                        <span className="text-xs text-muted-foreground">/100</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {interview.confidence ? (
                      <span className="text-foreground">{interview.confidence}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {interview.match ? (
                      <span className="text-foreground">{interview.match}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </DashboardLayout>
  );
};

export default Dashboard;
