import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface UserDashboardProps {
  view: 'grid' | 'calendar';
}

// Mock data with more posts and specific timestamps
const moments = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
    note: 'Beautiful sunset at the beach',
    date: new Date('2025-03-15T18:30:00'),
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
    note: 'Morning coffee and coding session',
    date: new Date('2025-03-14T09:15:00'),
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg',
    note: 'Weekend hike in the mountains',
    date: new Date('2025-03-10T11:45:00'),
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/3659862/pexels-photo-3659862.jpeg',
    note: 'Family dinner celebration',
    date: new Date('2025-03-08T19:00:00'),
  },
  {
    id: 5,
    image: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg',
    note: 'First day at the new office',
    date: new Date('2025-03-05T10:00:00'),
  },
];

export function UserDashboard({ view }: UserDashboardProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMoment, setSelectedMoment] = useState<(typeof moments)[0] | null>(null);

  const momentDates = moments.map(moment => format(moment.date, 'yyyy-MM-dd'));

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const selectedDate = format(date, 'yyyy-MM-dd');
    if (!momentDates.includes(selectedDate)) return;

    setDate(date);
    const moment = moments.find(m => format(m.date, 'yyyy-MM-dd') === selectedDate);
    setSelectedMoment(moment || null);
  };

  const disabledDays = (date: Date) => {
    return !momentDates.includes(format(date, 'yyyy-MM-dd'));
  };

  if (view === 'calendar') {
    return (
      <div className="flex gap-12">
        <Card className="w-[300px] bg-card/50 shadow-none border-0">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Your Moments</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'justify-start text-left font-normal p-0',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleSelect}
                  disabled={disabledDays}
                  modifiers={{
                    highlighted: date => momentDates.includes(format(date, 'yyyy-MM-dd')),
                  }}
                  modifiersStyles={{
                    highlighted: { backgroundColor: 'hsl(var(--accent) / 0.5)' },
                  }}
                  className="rounded-lg shadow-none"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={disabledDays}
              modifiers={{
                highlighted: date => momentDates.includes(format(date, 'yyyy-MM-dd')),
              }}
              modifiersStyles={{
                highlighted: { backgroundColor: 'hsl(var(--accent) / 0.5)' },
              }}
              className="rounded-lg shadow-none"
            />
          </div>
        </Card>
        <div className="flex-1">
          {selectedMoment ? (
            <Card className="bg-card/50 shadow-none border-0 overflow-hidden">
              <img
                src={selectedMoment.image}
                alt={selectedMoment.note}
                className="w-full h-[500px] object-cover"
              />
              <div className="p-4">
                <p className="text-lg mb-2">{selectedMoment.note}</p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedMoment.date, 'PPPp')}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center text-muted-foreground bg-card/50 shadow-none border-0">
              Select a moment to view details
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {moments.map(moment => (
        <Card key={moment.id} className="bg-card/50 shadow-none border-0 overflow-hidden">
          <img src={moment.image} alt={moment.note} className="w-full h-48 object-cover" />
          <div className="p-4">
            <p className="text-sm mb-2">{moment.note}</p>
            <p className="text-xs text-muted-foreground">{format(moment.date, 'PPPp')}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
