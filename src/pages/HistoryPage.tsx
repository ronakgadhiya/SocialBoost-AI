import { useState, useEffect } from 'react';
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Eye,
  ArrowUpDown,
  Download,
  Share2,
  FileText,
  FileJson,
  Sparkles,
} from 'lucide-react';
import { GenerationHistoryItem, Platform, ContentType } from '../types';
import { getHistory, deleteHistoryItem, clearHistory } from '../utils/storage';
import { copyToClipboard, downloadAsTxt, downloadAsJson } from '../utils/export';
import { Modal } from '../components/Modal';

interface HistoryPageProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateGenerator?: () => void;
}

export function HistoryPage({ onShowToast, onNavigateGenerator }: HistoryPageProps) {
  const [items, setItems] = useState<GenerationHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modal inspection state
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = () => {
    setItems(getHistory());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    loadData();
    onShowToast('Item removed from history.', 'info');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history records? This cannot be undone.')) {
      clearHistory();
      loadData();
      onShowToast('History cleared.', 'info');
    }
  };

  const handleCopy = async (item: GenerationHistoryItem) => {
    const text = [
      `[${item.platform} - ${item.contentType}]`,
      item.hook ? `Hook: ${item.hook}` : '',
      item.content,
      item.cta ? `CTA: ${item.cta}` : '',
      item.hashtags?.length > 0 ? item.hashtags.join(' ') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(item.id);
      onShowToast('Copied content to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filter & sort pipeline
  const filtered = items
    .filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hook?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.businessName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPlatform = filterPlatform === 'All' || item.platform === filterPlatform;
      const matchType = filterType === 'All' || item.contentType === filterType;

      return matchSearch && matchPlatform && matchType;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.createdAt - a.createdAt;
      return a.createdAt - b.createdAt;
    });

  const platformsList = ['All', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'WhatsApp', 'Google Business Profile', 'Pinterest', 'X'];
  const typesList = ['All', 'Caption', 'Post', 'Reel Script', 'Carousel', 'Story', 'Advertisement', 'Product Description', 'Content Ideas'];

  return (
    <div id="history-page" className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Local Archive</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Content History</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, copy, review, or export your last 20 generated posts stored securely in your browser.
          </p>
        </div>

        {items.length > 0 && (
          <button
            id="clear-all-history-btn"
            onClick={handleClearAll}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search by keywords, hook, or business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Platform Filter */}
          <div className="w-full md:w-44">
            <select
              id="history-platform-filter"
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
            >
              {platformsList.map((p) => (
                <option key={p} value={p}>
                  Platform: {p}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-44">
            <select
              id="history-type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
            >
              {typesList.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <button
            id="history-sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="capitalize">{sortOrder}</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filtered.length}</strong> of {items.length} records
          </span>
          <span>Max 20 records saved locally</span>
        </div>
      </div>

      {/* History Items List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              id={`history-card-${item.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {item.platform}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.contentType}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()} at{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {item.businessName && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      • {item.businessName}
                    </span>
                  )}
                </div>

                {item.hook && (
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    "{item.hook}"
                  </div>
                )}

                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>

                {item.hashtags && item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.hashtags.slice(0, 5).map((tag, idx) => (
                      <span key={idx} className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                    {item.hashtags.length > 5 && (
                      <span className="text-[11px] text-slate-400">+{item.hashtags.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                <button
                  id={`history-view-${item.id}`}
                  onClick={() => setSelectedItem(item)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 w-full justify-center"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                <button
                  id={`history-copy-${item.id}`}
                  onClick={() => handleCopy(item)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 w-full justify-center"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  id={`history-delete-${item.id}`}
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {items.length === 0 ? 'Your content history is empty' : 'No matching records found'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {items.length === 0
              ? 'Every time you generate content or save outputs, they will automatically be preserved here in your browser.'
              : 'Try clearing your search terms or filters above.'}
          </p>
          {items.length === 0 && onNavigateGenerator && (
            <button
              onClick={onNavigateGenerator}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Generate First Post
            </button>
          )}
        </div>
      )}

      {/* Modal for full viewing */}
      {selectedItem && (
        <Modal
          id="history-view-modal"
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`${selectedItem.platform} ${selectedItem.contentType}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span>Business: {selectedItem.businessName}</span>
              <span>{new Date(selectedItem.createdAt).toLocaleString()}</span>
            </div>

            {selectedItem.hook && (
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                <span className="font-bold uppercase text-[10px] text-indigo-600 dark:text-indigo-400 block mb-1">
                  HOOK
                </span>
                <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {selectedItem.hook}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="font-bold uppercase text-[10px] text-slate-400 block">
                MAIN CONTENT / CAPTION
              </span>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
                {selectedItem.content}
              </div>
            </div>

            {selectedItem.cta && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                <span className="font-bold uppercase text-[10px] text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  CTA
                </span>
                <p className="font-medium text-emerald-900 dark:text-emerald-200">{selectedItem.cta}</p>
              </div>
            )}

            {selectedItem.hashtags && selectedItem.hashtags.length > 0 && (
              <div>
                <span className="font-bold uppercase text-[10px] text-slate-400 block mb-1">
                  HASHTAGS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  downloadAsTxt(
                    `${selectedItem.platform.toLowerCase()}_post_${Date.now()}.txt`,
                    selectedItem.content
                  );
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TXT</span>
              </button>

              <button
                onClick={() => handleCopy(selectedItem)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Text</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
