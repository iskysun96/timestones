import { useState, useRef, useEffect } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ConnectWalletMenu } from '@txnlab/use-wallet-ui-react';
import { useSnackbar } from 'notistack';
import { pinFileToIPFS, pinJSONToIPFS } from './utils/pinata';
import { getAlgorandClient } from './utils/setupClients';
import { useWallet } from '@txnlab/use-wallet-react';
import { fetchDiaryAssets } from './utils/fetchDiaryAssets';

interface IPFSData {
  name: string;
  standard: 'arc3';
  image: string;
  image_mime_type: string;
  description: string;
  properties: {
    assetType: 'timestone-moments';
  };
}

interface MomentCreatorProps {
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

export function MomentCreator({ activeAddress }: MomentCreatorProps) {
  const [description, setDescription] = useState('');
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const [diaryAssets, setDiaryAssets] = useState<DiaryAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { transactionSigner } = useWallet();

  const today = new Date();
  const dateOnly = today.toISOString().slice(0, 10); // 'yyyy-MM-dd'
  const DateWithoutDashes = dateOnly.replace(/-/g, '').substring(2, 8);

  const algorandClient = getAlgorandClient();

  useEffect(() => {
    if (!activeAddress) {
      setDiaryAssets([]);
      return;
    }
    setAssetsLoading(true);
    fetchDiaryAssets(activeAddress)
      .then(setDiaryAssets)
      .finally(() => setAssetsLoading(false));
  }, [activeAddress]);

  const hasUploadedToday = () => {
    // Bypass restriction in development mode
    if (import.meta.env.VITE_BYPASS_DAILY_LIMIT === 'true') {
      console.log('Development mode: Bypassing daily upload restriction');
      return false;
    }

    if (!Array.isArray(diaryAssets)) return false;
    return diaryAssets.some(asset => {
      const assetDate = new Date(asset.date);
      return assetDate.toISOString().slice(0, 10) === dateOnly;
    });
  };

  const handleSubmit = async () => {
    if (!activeAddress) {
      promptWalletConnection();
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' });
      return;
    }

    if (hasUploadedToday()) {
      enqueueSnackbar('You can only upload one moment per day', { variant: 'warning' });
      return;
    }

    setLoading(true);

    algorandClient.account.setDefaultSigner(transactionSigner);

    if (!nftImage) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      setLoading(false);
      return;
    }

    let metadataRootString: string;

    try {
      const ipfsHash = await pinFileToIPFS(nftImage);

      const ipfs_data: IPFSData = {
        name: `${dateOnly}`,
        standard: 'arc3',
        image: String(ipfsHash),
        image_mime_type: nftImage.type,
        description: description,
        properties: {
          assetType: 'timestone-moments',
        },
      };

      const metadataRoot = await pinJSONToIPFS(ipfs_data);

      console.log(metadataRoot);
      metadataRootString = String(metadataRoot);
    } catch (e: unknown) {
      enqueueSnackbar(
        `Error during image upload to IPFS: ${e instanceof Error ? e.message : String(e)}`,
        { variant: 'error' }
      );
      setLoading(false);
      return;
    }

    let result;
    try {
      result = await algorandClient.send.assetCreate({
        sender: activeAddress,
        defaultFrozen: true,
        assetName: `${dateOnly}`,
        unitName: `pd${DateWithoutDashes}`,
        url: `ipfs://${metadataRootString}/#arc3`,
        total: 1n,
        decimals: 0,
      });
      console.log('asset create result:', result);

      setNftImageUrl('');
      setNftImage(null);
      setDescription('');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        `Error during asset creation: ${error instanceof Error ? error.message : String(error)}`,
        {
          variant: 'error',
        }
      );
      setLoading(false);
      return;
    }
    enqueueSnackbar(`Successfully Created Photo Diary with Asset ID: ${result?.assetId}`, {
      variant: 'success',
    });

    // Clear sessionStorage cache and reload to trigger refetch in UserDashboard
    sessionStorage.removeItem(`hasFetched_${activeAddress}`);
    sessionStorage.removeItem(`diaryAssets_${activeAddress}`);
    window.location.reload();
    setLoading(false);
  };

  const promptWalletConnection = () => {
    // Programmatically click the hidden connect button
    connectButtonRef.current?.click();
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!activeAddress) {
      promptWalletConnection();
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setNftImage(file);
      setNftImageUrl(URL.createObjectURL(file));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeAddress) {
      promptWalletConnection();
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      setNftImage(file);
      setNftImageUrl(URL.createObjectURL(file));
    }
  };

  const handleTextareaFocus = () => {
    if (!activeAddress) {
      promptWalletConnection();
    }
  };

  return (
    <>
      {/* Hidden ConnectWalletMenu with button that will be triggered programmatically */}
      <div className="hidden">
        <ConnectWalletMenu>
          <Button ref={connectButtonRef}>Connect</Button>
        </ConnectWalletMenu>
      </div>

      <Card className="max-w-lg mx-auto bg-card shadow-md border-accent/20">
        <div
          className="relative group cursor-pointer p-4"
          onDragOver={e => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={() => {
            if (!activeAddress) {
              promptWalletConnection();
            } else {
              document.getElementById('image-upload')?.click();
            }
          }}
        >
          {nftImageUrl ? (
            <div className="overflow-hidden rounded-lg p-2">
              <img
                src={nftImageUrl}
                alt="Preview"
                className="w-full object-contain rounded-lg"
                style={{ maxHeight: '384px' }}
              />
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground group-hover:text-accent transition-colors rounded-lg">
              <Upload className="w-8 h-8 mb-2" />
              <p className="text-sm">Share a photo of your moment</p>
            </div>
          )}
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageSelect}
          />
        </div>

        <div className="p-4">
          <Textarea
            placeholder="Tell us about this special moment..."
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 200))}
            onFocus={handleTextareaFocus}
            className="mb-3 bg-background/50 resize-none border-accent/20 focus:border-accent/40 placeholder:text-muted-foreground/70"
            rows={3}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{description.length}/200</p>
            {loading ? (
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={true}
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preserving...
              </Button>
            ) : (
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={!nftImage || !description.trim() || hasUploadedToday() || assetsLoading}
                onClick={handleSubmit}
              >
                {assetsLoading
                  ? 'Checking...'
                  : hasUploadedToday()
                    ? 'Already uploaded today'
                    : 'Preserve this moment'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
