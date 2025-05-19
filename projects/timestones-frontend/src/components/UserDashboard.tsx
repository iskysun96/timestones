import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { getAlgorandClient } from './utils/setupClients';
import { useWallet } from '@txnlab/use-wallet-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface UserDashboardProps {
  view: 'grid' | 'calendar';
  activeAddress: string | null;
}

const PD = 'pd';

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
  const [selectedMoment, setSelectedMoment] = useState<(typeof moments)[0] | null>(null);
  const [diaryAssets, setDiaryAssets] = useState<DiaryAsset[]>([]);
  const navigate = useNavigate();

  const wallet = useWallet();
  const algorandClient = getAlgorandClient();

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

  //get Image Url from metadata Url uploaded on IPFS
  const getIpfsUrlAndDescriptionAndAssetType = async (url: string) => {
    const slicedUrl = url.slice(7, url.length + 1);
    const response = await axios.get(`https://ipfs.algonode.xyz/ipfs/${slicedUrl}`);
    let responseImage: string;
    if (response.data.image.startsWith('ipfs://')) {
      responseImage = response.data.image.slice(7, url.length + 1);
    } else {
      responseImage = response.data.image;
    }
    return {
      image: `https://ipfs.algonode.xyz/ipfs/${responseImage}`,
      description: response.data.description,
      assetType: response.data.properties.assetType,
    };
  };

  const fetchAssetUnitNames = async () => {
    if (activeAddress) {
      try {
        const balances = (await algorandClient.account.getInformation(activeAddress)).assets!;
        console.log('balances: ', balances);
        const diaryAssets: DiaryAsset[] = [];

        for (const balance of balances) {
          const assetInfo = await algorandClient.asset.getById(balance.assetId);
          console.log('assetInfo: ', assetInfo);
          if (assetInfo.unitName === undefined || assetInfo.url === 'ipfs://undefined/#arc3') {
            continue;
          }

          if (assetInfo.unitName.startsWith(PD)) {
            const ipfsUrl = await getIpfsUrlAndDescriptionAndAssetType(assetInfo.url!);
            const assetWithDescription: DiaryAsset = {
              assetId: Number(assetInfo.assetId),
              url: ipfsUrl.image,
              assetName: assetInfo.assetName || '',
              unitName: assetInfo.unitName || '',
              description: ipfsUrl.description,
              assetType: ipfsUrl.assetType,
              date: new Date(assetInfo.assetName || ''),
            };
            console.log('assetWithDescription: ', assetWithDescription);
            diaryAssets.push(assetWithDescription);
          }
        }
        console.log('diaryAssets: ', diaryAssets);
        return diaryAssets;
      } catch (error) {
        console.error('Error fetching asset balances:', error);
        return;
      }
    }
    return;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!wallet || !wallet.activeAddress) return;

      // Check if we've already fetched data for this address
      const hasFetched = sessionStorage.getItem(`hasFetched_${wallet.activeAddress}`);
      const cachedData = sessionStorage.getItem(`diaryAssets_${wallet.activeAddress}`);

      console.log('hasFetched: ', hasFetched);
      console.log('cachedData: ', cachedData);

      if (!hasFetched) {
        console.log('Fetching data for the first time');
        try {
          const assets = await fetchAssetUnitNames();
          if (assets === undefined) {
            return;
          }
          console.log(assets);
          setDiaryAssets(assets);
          // Store both the fetch state and the data
          sessionStorage.setItem(`hasFetched_${wallet.activeAddress}`, 'true');
          sessionStorage.setItem(`diaryAssets_${wallet.activeAddress}`, JSON.stringify(assets));
        } catch (error) {
          console.error('Error fetching assets:', error);
        }
      } else if (cachedData) {
        console.log('Data already fetched, using cached data');
        setDiaryAssets(JSON.parse(cachedData));
      }
    };

    fetchData();
  }, [activeAddress]);

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
      {diaryAssets.map(moment => (
        <Card key={moment.assetId} className="bg-card/50 shadow-none border-0 overflow-hidden">
          <img src={moment.url} alt={moment.unitName} className="w-full h-48 object-cover" />
          <div className="p-4">
            <p className="text-sm mb-2">{moment.description}</p>
            <p className="text-xs text-muted-foreground">
              {(() => {
                try {
                  const date = new Date(moment.assetName);
                  return format(date, 'PPPp');
                } catch (error) {
                  console.error('Error formatting date:', error);
                  return 'Invalid date';
                }
              })()}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
