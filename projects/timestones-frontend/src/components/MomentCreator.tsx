import { useState, useRef } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ConnectWalletMenu } from '@txnlab/use-wallet-ui-react';
import { useSnackbar } from 'notistack';
import { pinFileToIPFS, pinJSONToIPFS } from './utils/pinata';
import { getAlgorandClient } from './utils/setupClients';
import { useWallet } from '@txnlab/use-wallet-react';

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

export function MomentCreator({ activeAddress }: MomentCreatorProps) {
  const [description, setDescription] = useState('');
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { enqueueSnackbar } = useSnackbar();
  const { transactionSigner } = useWallet();

  const today = new Date();
  const formattedDate = today.toISOString();
  const DateWithoutDashes = formattedDate.replace(/[-:T.Z]/g, '').substring(2, 8);

  const algorandClient = getAlgorandClient();

  const handleSubmit = async () => {
    if (!activeAddress) {
      promptWalletConnection();
      return;
    }
    setLoading(true);

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' });
      setLoading(false);
      return;
    }
    console.log('algorand client: ', algorandClient);

    algorandClient.account.setDefaultSigner(transactionSigner);

    if (!nftImage) {
      enqueueSnackbar('Please upload an image first', { variant: 'warning' });
      setLoading(false);
      return;
    }

    let metadataRootString: string;

    try {
      const ipfsHash = await pinFileToIPFS(nftImage);
      console.log('ipfsHash: ', ipfsHash);

      const ipfs_data: IPFSData = {
        name: `${formattedDate}`,
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
    } catch (e: any) {
      enqueueSnackbar(`Error during image upload to IPFS: ${e.message}`, { variant: 'error' });
      setLoading(false);
      return;
    }

    console.log('metadataRoot: ', metadataRootString);
    console.log('formattedDate: ', formattedDate);
    console.log('DateWithoutDashes: ', DateWithoutDashes);

    try {
      const result = await algorandClient.send.assetCreate({
        sender: activeAddress,
        defaultFrozen: true,
        assetName: `${formattedDate}`,
        unitName: `pd${DateWithoutDashes}`,
        url: `ipfs://${metadataRootString}/#arc3`,
        total: 1n,
        decimals: 0,
      });

      enqueueSnackbar(`Successfully Created Photo Diary with Asset ID: ${result?.assetId}`, {
        variant: 'success',
      });

      setNftImageUrl('');
      setNftImage(null);
      setDescription('');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
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
                disabled={!nftImage || !description.trim()}
                onClick={handleSubmit}
              >
                Preserve this moment
              </Button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
