export type NavItem = 
  | 'Dashboard'
  | 'Humanizer'
  | 'AI Detector'
  | 'Account'
  | 'Billing'
  | 'Plans & Pricing'
  | 'FAQ'
  | 'Support'
  | 'Discord'
  | 'Refer & Earn';

export type ModelType = 'Ghost 5.2 Mini' | 'Ghost 5.2 Pro' | 'Legacy';

export interface DetectionResult {
  overallScore: number; // 0 to 100 (% AI)
  isHuman: boolean;
  verdict: 'AI-Generated' | 'Likely AI' | 'Mixed / Uncertain' | 'Likely Human' | 'Human-Written';
  scannedAt: string;
  detectors: {
    name: string;
    score: number;
    badge: 'red' | 'yellow' | 'green';
  }[];
  sentenceBreakdown?: {
    text: string;
    isAi: boolean;
  }[];
}

export interface AdvancedSettings {
  preserveKeywords: string;
  targetTone: 'Standard' | 'Academic' | 'Professional' | 'Conversational' | 'Creative';
  bypassTarget: 'All Major Detectors' | 'Turnitin' | 'GPTZero' | 'Originality.ai' | 'CopyLeaks';
  readabilityLevel: 'High School' | 'College' | 'Post-Graduate';
  sentenceVariation: 'Balanced' | 'High' | 'Maximum';
}

