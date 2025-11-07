import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileAudio, FileVideo } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadModal = ({ open, onOpenChange }: UploadModalProps) => {
  const [candidate, setCandidate] = useState('');
  const [position, setPosition] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { addInterview } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidate || !position) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    addInterview({
      candidate,
      position,
      status: 'processing',
    });

    toast.success('Интервью добавлено в обработку', {
      description: 'Анализ займет несколько секунд',
    });

    setCandidate('');
    setPosition('');
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Загрузить интервью</DialogTitle>
          <DialogDescription>
            Загрузите аудио или видео файл интервью для анализа с помощью ИИ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="file">Файл интервью *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                id="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    {file.type.startsWith('audio') ? (
                      <FileAudio className="w-8 h-8 text-primary" />
                    ) : (
                      <FileVideo className="w-8 h-8 text-primary" />
                    )}
                    <div className="text-left">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} МБ
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Нажмите для выбора файла
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Поддерживаются аудио и видео форматы (до 500 МБ)
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidate">ФИО кандидата *</Label>
            <Input
              id="candidate"
              placeholder="Иван Иванов"
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Вакансия *</Label>
            <Input
              id="position"
              placeholder="Senior Frontend Developer"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              Начать анализ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
