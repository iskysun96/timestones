import axios from 'axios';
import FormData from 'form-data';

const JWT = import.meta.env.VITE_PINATA_JWT;
const pinataJWT = `Bearer ${JWT}`;

export async function pinFileToIPFS(file: File): Promise<string | undefined> {
  const formData = new FormData();

  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: 'File name',
  });
  formData.append('pinataMetadata', pinataMetadata);

  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary}`,
        Authorization: pinataJWT,
      },
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.log(error);
    return;
  }
}

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

export async function pinJSONToIPFS(ipfsData: IPFSData): Promise<string | undefined> {
  const data = JSON.stringify({
    pinataContent: {
      ...ipfsData,
    },
    pinataMetadata: {
      name: 'metadata.json',
    },
  });

  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: pinataJWT,
      },
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.log(error);
    return;
  }
}
