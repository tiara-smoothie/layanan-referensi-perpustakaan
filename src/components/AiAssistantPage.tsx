import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { ACADEMIC_REFERENCES } from '../data/references.ts';
import type { ChatMessage, CollectionType, ReferenceItem } from '../types.ts';
import { ReferenceCard } from './ReferenceCard.tsx';

interface AiAssistantPageProps {
  initialTopic?: string;
  onConsumeInitialTopic?: () => void;
  onViewDetail: (ref: ReferenceItem) => void;
  onAddToWorkspace: (ref: ReferenceItem) => void;
  savedReferenceIds: Set<string>;
}

const CATEGORIES: ('Semua' | CollectionType)[] = [
  'Semua',
  'Buku',
  'Jurnal',
  'E-book',
  'Skripsi',
];

export function AiAssistantPage({
  initialTopic,
  onConsumeInitialTopic,
  onViewDetail,
  onAddToWorkspace,
  savedReferenceIds,
}: AiAssistantPageProps) {
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | CollectionType>(
    'Semua'
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Halo! Saya Asisten Referensi AI LibraMind. Ceritakan topik penelitian, rumusan masalah, atau kebutuhan referensi Anda, dan saya akan merekomendasikan sumber akademik yang relevan dari katalog perpustakaan.',
      recommendedIds: ['ref-01', 'ref-03', 'ref-06'],
      suggestedTopics: [
        'Metodologi penelitian skripsi',
        'AI dalam perpustakaan digital',
        'Evaluasi sistem informasi kampus',
      ],
      timestamp: new Date().toISOString(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          categoryFilter,
          history: nextMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        recommendedIds?: string[];
        suggestedTopics?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || 'Terjadi kesalahan saat memproses permintaan AI.'
        );
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text:
          data.reply ||
          'Berikut rekomendasi referensi akademik yang paling relevan dengan topik Anda.',
        recommendedIds: data.recommendedIds || [],
        suggestedTopics: data.suggestedTopics || [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Tidak dapat terhubung ke layanan Asisten AI.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: errMsg,
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic && initialTopic.trim()) {
      const topic = initialTopic.trim();
      onConsumeInitialTopic?.();
      void sendQuery(topic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const latestRecommendedIds = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const ids = messages[i].recommendedIds;
      if (ids && ids.length > 0) {
        return ids;
      }
    }
    return ['ref-01', 'ref-03', 'ref-06'];
  }, [messages]);

  const displayedRecommendations = useMemo(() => {
    const recommendedSet = new Set(latestRecommendedIds);
    const ordered = ACADEMIC_REFERENCES.filter((ref) =>
      recommendedSet.has(ref.id)
    );
    const pool =
      categoryFilter === 'Semua'
        ? ordered
        : ordered.filter((r) => r.type === categoryFilter);

    if (pool.length > 0) return pool;
    // If filtered category wasn't in the AI's top picks, also show matching category items from catalog
    return ACADEMIC_REFERENCES.filter((r) => r.type === categoryFilter);
  }, [latestRecommendedIds, categoryFilter]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendQuery(input);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#2455B5]">
            Asisten Penemuan Literatur
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] mt-1">
            Asisten Referensi AI LibraMind
          </h1>
          <p className="text-sm text-[#102D68]/70 mt-1 max-w-2xl">
            Deskripsikan topik riset Anda untuk memperoleh rekomendasi referensi
            terkurasi beserta filter kategori koleksi.
          </p>
        </div>

        {/* Category Filters */}
        <div
          role="group"
          aria-label="Filter kategori referensi"
          className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-[#DCE8FF]"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#2455B5] text-white'
                  : 'text-[#102D68]/75 hover:bg-[#F3F7FF] hover:text-[#102D68]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Chatbot Panel */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE8FF] shadow-[0_4px_20px_rgba(16,45,104,0.06)] flex flex-col h-[600px] overflow-hidden">
          <div className="px-5 py-4 bg-[#102D68] text-white flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#2455B5] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-sm font-bold">
                Percakapan Asisten Riset
              </h2>
              <p className="text-xs text-[#DCE8FF]">
                Tanyakan topik, metode, atau jenis sumber pustaka
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F3F7FF]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-[#2455B5] text-white'
                      : 'bg-[#DCE8FF] text-[#102D68]'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Bot className="w-4 h-4" aria-hidden="true" />
                  )}
                </span>

                <div
                  className={`max-w-[82%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2455B5] text-white'
                      : msg.isError
                        ? 'bg-rose-50 border border-rose-200 text-rose-800'
                        : 'bg-white border border-[#DCE8FF] text-[#102D68]'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {msg.suggestedTopics && msg.suggestedTopics.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#DCE8FF] flex flex-wrap gap-1.5">
                      {msg.suggestedTopics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => void sendQuery(topic)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#F3F7FF] hover:bg-[#DCE8FF] text-[#2455B5] transition-colors cursor-pointer text-left"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#DCE8FF] text-[#102D68] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="bg-white border border-[#DCE8FF] rounded-xl px-4 py-3 text-xs text-[#102D68]/75 flex items-center gap-2">
                  <Loader2
                    className="w-4 h-4 animate-spin text-[#2455B5]"
                    aria-hidden="true"
                  />
                  <span>Menganalisis topik dan mencocokkan katalog...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3.5 bg-white border-t border-[#DCE8FF] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis topik riset Anda..."
              aria-label="Masukkan topik penelitian"
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F3F7FF] border border-[#DCE8FF] text-sm text-[#102D68] placeholder:text-[#102D68]/45 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Kirim pertanyaan ke Asisten AI"
              className="px-4 py-2.5 rounded-xl bg-[#2455B5] hover:bg-[#102D68] disabled:bg-[#5489E8]/50 text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </section>

        {/* Right: Recommended References Grid */}
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl px-5 py-4 border border-[#DCE8FF] flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-[#102D68]">
                Rekomendasi Referensi Akademik
              </h2>
              <p className="text-xs text-[#102D68]/65 mt-0.5">
                Menampilkan{' '}
                <span className="font-semibold tabular-nums">
                  {displayedRecommendations.length}
                </span>{' '}
                referensi{' '}
                {categoryFilter !== 'Semua'
                  ? `kategori ${categoryFilter}`
                  : 'terpilih untuk topik Anda'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedRecommendations.map((ref) => (
              <ReferenceCard
                key={ref.id}
                reference={ref}
                onViewDetail={onViewDetail}
                onAddToWorkspace={onAddToWorkspace}
                isAdded={savedReferenceIds.has(ref.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
