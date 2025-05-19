import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { User, Home, LayoutDashboard, PanelLeftClose, PanelLeftOpen, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Index } from '@/routes';
import { Dashboard } from '@/routes/dashboard';
import { cn } from '@/lib/utils';

import { useWallet } from '@txnlab/use-wallet-react';
import { ConnectWalletMenu, ConnectedWalletMenu } from '@txnlab/use-wallet-ui-react';

function Homepage() {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const { activeAddress } = useWallet();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background flex">
        {/* Vertical Navbar */}
        <nav
          className={cn(
            'h-screen bg-card flex flex-col transition-all duration-300',
            isNavExpanded ? 'w-48' : 'w-12'
          )}
        >
          <button
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            className="p-3 flex items-center justify-center text-primary hover:text-primary/80 transition-all duration-300"
          >
            {isNavExpanded ? (
              <div className="flex items-center gap-2">
                <PanelLeftClose className="w-5 h-5" />
                <span className="text-sm font-medium">TimeStones</span>
              </div>
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                className={cn(
                  'flex items-center px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
                  !isNavExpanded && 'justify-center'
                )}
              >
                <Home className="w-5 h-5" />
                {isNavExpanded && <span className="ml-2 text-sm">Home</span>}
              </Link>
              {activeAddress && (
                <Link
                  to="/dashboard"
                  className={cn(
                    'flex items-center px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
                    !isNavExpanded && 'justify-center'
                  )}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {isNavExpanded && <span className="ml-2 text-sm">Dashboard</span>}
                </Link>
              )}
            </div>
          </div>

          <div className="p-2">
            {activeAddress ? (
              <ConnectedWalletMenu>
                <Button variant="ghost" size="icon" className="w-full">
                  <User className="w-5 h-5" />
                </Button>
              </ConnectedWalletMenu>
            ) : (
              <ConnectWalletMenu>
                <Button
                  className="w-full"
                  variant="ghost"
                  size={isNavExpanded ? 'default' : 'icon'}
                >
                  <LogIn className="w-5 h-5" />
                  {isNavExpanded && <span className="ml-2 text-sm">Sign in</span>}
                </Button>
              </ConnectWalletMenu>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Index activeAddress={activeAddress} />} />
              <Route path="/dashboard" element={<Dashboard activeAddress={activeAddress} />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default Homepage;
