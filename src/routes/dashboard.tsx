import { useState } from 'react';
import { Calendar, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDashboard } from '@/components/UserDashboard';

interface DashboardProps {
  activeAddress: string | null;
}

export function Dashboard({ activeAddress }: DashboardProps) {
  const [view, setView] = useState<'grid' | 'calendar'>('grid');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">My Moments</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <Grid className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
        </div>
      </div>

      <UserDashboard view={view} activeAddress={activeAddress} />
    </div>
  );
}
