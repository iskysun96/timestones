import { getAlgorandClient } from './setupClients';
import axios from 'axios';

export async function fetchDiaryAssets(activeAddress: string) {
  const algorandClient = getAlgorandClient();
  const PD = 'pd';
  const balances = (await algorandClient.account.getInformation(activeAddress)).assets || [];
  const diaryAssets = [];

  for (const balance of balances) {
    const assetInfo = await algorandClient.asset.getById(balance.assetId);
    if (
      assetInfo.unitName?.startsWith(PD) &&
      assetInfo.url &&
      assetInfo.url !== 'ipfs://undefined/#arc3'
    ) {
      const slicedUrl = assetInfo.url.slice(7);
      const response = await axios.get(`https://ipfs.algonode.xyz/ipfs/${slicedUrl}`);
      const responseImage = response.data.image.startsWith('ipfs://')
        ? response.data.image.slice(7)
        : response.data.image;
      diaryAssets.push({
        assetId: Number(assetInfo.assetId),
        url: `https://ipfs.algonode.xyz/ipfs/${responseImage}`,
        assetName: assetInfo.assetName || '',
        unitName: assetInfo.unitName || '',
        description: response.data.description,
        assetType: response.data.properties.assetType,
        date: new Date(assetInfo.assetName || ''),
      });
    }
  }
  return diaryAssets;
}
