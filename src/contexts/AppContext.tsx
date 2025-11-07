import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Interview {
  id: string;
  candidate: string;
  position: string;
  date: string;
  status: 'processing' | 'completed' | 'error';
  score?: number;
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

interface AppContextType {
  interviews: Interview[];
  addInterview: (interview: Omit<Interview, 'id' | 'date'>) => void;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AppContext.Provider
      value={{
        interviews,
        addInterview,
        updateInterview,
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
