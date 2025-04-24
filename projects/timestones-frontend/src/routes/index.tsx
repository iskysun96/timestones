import { MomentCreator } from '@/components/MomentCreator';
import { Camera, Lock, Heart } from 'lucide-react';

interface IndexProps {
  activeAddress: string | null;
}

export function Index({ activeAddress }: IndexProps) {
  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-start py-8">
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight mb-4 text-secondary">
          Preserve Your Story Forever
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          TimeStone turns your precious moments into eternal memories, preserved like stones through
          time.
        </p>

        <div className="grid grid-cols-3 gap-16">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Camera className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-sm font-medium text-secondary mb-1">Capture Moments</h3>
            <p className="text-xs text-muted-foreground">Turn memories into timeless stones</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-sm font-medium text-secondary mb-1">Eternal Storage</h3>
            <p className="text-xs text-muted-foreground">Preserved on the blockchain</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-sm font-medium text-secondary mb-1">Your Legacy</h3>
            <p className="text-xs text-muted-foreground">Build your digital time capsule</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg">
        <MomentCreator activeAddress={activeAddress} />
      </div>
    </div>
  );
}
