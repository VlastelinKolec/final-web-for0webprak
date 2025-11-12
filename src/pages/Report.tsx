import { useParams, useNavigate } from 'react-router-dom';
import React from 'react';
import { ArrowLeft, Share2, Download, CheckCircle2, AlertTriangle, Check, X, ArrowRight, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
// no Badge needed here
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

interface SkillMeta {
  key: string;
  title: string;
  justification: string;
  strongIndicators: string[];
  riskIndicators: string[];
}

const skillMetaMap: SkillMeta[] = [
  {
    key: 'leadership',
    title: 'Управленческие навыки и лидерство',
    justification: 'Опыт управления командами и принятия продуктовых решений на уровне стратегии.',
    strongIndicators: [
      'Управлял командой >5 человек',
      'Инициировал улучшения процессов',
      'Фокус на развитии людей',
    ],
    riskIndicators: [
      'Недостаточно примеров коучинга',
      'Фокус только на результатах без людей',
    ],
  },
  {
    key: 'communication',
    title: 'Коммуникации',
    justification: 'Чётко структурирует мысли, адаптирует уровень детализации под аудиторию.',
    strongIndicators: [
      'Структурированные ответы (проблема → действие → результат)',
      'Упоминание взаимодействия со стейкхолдерами',
    ],
    riskIndicators: ['Иногда уходит в детали', 'Мало примеров сложных переговоров'],
  },
  {
    key: 'problemSolving',
    title: 'Решение проблем и критическое мышление',
    justification: 'Подход: финальный результат → данные → гипотезы → проверка.',
    strongIndicators: ['Выстраивает причинно-следственные связи', 'Использует метрики в аргументации'],
    riskIndicators: ['Редко говорит о проваленных гипотезах'],
  },
  {
    key: 'teamwork',
    title: 'Командная работа и эмпатия',
    justification: 'Способен сглаживать конфликты, создает условия доверия.',
    strongIndicators: ['Упоминает взаимодействие кросс-функционально', 'Говорит о ретроспективах'],
    riskIndicators: ['Мало примеров разрешения конфликтов'],
  },
  {
    key: 'adaptability',
    title: 'Адаптивность и устойчивость к стрессам',
    justification: 'Быстро перестраивается при изменении приоритетов, сохраняет фокус.',
    strongIndicators: ['Примеры смены стратегии', 'Поддержание темпа'],
    riskIndicators: ['Нет описаний работы под сильным давлением'],
  },
  {
    key: 'technical',
    title: 'Технические навыки',
    justification: 'Понимание архитектурных компромиссов и качества реализации.',
    strongIndicators: ['Использует технические термины корректно', 'Упоминает баланс скорость/качество'],
    riskIndicators: ['Нет упоминаний о техническом долге'],
  },
  {
    key: 'emotional',
    title: 'Эмоциональный интеллект',
    justification: 'Считывает контекст, адаптирует стиль коммуникации.',
    strongIndicators: ['Рефлексия собственных ошибок', 'Примеры поддержки коллег'],
    riskIndicators: ['Нет примеров работы с сопротивлением изменений'],
  },
];

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { interviews } = useApp();
  const interview = interviews.find((i) => i.id === id);

  if (!interview) {
    return (
      <DashboardLayout>
        <div className="p-8"><Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2"/>Назад</Button><div className="rounded-lg border border-border p-8 text-center"><h2 className="text-2xl font-bold mb-2">Отчет не найден</h2><p className="text-muted-foreground mb-4">Проверьте ссылку или вернитесь к списку.</p><Button onClick={() => navigate('/dashboard')}>К списку</Button></div></div>
      </DashboardLayout>
    );
  }

  if (interview.status !== 'completed') {
    return (
      <DashboardLayout>
        <div className="p-8"><Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 gap-2"><ArrowLeft className="w-4 h-4"/>Назад</Button><div className="border border-border rounded-xl p-12 text-center"><h2 className="text-3xl font-bold mb-4">Анализ в процессе</h2><p className="text-muted-foreground">Мы обрабатываем интервью. Обновите страницу позже.</p></div></div>
      </DashboardLayout>
    );
  }

  const skillsValues = interview.skills || {
    communication: 0,
    leadership: 0,
    problemSolving: 0,
    teamwork: 0,
    adaptability: 0,
    technical: 0,
    emotional: 0,
  };

  const overallMatch = interview.match || 0;
  const decision = overallMatch >= 75 ? 'Да' : overallMatch >= 60 ? 'Нужна доп. проверка' : 'Нет';
  const recommendedStep = overallMatch >= 75 ? 'Пригласить на финальное собеседование' : 'Собрать дополнительные рекомендации';

  const chartData = {
    labels: [
      'Управленческие навыки и лидерство',
      'Коммуникации',
      'Адаптивность и устойчивость',
      'Решение проблем',
      'Командная работа',
      'Технические',
      'Эмоц. интеллект',
    ],
    datasets: [
      {
        label: 'Оценка навыков',
        data: [
          skillsValues.leadership,
          skillsValues.communication,
          skillsValues.adaptability,
          skillsValues.problemSolving,
          skillsValues.teamwork,
          skillsValues.technical,
          skillsValues.emotional,
        ],
        backgroundColor: 'hsl(140 60% 45% / 0.25)',
        borderColor: 'hsl(140 60% 45%)',
        borderWidth: 2,
        pointBackgroundColor: 'hsl(140 60% 45%)',
      },
    ],
  };

  const chartOptions = {
    scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } },
    plugins: { legend: { display: false } },
  };

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => toast.success('Ссылка скопирована'));
  };

  const [files, setFiles] = React.useState<File[]>([]);
  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) {
      setFiles(prev => [...prev, ...selected]);
      toast.success('Файл добавлен', { description: selected.map(f=>f.name).join(', ') });
    }
  };

  // Derived collections
  const strengths = (interview.insights || []).slice(0, 4);
  const weaknesses = (interview.risks || []).slice(0, 3);
  const advantages = [
    'Лидер и ориентирован на результат',
    'Хорошая структура мышления',
  ];
  const redFlags = weaknesses.filter((w) => w.toLowerCase().includes('трудност') || w.toLowerCase().includes('риск'));
  const growthZones = [
    'Развитие стратегического мышления в долгосрочных продуктах',
    'Усиление практик управления изменениями и коучинга',
  ];

  const tags = [ '#agile', '#frontend', '#ecommerce', '#leadership' ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Back */}
          <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm text-muted-foreground hover:text-foreground gap-2">
            <ArrowLeft className="w-4 h-4"/>Назад к списку кандидатов
          </button>

          {/* Top block redesigned to match reference screenshot */}
          <div className="space-y-10">
            {/* Header row */}
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex items-center justify-center text-xl font-semibold">
                {interview.candidate.split(' ').map(p=>p[0]).join('')}
              </div>
              <div className="flex-1 pt-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground">{interview.candidate}</h1>
                <p className="text-base text-muted-foreground leading-snug">
                  Senior Project Manager<br/> (IT, e-commerce)
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="icon" variant="outline" className="rounded-full h-11 w-11 bg-muted/30 hover:bg-muted" aria-label="Скачать PDF">
                  <Download className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full h-11 w-11 bg-muted/30 hover:bg-muted" onClick={copyLink} aria-label="Скопировать ссылку">
                  <Share2 className="w-5 h-5" />
                </Button>
                <label className="rounded-full h-11 w-11 bg-muted/30 hover:bg-muted flex items-center justify-center border border-border cursor-pointer" aria-label="Прикрепить файл">
                  <Paperclip className="w-5 h-5" />
                  <input type="file" multiple onChange={handleAttach} className="hidden" />
                </label>
              </div>
            </div>

            {/* Info + Decision */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: candidate info */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Сведения о кандидате</h2>
                <Input readOnly value="https://huntflow.ru/12345678912345678912345678912345" className="h-10 text-sm" />
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-semibold">Опыт:</div>
                    <div>9 лет</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Ключевые компании:</div>
                    <div>Ozon, Яндекс, стартап в финтехе</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">ЗП ожидания:</div>
                    <div>280 000 руб (на руки)</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Формат работы:</div>
                    <div>гибрид / удалёнка</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Предпочтения:</div>
                    <div>Продуктовые команды, Agile-проекты(на руки)</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Мотивация:</div>
                    <div>Рост влияния и ответственности</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold">Описание кандидата:</div>
                  <p className="leading-relaxed text-muted-foreground">
                    Сформированный лидер с опытом управления IT-проектами в e-commerce и финтехе. Руководил распределёнными командами до 15 человек, запускал продукты с нуля и развивал существующие. Имеет успешный опыт внедрения Agile-практик, оптимизации процессов и выстраивания взаимодействия между бизнесом и разработкой.
                    Кандидат ищет проект, где сможет совмещать управление продуктом и людьми, развивать культуру прозрачных процессов и брать ответственность за результат.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tags.map(t => <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-muted text-foreground/70">{t}</span>)}
                  </div>
                </div>
              </div>
              {/* Right: decision & arguments */}
              <div className="space-y-6">
                <div className="border rounded-xl p-6 bg-card">
                  <h3 className="text-lg font-semibold mb-4 leading-tight">Решение о переходе на следующий этап</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><span className="font-semibold">Итог:</span> {decision === 'Да' ? <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="w-4 h-4"/>Да</span> : decision}</div>
                    <div className="flex items-center gap-2"><span className="font-semibold">Уровень уверенности:</span> <span className="flex items-center gap-1 text-green-700"><Check className="w-4 h-4"/>Высокий</span></div>
                  </div>
                </div>
                <div className="border rounded-xl p-6 bg-green-50 border-green-200 space-y-3">
                  <h4 className="font-semibold text-green-700">Аргументы «За»:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600"/> Успешные кейсы запуска в крупных компаниях.</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600"/> Развитые коммуникативные навыки, умение убеждать.</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600"/> Опыт работы в продуктовой среде (e-commerce).</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600"/> Зрелый уровень самоанализа и системного мышления.</li>
                  </ul>
                </div>
                <div className="border rounded-xl p-6 bg-red-50 border-red-200 space-y-3">
                  <h4 className="font-semibold text-red-700">Аргументы «Против»:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-600"/> Высокие ожидания по ЗП.</li>
                    <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-600"/> Небольшой опыт в заказных проектах.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Manager summary block */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Итоговая сводка для руководителя</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Overall match */}
              {/* Overall match removed per UX request */}

              {/* Recheck additionally */}
              <div className="rounded-2xl border bg-card p-6">
                <div className="text-lg font-semibold mb-4">Что перепроверить дополнительно:</div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    Подтвердить рекомендации от предыдущих работодателей.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    Уточнить готовность к офисному формату.
                  </li>
                </ul>
              </div>

              {/* Decision */}
              <div className="rounded-2xl border bg-card p-6">
                <div className="text-lg font-semibold mb-4">Решение:</div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700 leading-tight">{decision}</div>
                    <div className="text-sm text-muted-foreground mt-1">(с условием уточнения по ЗП и формату работы).</div>
                  </div>
                </div>
              </div>

              {/* Recommended step */}
              <div className="rounded-2xl border bg-green-50 p-6 border-green-200">
                <div className="text-lg font-semibold mb-4">Рекомендованный шаг:</div>
                <div className="flex items-start gap-3 text-base">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  Пригласить на финальное собеседование с руководителем отдела.
                </div>
              </div>
            </div>
          </div>

          {/* Attachments list */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Прикрепленные файлы</h3>
              <ul className="space-y-2 text-sm">
                {files.map(f => (
                  <li key={f.name} className="flex items-center justify-between rounded-md border p-3 bg-card">
                    <span className="truncate max-w-xs" title={f.name}>{f.name}</span>
                    <span className="text-xs text-muted-foreground">{(f.size/1024/1024).toFixed(2)} МБ</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skill map block - matches provided mock */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Карта софт скиллов</h2>

            {/* helpers */}
            {(() => {
              const Gauge = ({ value }: { value: number }) => (
                <div className="relative h-20 w-20" aria-label={`График ${value}%`}>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#16a34a ${value * 3.6}deg, #e6f6ea 0deg)`,
                    }}
                  />
                  <div className="absolute inset-2 rounded-full bg-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center leading-tight">
                      <div className="text-[10px] text-muted-foreground">Уровень</div>
                      <div className="text-[10px] text-muted-foreground -mt-0.5">соответствия</div>
                      <div className="text-xl font-extrabold text-green-700">{value}%</div>
                    </div>
                  </div>
                </div>
              );

              const skills = [
                {
                  title: 'Управленческие навыки и лидерство',
                  ai: 87,
                  weight: 25,
                  score: Math.max(0, Math.min(100, skillsValues.leadership || 88)) || 88,
                  level: 'Senior',
                  indicators: [
                    'Управлял параллельно 2–3 проектами по 200–300 часов в месяц',
                    'Самостоятельно предлагал и внедрял регламенты',
                    'Восстановил проект после неудачного предыдущего',
                  ],
                  justification:
                    'Кандидат показал зрелость в управлении людьми и процессами. Есть опыт кризисного менеджмента, построения процессов и коучинга. Демонстрируется инициативность в регламентации.',
                },
                {
                  title: 'Коммуникации',
                  ai: 76,
                  weight: 20,
                  score: Math.max(0, Math.min(100, skillsValues.communication || 92)) || 92,
                  level: 'Senior',
                  indicators: [
                    'Налаживал отношения с ключевыми заказчиками после неудачного запуска',
                    'Регулярно организовывал демонстрации для стейкхолдеров',
                    'Выстраивал прозрачные отчёты для клиентов',
                  ],
                  justification:
                    'Отличные навыки переговоров и ведения встреч. Умеет сглаживать конфликты и возвращать лояльность клиентов. Высокий уровень уверенности в презентациях и внешних коммуникациях.',
                },
                {
                  title: 'Планирование и организация процессов',
                  ai: 64,
                  weight: 20,
                  score: 84,
                  level: 'Upper-Middle',
                  indicators: [
                    'Планировал обучение тим-лида/тех-тренинга и онбординг для команды',
                    'Внедрял практики Agile и роли в команде',
                    'Оптимизировал процесс онбординга новых сотрудников',
                  ],
                  justification:
                    'Кандидат демонстрирует умение структурировать работу команды, описывать процессы и распределять зоны ответственности. Есть задел для достаточной масштабируемости и управляемости внедрений.',
                },
                {
                  title: 'Командная работа и эмпатия',
                  ai: 92,
                  weight: 15,
                  score: Math.max(0, Math.min(100, Math.round((skillsValues.teamwork + (skillsValues.emotional || 0)) / 2) || 78)) || 78,
                  level: 'Middle / Upper-Middle',
                  indicators: [
                    'Всегда оперативно разбирал блокеры команды на еженедельных встречах',
                    'Объяснял важность процессов простым языком',
                  ],
                  justification:
                    'Есть готовность поддерживать команду и внимательность к людям. Чётко и корректно даёт обратную связь, старается развивать культуру прозрачности. Ценит ответственность и гибкость.',
                },
                {
                  title: 'Решение проблем и критическое мышление',
                  ai: 32,
                  weight: 10,
                  score: Math.max(0, Math.min(100, skillsValues.problemSolving || 81)) || 81,
                  level: 'Upper-Middle',
                  indicators: [
                    'Успешно разбирал причины просрочек после инцидентов',
                    'Предлагал решения для снижения рисков',
                  ],
                  justification:
                    'Кандидат демонстрирует системность в анализе и причинно-следственных связях, опирается на данные и метрики. Понимает стоимость решения и его влияние на риск.',
                },
                {
                  title: 'Адаптивность и устойчивость к стрессам',
                  ai: 81,
                  weight: 10,
                  score: Math.max(0, Math.min(100, skillsValues.adaptability || 73)) || 73,
                  level: 'Middle',
                  indicators: [
                    'Брал на себя проект в критичный период и завершил успешно',
                    'Эффективно работал даже при высокой нагрузке и дедлайнах',
                  ],
                  justification:
                    'Хорошая устойчивость к стрессу, не теряет фокус при изменении приоритетов. Сохраняет качество результата при возрастающей нагрузке.',
                },
              ];

              return (
                <div className="grid md:grid-cols-3 gap-6">
                  {skills.map((s) => (
                    <div key={s.title} className="rounded-2xl border bg-white p-6 space-y-4">
                      <div className="text-[15px] font-semibold leading-snug">{s.title}</div>
                      <div className="flex items-center gap-4">
                        <Gauge value={s.score} />
                        <div className="text-sm space-y-1">
                          <div>Уверенность оценки ИИ: <span className="font-semibold">{s.ai}%</span></div>
                          <div>Вес в общей оценке: <span className="font-semibold">{s.weight}%</span></div>
                          <div>Уровень: <span className="font-semibold">{s.level}</span></div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold mb-1">Индикаторы (цитаты):</div>
                        <ul className="space-y-1">
                          {s.indicators.map((i) => (
                            <li key={i} className="flex items-start gap-2 text-[13px]">
                              <Check className="mt-0.5 h-4 w-4 text-green-600" /> {i}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-[13px] leading-relaxed">
                        <span className="font-semibold">Обоснование:</span> {s.justification}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Radar */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="text-sm font-semibold">График соответствия скиллов</h3>
            <div className="max-w-xl mx-auto"><Radar data={chartData} options={chartOptions} /></div>
            <div className="flex gap-4 justify-center text-[11px] text-muted-foreground"><div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500"/>Оценка кандидата</div></div>
          </div>

          {/* Strengths & weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-5 bg-green-50 border-green-200">
                  <h3 className="text-sm font-semibold mb-2">Сильные</h3>
                  <ul className="list-disc ml-4 text-[11px] space-y-1">{strengths.map(s=> <li key={s}>{s}</li>)}</ul>
                </div>
                <div className="border rounded-lg p-5 bg-card">
                  <h3 className="text-sm font-semibold mb-2">Ключевые преимущества</h3>
                  <ul className="list-disc ml-4 text-[11px] space-y-1">{advantages.map(a=> <li key={a}>{a}</li>)}</ul>
                </div>
                <div className="border rounded-lg p-5 bg-card">
                  <h3 className="text-sm font-semibold mb-2">Зоны развития</h3>
                  <ul className="list-disc ml-4 text-[11px] space-y-1">{growthZones.map(z=> <li key={z}>{z}</li>)}</ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border rounded-lg p-5 bg-red-50 border-red-200">
                  <h3 className="text-sm font-semibold mb-2">Слабые</h3>
                  <ul className="list-disc ml-4 text-[11px] space-y-1">{weaknesses.map(w=> <li key={w}>{w}</li>)}</ul>
                </div>
                <div className="border rounded-lg p-5 bg-card">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">Красные флаги <AlertTriangle className="w-4 h-4 text-red-600"/></h3>
                  {redFlags.length === 0 ? <div className="text-[11px] text-muted-foreground">Нет критических сигналов</div> : <ul className="list-disc ml-4 text-[11px] space-y-1">{redFlags.map(f=> <li key={f}>{f}</li>)}</ul>}
                </div>
              </div>
            </div>

          {/* STAR cases */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Кейсы (STAR-модель)</h2>
            <div className="space-y-4">
              {[{
                title: 'Кейс 1: Оптимизация логистики',
                situation: 'Падение SLA доставки до 87%.',
                task: 'Стабилизировать процесс и вернуть SLA >95%.',
                action: 'Анализ данных, пересборка маршрутов, внедрение норм времени.',
                result: 'SLA вырос до 96%, снизили издержки на 8%.',
              }, {
                title: 'Кейс 2: Запуск нового продукта',
                situation: 'Необходим MVP финтех-сервиса.',
                task: 'Запустить в срок < 3 месяца.',
                action: 'Сбор требований, быстрая архитектура, итеративные релизы.',
                result: 'Release через 10 недель, первые 5 корпоративных клиентов.',
              }].map(c => (
                <div key={c.title} className="border border-border rounded-lg p-5 bg-card">
                  <h3 className="text-sm font-semibold mb-3">{c.title}</h3>
                  <div className="grid md:grid-cols-4 gap-3 text-[11px]">
                    <div><span className="font-semibold">Situation:</span> {c.situation}</div>
                    <div><span className="font-semibold">Task:</span> {c.task}</div>
                    <div><span className="font-semibold">Action:</span> {c.action}</div>
                    <div><span className="font-semibold">Result:</span> {c.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t pt-8 text-[11px] text-muted-foreground space-y-4">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="font-semibold text-foreground">TalentMind</div>
              <div className="flex gap-4 text-xs">
                <a className="hover:text-foreground" href="#">Функционал</a>
                <a className="hover:text-foreground" href="#">Тарифы</a>
                <a className="hover:text-foreground" href="#">Контакты</a>
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-4">

            </div>
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Report;
