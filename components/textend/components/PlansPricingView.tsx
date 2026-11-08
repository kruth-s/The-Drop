import React from 'react';
import { Check, Zap, Sparkles, Shield } from 'lucide-react';

export const PlansPricingView: React.FC = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "For casual users needing light humanization and daily scans.",
      current: true,
      features: [
        "1,000 words per day",
        "Ghost 5.2 Mini engine",
        "Standard rewrite level (1-10)",
        "Basic AI detection scans",
        "Discord community support"
      ]
    },
    {
      name: "Basic",
      price: "$20",
      period: "per month",
      description: "Ideal for students and content creators bypassing school detectors.",
      current: false,
      popular: true,
      features: [
        "20,000 words per month",
        "Ghost 5.2 Pro high-intelligence engine",
        "Bypass Turnitin, GPTZero & Originality",
        "Unlimited multi-engine AI scans",
        "Freeze words & tone fine-tuning",
        "Priority processing"
      ]
    },
    {
      name: "Pro",
      price: "$35",
      period: "per month",
      description: "For agencies, researchers, and professional writers with high volume.",
      current: false,
      features: [
        "100,000 words per month",
        "Ghost 5.2 Pro with Maximum Burstiness",
        "Zero detection guarantee on Turnitin",
        "Batch humanization & API access",
        "Dedicated VIP support",
        "Custom vocabulary profiles"
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-[1200px] mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-white">Simple, Transparent Pricing</h1>
        <p className="text-sm text-neutral-400 mt-2">
          Upgrade to unlock Ghost 5.2 Pro, bypass strict institutional filters, and get higher word quotas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all ${
              p.popular
                ? 'bg-[#181922] border-2 border-white/20 shadow-2xl'
                : 'bg-[#141519] border border-[#23242c]'
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-neutral-900 text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                Most Popular
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                {p.current && (
                  <span className="text-[11px] bg-[#22232e] text-neutral-300 px-2 py-0.5 rounded font-medium border border-[#313344]">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-2 min-h-[36px]">{p.description}</p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-white">{p.price}</span>
                <span className="text-xs text-neutral-400 ml-1.5">/{p.period}</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#23242f]">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`w-full mt-8 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                p.current
                  ? 'bg-[#22232e] text-neutral-400 cursor-default'
                  : p.popular
                  ? 'bg-white hover:bg-neutral-200 text-neutral-900 shadow-md'
                  : 'bg-[#252733] hover:bg-[#313343] text-white'
              }`}
            >
              {p.current ? 'Current Active Plan' : 'Upgrade to ' + p.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

