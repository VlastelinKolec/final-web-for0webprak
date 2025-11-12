import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Interview {
  id: string;
  candidate: string;
  position: string;
  date: string;
  status: 'processing' | 'completed' | 'error';
  score?: number;
  confidence?: number; // 0-100
  match?: number; // % соответствия 0-100
  attachments?: Array<{ name: string; size: number; type: string }>; // загруженные файлы отчета
  skills?: {
    communication: number;
    leadership: number;
    problemSolving: number;
    teamwork: number;
    adaptability: number;
    technical: number;
    emotional: number;
  };
  insights?: string[];
  risks?: string[];
  quotes?: string[];
}

export type VacancyStatus = 'open' | 'on_hold' | 'closed';
export type CandidateStage =
  | 'sourced'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface CandidateProfile {
  id: string;
  name: string;
  stage: CandidateStage;
  status: 'active' | 'archived';
  rating?: number; // 0-100
  notes?: string;
  resumeUrl?: string; // ссылка на резюме
  reportId?: string; // link to Interview.id if a report exists
}

export interface Vacancy {
  id: string;
  title: string;
  department?: string;
  status: VacancyStatus;
  createdAt: string;
  updatedAt: string;
  description?: string;
  requirements?: string;
  url?: string; // external job posting link
  candidates: CandidateProfile[];
}

interface AppContextType {
  interviews: Interview[];
  addInterview: (interview: Omit<Interview, 'id' | 'date'>) => void;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  vacancies: Vacancy[];
  addVacancy: (vacancy: Omit<Vacancy, 'id' | 'createdAt' | 'updatedAt' | 'candidates'>) => void;
  updateVacancy: (id: string, updates: Partial<Vacancy>) => void;
  deleteVacancy: (id: string) => void;
  addCandidateToVacancy: (vacancyId: string, candidate: Omit<CandidateProfile, 'id' | 'status'>) => void;
  updateCandidate: (
    vacancyId: string,
    candidateId: string,
    updates: Partial<CandidateProfile>
  ) => void;
  deleteCandidate: (vacancyId: string, candidateId: string) => void;
  currentUser: { name: string; role: string };
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockInterviews: Interview[] = [
  {
    id: '1',
    candidate: 'Анна Смирнова',
    position: 'Senior Frontend Developer',
    date: '2025-10-28',
    status: 'completed',
    score: 87,
    confidence: 82,
    match: 88,
    skills: {
      communication: 85,
      leadership: 78,
      problemSolving: 92,
      teamwork: 88,
      adaptability: 84,
      technical: 90,
      emotional: 82,
    },
    insights: [
      'Отличные навыки решения проблем и технические компетенции',
      'Сильные коммуникативные способности, особенно в объяснении сложных концепций',
      'Проявляет инициативу и самостоятельность в работе',
    ],
    risks: [
      'Может испытывать трудности с делегированием задач',
      'Иногда слишком фокусируется на деталях',
    ],
    quotes: [
      '"Я всегда стараюсь понять корневую причину проблемы, прежде чем предлагать решение"',
      '"В моей практике код-ревью - это не только поиск ошибок, но и обмен знаниями"',
    ],
  },
  {
    id: '2',
    candidate: 'Дмитрий Волков',
    position: 'Product Manager',
    date: '2025-10-27',
    status: 'completed',
    score: 92,
    confidence: 90,
    match: 94,
    skills: {
      communication: 95,
      leadership: 90,
      problemSolving: 88,
      teamwork: 93,
      adaptability: 91,
      technical: 85,
      emotional: 94,
    },
    insights: [
      'Исключительные лидерские качества и эмоциональный интеллект',
      'Умеет выстраивать эффективную коммуникацию с разными стейкхолдерами',
      'Стратегическое мышление и клиентоориентированность',
    ],
    risks: [
      'Может быть слишком оптимистичен в оценке сроков',
    ],
  },
  {
    id: '3',
    candidate: 'Елена Петрова',
    position: 'UX/UI Designer',
    date: '2025-10-26',
    status: 'completed',
    score: 78,
    confidence: 75,
    match: 80,
    skills: {
      communication: 82,
      leadership: 70,
      problemSolving: 80,
      teamwork: 85,
      adaptability: 75,
      technical: 78,
      emotional: 76,
    },
  },
  {
    id: '4',
    candidate: 'Михаил Иванов',
    position: 'Backend Developer',
    date: '2025-10-25',
    status: 'error',
  },
  {
    id: '5',
    candidate: 'Ольга Соколова',
    position: 'Data Analyst',
    date: '2025-10-24',
    status: 'completed',
    score: 83,
    confidence: 78,
    match: 86,
    skills: {
      communication: 80,
      leadership: 75,
      problemSolving: 90,
      teamwork: 82,
      adaptability: 85,
      technical: 88,
      emotional: 78,
    },
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [vacancies, setVacancies] = useState<Vacancy[]>([{
    id: 'v1',
    title: 'Senior Frontend Developer',
    department: 'R&D',
    status: 'open',
    createdAt: '2025-10-20',
    updatedAt: '2025-10-28',
    description: 'Разработка и поддержка фронтенд-части высоконагруженных сервисов',
    requirements: 'React, TypeScript, Vite, Tailwind, архитектура приложений',
    url: 'https://example.com/jobs/senior-frontend-developer',
    candidates: [
      {
        id: 'c1',
        name: 'Анна Смирнова',
        stage: 'interview',
        status: 'active',
        rating: 87,
        notes: 'Сильный Т-шейп, хорошая коммуникация',
        resumeUrl: 'https://example.com/resumes/anna-smirnova.pdf',
        reportId: '1',
      },
      {
        id: 'c2',
        name: 'Михаил Иванов',
        stage: 'screening',
        status: 'active',
        rating: 0,
        notes: 'Ожидает собеседование',
        resumeUrl: 'https://example.com/resumes/mikhail-ivanov.pdf',
      },
      // Mock more candidates across all stages to make the board look populated
      { id: 'c10', name: 'Егор Кузнецов', stage: 'sourced', status: 'active', notes: 'Отлик из базы' },
      { id: 'c11', name: 'Мария Орлова', stage: 'sourced', status: 'active', notes: 'Проходит тестовое' },
      { id: 'c12', name: 'Сергей Фомин', stage: 'screening', status: 'active', notes: 'Скрининг пройден' },
      { id: 'c13', name: 'Алина Романова', stage: 'screening', status: 'active', notes: 'Запросили доп. инфо' },
      { id: 'c14', name: 'Роман Ким', stage: 'interview', status: 'active', rating: 82, reportId: '3', resumeUrl: 'https://example.com/resumes/roman-kim.pdf' },
      { id: 'c15', name: 'Татьяна Белова', stage: 'interview', status: 'active', notes: 'Ждем финал' },
      { id: 'c16', name: 'Денис Попов', stage: 'offer', status: 'active', notes: 'Оффер отправлен', reportId: '1' },
      { id: 'c17', name: 'Иван Гусев', stage: 'offer', status: 'active', notes: 'Торг по зарплате', reportId: '1' },
      { id: 'c18', name: 'Кирилл Захаров', stage: 'hired', status: 'archived', notes: 'Выход через 2 недели', reportId: '1' },
      { id: 'c19', name: 'Виктория Егорова', stage: 'hired', status: 'archived' },
      { id: 'c20', name: 'Артем Соколов', stage: 'rejected', status: 'archived', notes: 'Не подошел по опыту', reportId: '3' },
      { id: 'c21', name: 'Наталья Лебедева', stage: 'rejected', status: 'archived', notes: 'Отказ соискателя', reportId: '5' },
    ],
  },
  {
    id: 'v2',
    title: 'Product Manager',
    department: 'Product',
    status: 'on_hold',
    createdAt: '2025-10-10',
    updatedAt: '2025-10-27',
    url: 'https://example.com/jobs/product-manager',
    candidates: [
      {
        id: 'c3',
        name: 'Дмитрий Волков',
        stage: 'offer',
        status: 'active',
        rating: 92,
        reportId: '2',
      },
      { id: 'c22', name: 'Екатерина Зайцева', stage: 'sourced', status: 'active' },
      { id: 'c23', name: 'Андрей Павлов', stage: 'screening', status: 'active' },
      { id: 'c24', name: 'Светлана Ковалёва', stage: 'interview', status: 'active', reportId: '2' },
      { id: 'c25', name: 'Павел Егоров', stage: 'rejected', status: 'archived', reportId: '2' },
    ],
  },
  {
    id: 'v3',
    title: 'UX/UI Designer',
    department: 'Design',
    status: 'open',
    createdAt: '2025-10-15',
    updatedAt: '2025-10-28',
    url: 'https://example.com/jobs/ux-ui-designer',
    candidates: [
      { id: 'c30', name: 'Елена Петрова', stage: 'interview', status: 'active', rating: 78, reportId: '3' },
      { id: 'c31', name: 'Алла Кузьмина', stage: 'sourced', status: 'active' },
      { id: 'c32', name: 'Дарья Богданова', stage: 'screening', status: 'active' },
      { id: 'c33', name: 'Галина Карпова', stage: 'offer', status: 'active', reportId: '3' },
      { id: 'c34', name: 'Валерия Сафонова', stage: 'rejected', status: 'archived', reportId: '3' },
    ],
  },
  {
    id: 'v4',
    title: 'Backend Developer',
    department: 'R&D',
    status: 'open',
    createdAt: '2025-10-12',
    updatedAt: '2025-10-29',
    url: 'https://example.com/jobs/backend-developer',
    candidates: [
      { id: 'c40', name: 'Илья Котов', stage: 'sourced', status: 'active' },
      { id: 'c41', name: 'Олег Миронов', stage: 'screening', status: 'active' },
      { id: 'c42', name: 'Петр Сидоров', stage: 'interview', status: 'active', reportId: '1' },
      { id: 'c43', name: 'Станислав Минаев', stage: 'offer', status: 'active', reportId: '1' },
      { id: 'c44', name: 'Юрий Лебедев', stage: 'hired', status: 'archived', reportId: '1' },
    ],
  },
  {
    id: 'v5',
    title: 'Data Analyst',
    department: 'Analytics',
    status: 'open',
    createdAt: '2025-10-18',
    updatedAt: '2025-10-28',
    url: 'https://example.com/jobs/data-analyst',
    candidates: [
      { id: 'c50', name: 'Ольга Соколова', stage: 'interview', status: 'active', rating: 83, reportId: '5' },
      { id: 'c51', name: 'Максим Архипов', stage: 'sourced', status: 'active' },
      { id: 'c52', name: 'Захар Логинов', stage: 'screening', status: 'active' },
      { id: 'c53', name: 'Владимир Крюков', stage: 'rejected', status: 'archived', reportId: '5' },
    ],
  }]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('auth') === '1';
    } catch {
      return false;
    }
  });
  const [currentUser] = useState({ name: 'Александр Козлов', role: 'Рекрутер' });

  const addInterview = (interview: Omit<Interview, 'id' | 'date'>) => {
    const newInterview: Interview = {
      ...interview,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setInterviews((prev) => [newInterview, ...prev]);

    // Simulate processing
    setTimeout(() => {
      updateInterview(newInterview.id, {
        status: 'completed',
        score: Math.floor(Math.random() * 30) + 70,
        confidence: Math.floor(Math.random() * 21) + 70,
        match: Math.floor(Math.random() * 21) + 75,
        skills: {
          communication: Math.floor(Math.random() * 30) + 70,
          leadership: Math.floor(Math.random() * 30) + 70,
          problemSolving: Math.floor(Math.random() * 30) + 70,
          teamwork: Math.floor(Math.random() * 30) + 70,
          adaptability: Math.floor(Math.random() * 30) + 70,
          technical: Math.floor(Math.random() * 30) + 70,
          emotional: Math.floor(Math.random() * 30) + 70,
        },
        insights: [
          'Анализ успешно завершен',
          'Кандидат демонстрирует сильные профессиональные навыки',
        ],
      });
    }, 4000);
  };

  const updateInterview = (id: string, updates: Partial<Interview>) => {
    setInterviews((prev) =>
      prev.map((interview) =>
        interview.id === id ? { ...interview, ...updates } : interview
      )
    );
  };

  const login = () => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem('auth', '1');
    } catch (err) {
      // non-fatal: storage might be unavailable (SSR/private mode)
      void err;
    }
  };
  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('auth');
    } catch (err) {
      // non-fatal: storage might be unavailable (SSR/private mode)
      void err;
    }
  };

  // Vacancy CRUD
  const addVacancy: AppContextType['addVacancy'] = (vacancy) => {
    const now = new Date().toISOString().split('T')[0];
    const v: Vacancy = {
      id: Date.now().toString(),
      title: vacancy.title,
      department: vacancy.department,
      status: vacancy.status,
      description: vacancy.description,
      requirements: vacancy.requirements,
      url: vacancy.url,
      createdAt: now,
      updatedAt: now,
      candidates: [],
    };
    setVacancies((prev) => [v, ...prev]);
  };

  const updateVacancy: AppContextType['updateVacancy'] = (id, updates) => {
    setVacancies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : v))
    );
  };

  const deleteVacancy: AppContextType['deleteVacancy'] = (id) => {
    setVacancies((prev) => prev.filter((v) => v.id !== id));
  };

  const addCandidateToVacancy: AppContextType['addCandidateToVacancy'] = (vacancyId, candidate) => {
    setVacancies((prev) =>
      prev.map((v) =>
        v.id === vacancyId
          ? {
              ...v,
              candidates: [
                {
                  id: Date.now().toString(),
                  status: 'active',
                  ...candidate,
                },
                ...v.candidates,
              ],
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : v
      )
    );
  };

  const updateCandidate: AppContextType['updateCandidate'] = (vacancyId, candidateId, updates) => {
    setVacancies((prev) =>
      prev.map((v) =>
        v.id === vacancyId
          ? {
              ...v,
              candidates: v.candidates.map((c) => (c.id === candidateId ? { ...c, ...updates } : c)),
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : v
      )
    );
  };

  const deleteCandidate: AppContextType['deleteCandidate'] = (vacancyId, candidateId) => {
    setVacancies((prev) =>
      prev.map((v) =>
        v.id === vacancyId
          ? { ...v, candidates: v.candidates.filter((c) => c.id !== candidateId), updatedAt: new Date().toISOString().split('T')[0] }
          : v
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        interviews,
        addInterview,
        updateInterview,
        vacancies,
        addVacancy,
        updateVacancy,
        deleteVacancy,
        addCandidateToVacancy,
        updateCandidate,
        deleteCandidate,
        currentUser,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
