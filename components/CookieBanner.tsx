"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, ChevronRight, Languages, Settings2 } from "lucide-react";

type ConsentRecord = {
  timestamp: string;
  consent_status: string;
  policy_version: string;
  categories: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
};

const PRIVACY_VERSION = process.env.NEXT_PUBLIC_PRIVACY_VERSION || "2025-12-22";

const LANGUAGES = {
  en: {
    name: "English",
    title: "Cookie Settings",
    description: "We use cookies to improve your experience and process payments securely. In compliance with Singapore's PDPA, please select your preferences.",
    essential: "Essential",
    essentialDesc: "Required for security and core functionality (e.g. Stripe, HitPay).",
    analytics: "Analytics",
    analyticsDesc: "Helps us understand how you use our platform.",
    marketing: "Marketing",
    marketingDesc: "Used to deliver relevant advertisements and offers.",
    acceptAll: "Accept All",
    rejectOptional: "Reject Optional",
    save: "Save Preferences",
    readMore: "Privacy Policy",
    settings: "Settings",
    back: "Back"
  },
  zh: {
    name: "中文",
    title: "Cookie 设置",
    description: "我们使用 Cookie 来改善您的体验并安全地处理付款。根据新加坡 PDPA 的规定，请选择您的偏好。",
    essential: "必要",
    essentialDesc: "安全和核心功能所需（例如 Stripe、HitPay）。",
    analytics: "分析",
    analyticsDesc: "帮助我们了解您如何使用我们的平台。",
    marketing: "营销",
    marketingDesc: "用于提供相关的广告和优惠。",
    acceptAll: "全部接受",
    rejectOptional: "拒绝可选",
    save: "保存偏好",
    readMore: "隐私政策",
    settings: "设置",
    back: "返回"
  },
  ms: {
    name: "Bahasa Melayu",
    title: "Tetapan Kuki",
    description: "Kami menggunakan kuki untuk meningkatkan pengalaman anda dan memproses pembayaran dengan selamat. Selaras dengan PDPA Singapura, sila pilih pilihan anda.",
    essential: "Penting",
    essentialDesc: "Diperlukan untuk keselamatan dan fungsi teras (cth. Stripe, HitPay).",
    analytics: "Analitik",
    analyticsDesc: "Membantu kami memahami cara anda menggunakan platform kami.",
    marketing: "Pemasaran",
    marketingDesc: "Digunakan untuk menyampaikan iklan dan tawaran yang berkaitan.",
    acceptAll: "Terima Semua",
    rejectOptional: "Tolak Pilihan",
    save: "Simpan Pilihan",
    readMore: "Dasar Privasi",
    settings: "Tetapan",
    back: "Kembali"
  },
  ta: {
    name: "தமிழ்",
    title: "குக்கீ அமைப்புகள்",
    description: "உங்கள் அனுபவத்தை மேம்படுத்தவும் கொடுப்பனவுகளைப் பாதுகாப்பாகச் செயல்படுத்தவும் நாங்கள் குக்கீகளைப் பயன்படுத்துகிறோம். சிங்கப்பூரின் PDPA-இன் படி, உங்கள் விருப்பங்களைத் தேர்ந்தெடுக்கவும்.",
    essential: "அத்தியாவசியமானவை",
    essentialDesc: "பாதுகாப்பு மற்றும் முக்கிய செயல்பாட்டிற்கு தேவை (எ.கா. Stripe, HitPay).",
    analytics: "பகுப்பாய்வு",
    analyticsDesc: "எங்கள் தளத்தை நீங்கள் எவ்வாறு பயன்படுத்துகிறீர்கள் என்பதைப் புரிந்துகொள்ள உதவுகிறது.",
    marketing: "சந்தைப்படுத்தல்",
    marketingDesc: "தொடர்புடைய விளம்பரங்கள் மற்றும் சலுகைகளை வழங்க பயன்படுகிறது.",
    acceptAll: "அனைத்தையும் ஏற்றுக்கொள்",
    rejectOptional: "விருப்பமானதைத் நிராகரி",
    save: "விருப்பங்களைச் சேமி",
    readMore: "தனியுரிமைக் கொள்கை",
    settings: "அமைப்புகள்",
    back: "பின்செல்"
  }
};

type LangCode = keyof typeof LANGUAGES;

function sendConsent(record: ConsentRecord) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "https://api.booppa.io";
  return fetch(`${base}/api/v1/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lang, setLang] = useState<LangCode>("en");
  const [consent, setConsent] = useState({
    analytics: false,
    marketing: false
  });

  const t = LANGUAGES[lang];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("booppa_consent");
      if (!stored) {
        setVisible(true);
      } else {
        const parsed = JSON.parse(stored) as ConsentRecord;
        if (parsed.categories) {
          setConsent({
            analytics: parsed.categories.analytics,
            marketing: parsed.categories.marketing
          });
        }
      }
    } catch (e) {
      setVisible(true);
    }

    const handleOpenSettings = () => {
      setVisible(true);
      setShowSettings(true);
    };

    window.addEventListener("consent:open-settings", handleOpenSettings);
    return () => window.removeEventListener("consent:open-settings", handleOpenSettings);
  }, []);

  async function handleSave(analytics: boolean, marketing: boolean) {
    const record: ConsentRecord = {
      timestamp: new Date().toISOString(),
      consent_status: analytics && marketing ? "Full Consent" : (analytics || marketing ? "Partial Consent" : "Necessary Only"),
      policy_version: PRIVACY_VERSION,
      categories: {
        essential: true,
        analytics,
        marketing
      }
    };

    try {
      await sendConsent(record);
    } catch (e) {}

    try {
      localStorage.setItem("booppa_consent", JSON.stringify(record));
    } catch {}

    setVisible(false);
    setShowSettings(false);
    window.dispatchEvent(new CustomEvent("consent:changed", { detail: record }));
  }

  if (!visible) return null;

  return (
    <div id="booppa-cookie-banner" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-gray-400" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as LangCode)}
              className="bg-transparent text-sm text-gray-300 border-none focus:ring-0 cursor-pointer hover:text-white transition-colors"
            >
              {Object.entries(LANGUAGES).map(([code, data]) => (
                <option key={code} value={code} className="bg-[#0f172a]">{data.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {!showSettings ? (
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                {t.description}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400 flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" /> {t.essential}
                </span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                  {t.analytics}
                </span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                  {t.marketing}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Essential */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded border border-blue-500/50 bg-blue-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">{t.essential} <span className="text-[10px] text-gray-500 uppercase tracking-widest ml-2">Required</span></h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{t.essentialDesc}</p>
                </div>
              </div>

              {/* Analytics */}
              <label className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-colors group">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    checked={consent.analytics}
                    onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{t.analytics}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{t.analyticsDesc}</p>
                </div>
              </label>

              {/* Marketing */}
              <label className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-colors group">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    checked={consent.marketing}
                    onChange={(e) => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{t.marketing}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{t.marketingDesc}</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 bg-white/5 flex flex-col sm:flex-row gap-3">
          {!showSettings ? (
            <>
              <button 
                onClick={() => handleSave(true, true)}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                {t.acceptAll}
              </button>
              <button 
                onClick={() => handleSave(false, false)}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
              >
                {t.rejectOptional}
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all flex items-center justify-center"
                title={t.settings}
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {t.back}
              </button>
              <button 
                onClick={() => handleSave(consent.analytics, consent.marketing)}
                className="flex-[2] py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                {t.save}
              </button>
            </>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-black/20">
          <Link href="/privacy" className="text-xs text-gray-500 hover:text-blue-400 underline transition-colors">
            {t.readMore}
          </Link>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            PDPA COMPLIANT · v{PRIVACY_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
