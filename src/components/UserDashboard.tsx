import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { fetchDiaryAssets } from './utils/fetchDiaryAssets';

interface UserDashboardProps {
  view: 'grid' | 'calendar';
  activeAddress: string | null;
}

type DiaryAsset = {
  assetId: number;
  url: string;
  assetName: string;
  unitName: string;
  description: string;
  assetType: string;
  date: Date;
};

export function UserDashboard({ view, activeAddress }: UserDashboardProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [diaryAssets, setDiaryAssets] = useState<DiaryAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<DiaryAsset | null>(null);
  const navigate = useNavigate();

  const wallet = useWallet();

  // Dates from diaryAssets (only valid dates)
  const diaryAssetDates = diaryAssets
    .map(asset => {
      const d = new Date(asset.date);
      return !isNaN(d.getTime()) ? format(d, 'yyyy-MM-dd') : null;
    })
    .filter(Boolean) as string[];

  // State for selected diary asset in calendar view
  const [selectedDiaryAsset, setSelectedDiaryAsset] = useState<DiaryAsset | null>(null);

  // Update handleSelect to use diaryAssets
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const selectedDate = format(date, 'yyyy-MM-dd');
    if (!diaryAssetDates.includes(selectedDate)) return;

    setDate(date);
    const asset = diaryAssets.find(a => format(a.date, 'yyyy-MM-dd') === selectedDate);
    setSelectedDiaryAsset(asset || null);
  };

  // Update disabledDays to use diaryAssetDates
  const disabledDays = (date: Date) => {
    return !diaryAssetDates.includes(format(date, 'yyyy-MM-dd'));
  };

  // Cleanup function to remove cached data
  const cleanupCachedData = (address: string) => {
    sessionStorage.removeItem(`hasFetched_${address}`);
    sessionStorage.removeItem(`diaryAssets_${address}`);
  };

  // Handle wallet disconnection
  useEffect(() => {
    console.log('wallet.activeAddress: ', wallet.activeAddress);
    console.log('activeAddress: ', activeAddress);

    if (!wallet.activeAddress) {
      console.log('wallet disconnected');
      // Clean up any existing data
      if (activeAddress) {
        cleanupCachedData(activeAddress);
      }
      navigate('/');
    }
  }, [wallet.activeAddress, activeAddress, navigate]);

  // ================================ Blockchain Functions ================================

  // Use fetchDiaryAssets utility with sessionStorage caching
  const fetchAssets = async () => {
    if (!activeAddress) return;
    const cacheKey = `diaryAssets_${activeAddress}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      console.log('using cached data');
      setDiaryAssets(JSON.parse(cachedData));
      return;
    }
    try {
      const assets = await fetchDiaryAssets(activeAddress);
      setDiaryAssets(assets);
      sessionStorage.setItem(cacheKey, JSON.stringify(assets));
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [activeAddress]);

  if (view === 'calendar') {
    return (
      <div className="flex flex-col lg:flex-row gap-12">
        <Card className="w-full lg:w-[300px] bg-card/50 shadow-none border-0 flex flex-col items-center">
          <div className="flex items-center justify-between p-4 w-full">
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
                    highlighted: date => diaryAssetDates.includes(format(date, 'yyyy-MM-dd')),
                  }}
                  modifiersStyles={{
                    highlighted: { backgroundColor: 'hsl(var(--accent) / 0.5)' },
                  }}
                  className="rounded-lg shadow-none"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="p-4 w-full flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={disabledDays}
              modifiers={{
                highlighted: date => diaryAssetDates.includes(format(date, 'yyyy-MM-dd')),
              }}
              modifiersStyles={{
                highlighted: { backgroundColor: 'hsl(var(--accent) / 0.5)' },
              }}
              className="rounded-lg shadow-none"
            />
          </div>
        </Card>
        <div className="flex-1">
          {selectedDiaryAsset ? (
            <Card className="bg-card/50 shadow-none border-0 overflow-hidden">
              <img
                src={selectedDiaryAsset.url}
                alt={selectedDiaryAsset.description}
                className="w-full h-[300px] lg:h-[500px] object-contain"
              />
              <div className="p-4">
                <p className="text-lg mb-2">{selectedDiaryAsset.description}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDiaryAsset.date && !isNaN(new Date(selectedDiaryAsset.date).getTime())
                    ? format(new Date(selectedDiaryAsset.date), 'PPP')
                    : 'Invalid date'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a date to view your moment</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diaryAssets.map(moment => (
          <Card
            key={moment.assetId}
            className="bg-card/50 shadow-none border-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedAsset(moment)}
          >
            <AspectRatio ratio={4 / 5}>
              <img src={moment.url} alt={moment.unitName} className="w-full h-full object-cover" />
            </AspectRatio>
            <div className="p-2">
              <p className="text-sm text-muted-foreground">
                {moment.date && !isNaN(new Date(moment.date).getTime())
                  ? format(new Date(moment.date), 'PPP')
                  : 'Invalid date'}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-3xl">
          {selectedAsset && (
            <div className="space-y-4">
              <div className="relative w-full">
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.unitName}
                    className="w-full h-full object-contain"
                  />
                </AspectRatio>
              </div>
              <div className="space-y-2">
                <p className="text-base">{selectedAsset.description}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAsset.date && !isNaN(new Date(selectedAsset.date).getTime())
                    ? format(new Date(selectedAsset.date), 'PPP')
                    : 'Invalid date'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
