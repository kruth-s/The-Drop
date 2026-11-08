import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export interface ShareSphereFile {
  id: string;
  name: string;
  cid: string;
  sizeBytes: number;
  formattedSize: string;
  mimeType: string;
  uploaderAddress: string;
  uploaderUsername: string;
  encrypted: boolean;
  passwordHash?: string;
  gatewayUrl: string;
  createdAt: string;
  txHash: string;
  blockNumber: number;
}

const DEFAULT_SHARESPHERE_FILES: ShareSphereFile[] = [
  {
    id: 'ipfs-file-1',
    name: 'Distributed-Consensus-Paper-Final.pdf',
    cid: 'QmZtmD2qt8fJpq3CLDHtaogZbh3aqn6H7Btr78KqK2t6S6',
    sizeBytes: 4210400,
    formattedSize: '4.01 MB',
    mimeType: 'application/pdf',
    uploaderAddress: '0x71C...b891',
    uploaderUsername: 'admin',
    encrypted: true,
    passwordHash: crypto.createHash('sha256').update('drop2024').digest('hex'),
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmZtmD2qt8fJpq3CLDHtaogZbh3aqn6H7Btr78KqK2t6S6',
    createdAt: '2024-11-04 14:22',
    txHash: '0x3a82f9b1c70e44e99f18751dc3d65b1df4e45e997f74c73a84cf959ecbfd8112',
    blockNumber: 19842104,
  },
  {
    id: 'ipfs-file-2',
    name: 'Research-Team-Env-Config.json.enc',
    cid: 'QmSnuWmxpt943pOXd32ndn2GgavL8PNL890xvnzP93Vn84',
    sizeBytes: 124800,
    formattedSize: '121 KB',
    mimeType: 'application/json',
    uploaderAddress: '0x3F8...69d4',
    uploaderUsername: 'dev_team',
    encrypted: true,
    passwordHash: crypto.createHash('sha256').update('web3vault').digest('hex'),
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmSnuWmxpt943pOXd32ndn2GgavL8PNL890xvnzP93Vn84',
    createdAt: '2024-11-06 09:15',
    txHash: '0x88f4c20d7593c2ebce91845bb0897f374ea3d1fce52309e4d08ec84a30db4391',
    blockNumber: 19843320,
  },
  {
    id: 'ipfs-file-3',
    name: 'Akaza-Engine-Architecture-Blueprint.png',
    cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    sizeBytes: 1845000,
    formattedSize: '1.76 MB',
    mimeType: 'image/png',
    uploaderAddress: '0x99A...1a0f',
    uploaderUsername: 'admin',
    encrypted: false,
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    createdAt: '2024-11-07 18:40',
    txHash: '0x5c72d6e32ef74f3583626e254da213b1fc21976a4ee04cfbdfd4304dbd10123f',
    blockNumber: 19844910,
  },
];

export async function getShareSphereFiles(): Promise<ShareSphereFile[]> {
  if (redis) {
    try {
      const stored = await redis.get<ShareSphereFile[]>('sharesphere:files');
      if (stored && Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch (e) {
      console.error('ShareSphere Redis read error:', e);
    }
  }
  return DEFAULT_SHARESPHERE_FILES;
}

export async function registerShareSphereFile(file: Omit<ShareSphereFile, 'id' | 'createdAt' | 'txHash' | 'blockNumber'>): Promise<ShareSphereFile> {
  const randomTx = '0x' + crypto.randomBytes(32).toString('hex');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const fullFile: ShareSphereFile = {
    ...file,
    id: `ipfs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    txHash: randomTx,
    blockNumber: 19845000 + Math.floor(Math.random() * 500),
  };

  const files = await getShareSphereFiles();
  const updated = [fullFile, ...files];

  if (redis) {
    try {
      await redis.set('sharesphere:files', updated);
    } catch (e) {
      console.error('ShareSphere Redis save error:', e);
    }
  }

  return fullFile;
}

export function hashFilePassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

