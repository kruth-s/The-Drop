import { Redis } from '@upstash/redis';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export interface AcademicResource {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseName: string;
  program: string;
  resourceType: 'notes' | 'research_paper' | 'exam_paper' | 'cheatsheet';
  tags: string[];
  rating: number;
  downloads: number;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
  keywords: string[];
}

export interface AcademicRequest {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  program: string;
  requesterUsername: string;
  status: 'OPEN' | 'FULFILLED';
  requestedAt: string;
  upvotes: number;
  tags: string[];
}

const DEFAULT_RESOURCES: AcademicResource[] = [
  {
    id: 'res-raft-paxos-2024',
    title: 'Distributed Consensus: Raft vs Multi-Paxos Protocol Walkthrough',
    description: 'Comprehensive analysis of leader election, log replication, and safety guarantees with step-by-step TLA+ invariants.',
    courseCode: 'CS-442',
    courseName: 'Distributed Systems & Cloud Computing',
    program: 'Computer Science',
    resourceType: 'research_paper',
    tags: ['distributed-systems', 'consensus', 'raft', 'paxos', 'replication'],
    rating: 4.9,
    downloads: 1420,
    uploadedBy: 'prof_soren',
    uploadedAt: '2024-10-15',
    fileUrl: 'https://arxiv.org/abs/2004.05074',
    keywords: ['consensus', 'raft', 'paxos', 'leader election', 'fault tolerance', 'split brain', 'quorum', 'state machine replication'],
  },
  {
    id: 'res-gemini-transformer-notes',
    title: 'Attention Is All You Need & Modern Multi-Head Transformer Architectures',
    description: 'Detailed lecture notes on QKV projections, scaled dot-product attention, positional encodings, and FlashAttention v2 optimizations.',
    courseCode: 'AI-501',
    courseName: 'Deep Learning & Natural Language Processing',
    program: 'Artificial Intelligence',
    resourceType: 'notes',
    tags: ['transformers', 'deep-learning', 'nlp', 'attention', 'gemini'],
    rating: 4.8,
    downloads: 2840,
    uploadedBy: 'alex_researcher',
    uploadedAt: '2024-09-28',
    fileUrl: 'https://arxiv.org/abs/1706.03762',
    keywords: ['transformer', 'attention', 'nlp', 'query key value', 'flashattention', 'llm', 'embedding', 'vector'],
  },
  {
    id: 'res-zero-knowledge-snarks',
    title: 'Practical Zero-Knowledge Proofs: zk-SNARKs & Groth16 Verification',
    description: 'Mathematical foundations of elliptic curve pairings, QAP reductions, circuit synthesis with Circom, and on-chain verification.',
    courseCode: 'SEC-480',
    courseName: 'Applied Cryptography & Web3 Security',
    program: 'Cybersecurity',
    resourceType: 'notes',
    tags: ['cryptography', 'zero-knowledge', 'zk-snark', 'groth16', 'ethereum'],
    rating: 5.0,
    downloads: 980,
    uploadedBy: 'cryptocat',
    uploadedAt: '2024-11-01',
    fileUrl: 'https://eprint.iacr.org/2016/260.pdf',
    keywords: ['zero knowledge', 'snark', 'groth16', 'elliptic curve', 'proof', 'ethereum', 'zkp', 'cryptography'],
  },
  {
    id: 'res-operating-systems-midterm',
    title: 'Operating Systems & Concurrency Final Exam Master Cheatsheet',
    description: 'Virtual memory paging tables, TLB shootdowns, Peterson algorithm, reader-writer semaphores, and epoll I/O multiplexing.',
    courseCode: 'CS-210',
    courseName: 'Operating Systems Architecture',
    program: 'Computer Science',
    resourceType: 'cheatsheet',
    tags: ['os', 'concurrency', 'semaphores', 'virtual-memory', 'linux'],
    rating: 4.9,
    downloads: 3610,
    uploadedBy: 'dev_sarah',
    uploadedAt: '2024-10-04',
    fileUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    keywords: ['operating systems', 'tlb', 'virtual memory', 'semaphore', 'mutex', 'deadlock', 'concurrency', 'kernel'],
  },
  {
    id: 'res-ipfs-merkle-dag-storage',
    title: 'Content-Addressed Decentralized Storage: Merkle DAGs and BitSwap Internals',
    description: 'Architecture breakdown of UnixFS v2, CID v1 format specifications, DHT routing via Kademlia, and data deduplication.',
    courseCode: 'WEB3-305',
    courseName: 'Peer-to-Peer Networks & Decentralized Web',
    program: 'Software Engineering',
    resourceType: 'research_paper',
    tags: ['ipfs', 'libp2p', 'kademlia', 'merkle-dag', 'decentralization'],
    rating: 4.7,
    downloads: 1190,
    uploadedBy: 'juan_p2p',
    uploadedAt: '2024-08-19',
    fileUrl: 'https://docs.ipfs.tech/',
    keywords: ['ipfs', 'merkle', 'dag', 'cid', 'kademlia', 'p2p', 'peer to peer', 'decentralized', 'sharesphere', 'storage'],
  },
];

const DEFAULT_REQUESTS: AcademicRequest[] = [
  {
    id: 'req-db-internals',
    title: 'Request: LSM-Tree compaction strategies (LevelDB / RocksDB) study guide',
    courseCode: 'CS-430',
    courseName: 'Database System Engine Internals',
    program: 'Computer Science',
    requesterUsername: 'karan_m',
    status: 'OPEN',
    requestedAt: '2024-11-02',
    upvotes: 18,
    tags: ['database', 'lsm-tree', 'storage-engine'],
  },
  {
    id: 'req-compiler-codegen',
    title: 'Request: LLVM IR pass optimization patterns for SSA form',
    courseCode: 'CS-455',
    courseName: 'Compiler Construction',
    program: 'Computer Science',
    requesterUsername: 'elena_v',
    status: 'OPEN',
    requestedAt: '2024-11-05',
    upvotes: 24,
    tags: ['llvm', 'compiler', 'ssa', 'optimization'],
  },
];

export async function getAcademicResources(query?: string, resourceType?: string): Promise<AcademicResource[]> {
  let list = DEFAULT_RESOURCES;

  if (redis) {
    try {
      const stored = await redis.get<AcademicResource[]>('univault:resources');
      if (stored && Array.isArray(stored) && stored.length > 0) {
        list = stored;
      }
    } catch (e) {
      console.error('UniVault Redis read error:', e);
    }
  }

  let filtered = [...list];

  if (resourceType && resourceType !== 'all') {
    filtered = filtered.filter((r) => r.resourceType === resourceType);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    const qTokens = q.split(/\s+/).filter(Boolean);

    // Semantic relevance scoring
    filtered = filtered
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const descLower = item.description.toLowerCase();
        const courseLower = item.courseName.toLowerCase() + ' ' + item.courseCode.toLowerCase();
        const tagString = item.tags.join(' ').toLowerCase();
        const kwString = item.keywords.join(' ').toLowerCase();

        // Exact match boost
        if (titleLower.includes(q)) score += 50;
        if (descLower.includes(q)) score += 30;
        if (kwString.includes(q)) score += 40;

        // Token matches
        for (const token of qTokens) {
          if (titleLower.includes(token)) score += 15;
          if (descLower.includes(token)) score += 8;
          if (tagString.includes(token)) score += 12;
          if (courseLower.includes(token)) score += 10;
          if (kwString.includes(token)) score += 10;
        }

        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }

  return filtered;
}

export async function getAcademicRequests(): Promise<AcademicRequest[]> {
  if (redis) {
    try {
      const stored = await redis.get<AcademicRequest[]>('univault:requests');
      if (stored && Array.isArray(stored)) {
        return stored;
      }
    } catch (e) {}
  }
  return DEFAULT_REQUESTS;
}

export async function createAcademicRequest(request: Omit<AcademicRequest, 'id' | 'requestedAt' | 'upvotes' | 'status'>): Promise<AcademicRequest> {
  const newReq: AcademicRequest = {
    ...request,
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'OPEN',
    requestedAt: new Date().toISOString().split('T')[0],
    upvotes: 1,
  };

  const all = await getAcademicRequests();
  const updated = [newReq, ...all];

  if (redis) {
    try {
      await redis.set('univault:requests', updated);
    } catch (e) {}
  }

  return newReq;
}

