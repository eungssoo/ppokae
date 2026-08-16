import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  Zap, 
  Filter,
  Layers,
  BookmarkCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { GRAMMAR_TIPS_CATEGORIES, GrammarTipCategory, GrammarTipItem } from '../data/grammarTipsData';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface GrammarSkillVaultProps {
  initialOpen?: boolean;
}

export const GrammarSkillVault: React.FC<GrammarSkillVaultProps> = ({ initialOpen = false }) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTipIds, setExpandedTipIds] = useState<Record<string, boolean>>({
    article_noun: true,
    form2_sensory_adj: true
  });

  const toggleOpen = () => {
    sound.playClick();
    setIsOpen(prev => !prev);
  };

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
    <div className="mt-5 mb-5 text-left transition-all">
      
      {/* ⚡ Collapsible Interactive Header Banner (Click to Open / Close) */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full group rounded-3xl p-5 sm:p-6 border text-left transition-all duration-300 relative overflow-hidden shadow-xl active:scale-[0.99] ${
          isOpen
            ? 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border-amber-400/60 shadow-[0_10px_30px_rgba(245,158,11,0.15)]'
            : 'bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-purple-950/40 hover:from-amber-500/20 hover:to-purple-900/50 border-amber-500/30 hover:border-amber-400/50'
        }`}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{language === 'en' ? 'SECRET CHEAT SHEET' : '1초 정답 치트키'}</span>
              </span>

              <span className="bg-purple-500/20 text-purple-200 border border-purple-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {language === 'en' ? '12 Master Rules' : '12가지 특급 공식 수록'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-200 transition-colors flex items-center gap-2">
              <span>{language === 'en' ? 'Grammar Pro Skill & Hacks Vault 🧠' : '시험장 1초 킬러 문법 보관소 🧠'}</span>
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
              {language === 'en'
                ? 'Click to open slot formulas, sensory verb complements, and verb/verbal shortcuts!'
                : '클릭하여 관사 뒤 명사 자리, 감각동사 형용사 보어, 분사 판별 등 1초 킬러 비법을 확인하세요!'}
            </p>
          </div>

          {/* Toggle Action Pill */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-md ${
              isOpen
                ? 'bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-slate-800/90 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-300 border border-amber-500/40'
            }`}>
              <span>{isOpen ? (language === 'en' ? 'Close Skills ✕' : '스킬 닫기 ✕') : (language === 'en' ? 'Open Skills ⚡' : '스킬 열어보기 ⚡')}</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 animate-bounce" />}
            </div>
          </div>
        </div>
      </button>

      {/* 📜 Expandable Skills Section (Shows when clicked) */}
      {isOpen && (
        <div className="mt-4 p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6 shadow-2xl animate-fade-in">
          
          {/* Search & Category Filter Bar */}
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search grammar hacks (e.g., article, sensory verb, that vs what, participle)...' : '스킬 검색 (예: 관사, 감각동사, that what, 분사, 전치사, 수일치)...'}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedCategoryId('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCategoryId === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
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
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategoryId(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-black border border-amber-400/50'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
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
              <div className="bg-slate-950/60 rounded-3xl p-10 border border-slate-800 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="font-bold text-sm text-white mb-1">
                  {language === 'en' ? 'No matching grammar hacks found.' : '검색된 문법 스킬이 없습니다.'}
                </p>
                <p className="text-xs">
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
                      <p className="text-[11px] text-slate-400">
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
                          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                            isExpanded
                              ? 'bg-slate-950/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Card Header (Accordion Clickable) */}
                          <button
                            type="button"
                            onClick={() => toggleTip(tip.id)}
                            className="w-full p-4 flex items-center justify-between text-left gap-3 transition-colors hover:bg-slate-800/40"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center text-xs font-black flex-shrink-0">
                                ⚡
                              </span>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <span className="text-xs font-black text-white">
                                    {title}
                                  </span>
                                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.2 rounded-full text-[10px] font-black">
                                    {badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {summary}
                                </p>
                              </div>
                            </div>

                            <div className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex-shrink-0">
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
                                <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 p-3 rounded-xl border border-amber-500/30">
                                  <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
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
                                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                    <span>🎯 {language === 'en' ? 'Real Example & Breakdown:' : '실전 예문 & 오답 분석:'}</span>
                                  </div>

                                  {tip.examples.map((ex, exIdx) => {
                                    const expText = language === 'en' ? ex.explanationEn : ex.explanationKo;
                                    return (
                                      <div key={exIdx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                                        {ex.wrong && (
                                          <div className="flex items-start gap-2 text-rose-300 font-medium">
                                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                              <span className="line-through text-rose-400/80 mr-1">{language === 'en' ? '[Incorrect]' : '[오답 패턴]'}</span>
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
                                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all flex-shrink-0"
                                            title="TTS Audio"
                                          >
                                            <Volume2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 leading-relaxed">
                                          {expText}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* 💡 1-Sec Pro Tip */}
                              {proTip && (
                                <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 flex items-start gap-2 text-cyan-200">
                                  <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                  <div className="text-[11px] font-medium leading-relaxed">
                                    {proTip}
                                  </div>
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
      )}

    </div>
  );
};
