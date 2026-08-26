import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  Zap, 
  Layers, 
  BookmarkCheck,
  BookOpen
} from 'lucide-react';
import { GRAMMAR_TIPS_CATEGORIES, GrammarTipCategory } from '../data/grammarTipsData';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface GrammarSkillVaultViewProps {
  onBack: () => void;
}

export const GrammarSkillVaultView: React.FC<GrammarSkillVaultViewProps> = ({ onBack }) => {
  const { language, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTipIds, setExpandedTipIds] = useState<Record<string, boolean>>({
    article_noun: true,
    form2_sensory_adj: true
  });

  const toggleTip = (id: string) => {
    sound.playClick();
    setExpandedTipIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const playSentenceAudio = (text: string) => {
    sound.playClick();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/[\(\)X➔O]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Filter tips based on search query and category
  const filteredCategories = GRAMMAR_TIPS_CATEGORIES.map(cat => {
    if (selectedCategoryId !== 'all' && cat.id !== selectedCategoryId) {
      return null;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return cat;

    const filteredTips = cat.tips.filter(tip => {
      const matchKo = tip.titleKo.toLowerCase().includes(q) || 
                      tip.summaryKo.toLowerCase().includes(q) || 
                      tip.proTipKo.toLowerCase().includes(q) ||
                      (tip.formulaKo && tip.formulaKo.toLowerCase().includes(q));
      const matchEn = tip.titleEn.toLowerCase().includes(q) || 
                      tip.summaryEn.toLowerCase().includes(q) || 
                      tip.proTipEn.toLowerCase().includes(q) ||
                      (tip.formulaEn && tip.formulaEn.toLowerCase().includes(q));
      return matchKo || matchEn;
    });

    if (filteredTips.length === 0) return null;
    return { ...cat, tips: filteredTips };
  }).filter(Boolean) as GrammarTipCategory[];

  const renderBoldText = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') ? (
        <strong key={i} className="text-amber-300 bg-amber-500/20 px-1 py-0.5 rounded font-black">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-animated-gradient flex items-center justify-center p-3 sm:p-6 md:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-3xl w-full glass-card rounded-[2.5rem] p-5 sm:p-8 relative border border-slate-700/60 shadow-2xl text-left">
        
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-700/60 pb-4">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs sm:text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? '12 Master Rules' : '12대 필살 공식 수록'}</span>
          </span>
        </div>

        {/* Hero Title Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 rounded-3xl p-5 sm:p-7 border border-amber-500/30 mb-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{language === 'en' ? 'CLICK & SOLVE FORMULA' : '3초 정답 딸깍 공식'}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{language === 'en' ? 'Grammar Click & Solve Vault ⚡' : '문법 딸깍 보관소 ⚡'}</span>
            </h2>
            
            <p className="text-slate-300 text-xs sm:text-sm font-medium mt-2 leading-relaxed">
              {language === 'en'
                ? 'Master indispensable 3-second slot rules, agreement shortcuts, and high-yield killer formulas to solve exam questions with a single click!'
                : '복잡한 문법 이론은 싹 빼고, 빈칸 앞뒤만 보고 3초 만에 정답을 바로 찍는 실전 딸깍 공식 모음집!'}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-3 mb-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search grammar hacks (e.g., article, sensory verb, that vs what, participle)...' : '스킬 검색 (예: 관사, 감각동사, that what, 분사, 전치사, 수일치)...'}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/90 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedCategoryId('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'All Skills' : '전체 스킬'}</span>
            </button>

            {GRAMMAR_TIPS_CATEGORIES.map(cat => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategoryId(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-black border border-amber-400/50'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{language === 'en' ? cat.titleEn : cat.titleKo}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories & Tips List */}
        <div className="space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="bg-slate-900/60 rounded-3xl p-10 border border-slate-800 text-center text-slate-400 shadow-sm">
              <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-black text-sm text-white mb-1">
                {language === 'en' ? 'No matching grammar hacks found.' : '검색된 문법 스킬이 없습니다.'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'en' ? 'Try searching with different keywords.' : '다른 검색어를 입력하거나 카테고리를 [전체 스킬]로 변경해 보세요.'}
              </p>
            </div>
          ) : (
            filteredCategories.map(cat => (
              <div key={cat.id} className="space-y-3">
                
                {/* Category Subheader */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-lg">{cat.icon}</span>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {language === 'en' ? cat.titleEn : cat.titleKo}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {language === 'en' ? cat.descriptionEn : cat.descriptionKo}
                    </p>
                  </div>
                </div>

                {/* Tips Cards */}
                <div className="space-y-3">
                  {cat.tips.map(tip => {
                    const isExpanded = !!expandedTipIds[tip.id];
                    const title = language === 'en' ? tip.titleEn : tip.titleKo;
                    const badge = language === 'en' ? tip.badgeEn : tip.badgeKo;
                    const summary = language === 'en' ? tip.summaryEn : tip.summaryKo;
                    const formula = language === 'en' ? (tip.formulaEn || tip.formulaKo) : (tip.formulaKo || tip.formulaEn);
                    const proTip = language === 'en' ? tip.proTipEn : tip.proTipKo;

                    return (
                      <div
                        key={tip.id}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                          isExpanded
                            ? 'bg-slate-900/90 border-amber-500/40 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Card Header (Accordion Clickable) */}
                        <button
                          type="button"
                          onClick={() => toggleTip(tip.id)}
                          className="w-full p-4 flex items-center justify-between text-left gap-3 transition-colors hover:bg-slate-800/40"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center text-xs font-black flex-shrink-0">
                              ⚡
                            </span>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-black text-white">
                                  {title}
                                </span>
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.2 rounded-full text-[10px] font-black">
                                  {badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 line-clamp-1 font-medium">
                                {summary}
                              </p>
                            </div>
                          </div>

                          <div className="text-slate-300 hover:text-white p-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex-shrink-0">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Expanded Content Body */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 space-y-3.5 text-xs text-slate-300 border-t border-slate-800/80">
                            
                            {/* Summary Paragraph */}
                            <p className="text-slate-200 leading-relaxed font-medium">
                              {summary}
                            </p>

                            {/* 📌 Formula Box */}
                            {formula && (
                              <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30">
                                <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-amber-400" />
                                  <span>{language === 'en' ? 'Core Formula' : '핵심 공식'}</span>
                                </div>
                                <div className="font-mono text-xs sm:text-sm font-black text-amber-200">
                                  {formula}
                                </div>
                              </div>
                            )}

                            {/* 📝 Real Exam Examples */}
                            {tip.examples && tip.examples.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-[11px] font-black text-slate-400 flex items-center gap-1">
                                  <span>🎯 {language === 'en' ? 'Real Example & Breakdown:' : '실전 예문 & 오답 분석:'}</span>
                                </div>

                                {tip.examples.map((ex, exIdx) => {
                                  return (
                                    <div key={exIdx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                                      {ex.wrong && (
                                        <div className="flex items-start gap-2 text-rose-300 font-medium">
                                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                          <div>
                                            <span className="line-through text-rose-400/80 mr-1 font-bold">{language === 'en' ? '[Incorrect]' : '[오답 패턴]'}</span>
                                            <span>{renderBoldText(ex.wrong)}</span>
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex items-start justify-between gap-2 text-emerald-300 font-medium">
                                        <div className="flex items-start gap-2">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                          <div>
                                            <span className="text-emerald-400 font-black mr-1">{language === 'en' ? '[Correct]' : '[올바른 문장]'}</span>
                                            <span>{renderBoldText(ex.correct)}</span>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => playSentenceAudio(ex.correct)}
                                          className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all flex-shrink-0"
                                          title="TTS Audio"
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* 💡 Pro Tip Box */}
                            {proTip && (
                              <div className="bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/20 text-indigo-200">
                                <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider mb-1 flex items-center gap-1">
                                  <Lightbulb className="w-3 h-3" />
                                  <span>{language === 'en' ? 'Pro Tip' : '1타 강사 꿀팁'}</span>
                                </div>
                                <p className="leading-relaxed font-medium">
                                  {proTip}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
