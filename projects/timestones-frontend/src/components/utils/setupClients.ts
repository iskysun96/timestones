import * as algokit from '@algorandfoundation/algokit-utils';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { AlgoConfig } from '@algorandfoundation/algokit-utils/types/network-client';

export function getAlgorandClient(): AlgorandClient {
  const config: AlgoConfig = {
    algodConfig: {
      server: import.meta.env.VITE_ALGOD_SERVER,
      port: import.meta.env.VITE_ALGOD_PORT,
      token: import.meta.env.VITE_ALGOD_TOKEN,
    },
  };

  const algorandClient = algokit.AlgorandClient.fromConfig(config);
  return algorandClient;
}
