import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { diseases, type Disease } from '@/lib/diseases';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Download, Printer, Copy, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Optional: use your project's toast if available; otherwise fallback to alert
// import { useToast } from '@/components/ui/use-toast';

type SortOption = 'relevance' | 'name' | 'category';

const PAGE_SIZE = 9;
const uniqueCategories = Array.from(new Set(diseases.map((d) => d.category))).sort();

/**
 * Utility: safe write to clipboard + toast fallback
 */
async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // fallback
  try {
    // old execCommand fallback (rare)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounce hook (composition)
 */
function useDebouncedValue<T>(value: T, ms = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/**
 * Small helpers
 */
const scoreForQuery = (d: Disease, q: string) => {
  let s = 0;
  if (!q) return s;
  const Q = q.toLowerCase();
  if (d.name.toLowerCase().includes(Q)) s += 5;
  if (d.category.toLowerCase().includes(Q)) s += 2;
  if (d.overview.toLowerCase().includes(Q)) s += 1;
  (d.symptoms || []).forEach(sym => { if (sym.toLowerCase().includes(Q)) s += 1; });
  return s;
};

/**
 * Main page component
 */
const Diseases: React.FC = () => {
  // UI state
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Disease | null>(null);
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  // optional external toast
  // const { toast } = useToast?.() ?? { toast: (opts: any) => alert(opts?.title ?? 'Done') };

  const debouncedQuery = useDebouncedValue(query, 220);

  // Filtering + sorting memoized
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let list = diseases.slice();

    if (q) {
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.overview.toLowerCase().includes(q) ||
        (d.symptoms || []).some(s => s.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      list = list.filter(d => d.category === selectedCategory);
    }

    if (showOnlyCritical) {
      list = list.filter(d => d.severity === 'high' || d.critical === true);
    }

    // sorting
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      list.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      // relevance heuristic
      if (q) {
        list.sort((a, b) => scoreForQuery(b, q) - scoreForQuery(a, q));
      }
    }
    return list;
  }, [debouncedQuery, selectedCategory, sortBy, showOnlyCritical]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // actions
  const handleView = useCallback((d: Disease) => {
    setSelected(d);
    // focus trap or other a11y could be added (Dialog component might handle it)
  }, []);

  const handleQuickCopy = useCallback(async (d: Disease) => {
    const short = `${d.name}: ${d.overview}`;
    const ok = await copyToClipboard(short);
    if (ok) {
      try { (window as any).toast?.success?.('Copied'); } catch { /* noop */ }
    } else {
      alert('Copied to clipboard (fallback)');
    }
  }, []);

  const handleExport = useCallback(async (d: Disease) => {
    const payload = [
      `${d.name}`,
      '',
      `${d.overview}`,
      '',
      'Symptoms:',
      ...(d.symptoms ?? []),
      '',
      'Treatments:',
      ...(d.treatments ?? [])
    ].join('\n');
    const ok = await copyToClipboard(payload);
    if (ok) {
      try { (window as any).toast?.success?.('Export copied to clipboard'); } catch { /* noop */ }
    } else {
      alert('Export copied to clipboard (fallback)');
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // keyboard shortcuts: "/" focus search
  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && (document.activeElement as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 px-4 py-10 max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Disease Explorer</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Curated condition summaries for clinicians, students and curious minds.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  ref={searchRef}
                  type="search"
                  placeholder="Search diseases, symptoms, treatments..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  aria-label="Search diseases"
                  className="min-w-[260px]"
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    onClick={() => { setQuery(''); setPage(1); searchRef.current?.focus(); }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${selectedCategory === null ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                  onClick={() => { setSelectedCategory(null); setPage(1); }}
                  title="All categories"
                >
                  <Filter className="h-4 w-4" /> All
                </button>

                <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-card">
                  <label htmlFor="sort" className="sr-only">Sort</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-sm"
                    aria-label="Sort diseases"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>
            </div>
          </header>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory((c) => (c === cat ? null : cat)); setPage(1); }}
                aria-pressed={selectedCategory === cat}
                className={`px-3 py-1 rounded-full text-sm border ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => { setShowOnlyCritical(s => !s); setPage(1); }}
              aria-pressed={showOnlyCritical}
              className={`px-3 py-1 rounded-full text-sm border ${showOnlyCritical ? 'bg-rose-600 text-white' : ''}`}
            >
              {showOnlyCritical ? 'Critical only' : 'Show critical'}
            </button>
          </div>

          {/* Results */}
          <section aria-labelledby="results-heading">
            <h2 id="results-heading" className="sr-only">Search results</h2>

            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg">No conditions found</p>
                {debouncedQuery && <p className="text-sm text-muted-foreground mt-2">Try broader keywords or clear filters.</p>}
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pageItems.map(d => (
                    <article key={d.id} className="group" aria-labelledby={`title-${d.id}`}>
                      <Card className="h-full flex flex-col justify-between p-4">
                        <CardHeader className="p-0">
                          <div className="flex items-start justify-between">
                            <CardTitle id={`title-${d.id}`} className="text-lg">{d.name}</CardTitle>
                            <Badge variant="secondary">{d.category}</Badge>
                          </div>
                          <CardDescription className="text-sm text-muted-foreground mt-2 line-clamp-3">{d.overview}</CardDescription>
                        </CardHeader>

                        <CardContent className="p-0 mt-4 flex items-center justify-between">
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">{d.prevalence ?? '—'}</span>
                            <span className="px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">{d.severity ?? 'moderate'}</span>
                            {d.commonAge && <span className="px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">{d.commonAge}</span>}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(d)} aria-label={`View ${d.name} details`}>
                              View
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleQuickCopy(d)} aria-label={`Copy summary for ${d.name}`}>
                              Copy
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {filtered.length > PAGE_SIZE && (
                  <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" /> Prev
                      </Button>
                      <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={page}
                        onChange={(e) => setPage(Number(e.target.value))}
                        aria-label="Select page"
                        className="bg-card rounded-md px-2 py-1 text-sm"
                      >
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                        ))}
                      </select>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        aria-label="Next page"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-4xl max-h-[86vh] overflow-y-auto">
          {selected && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selected.name}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">{selected.overview}</DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                  <section>
                    <h4 className="text-lg font-semibold">Symptoms</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selected.symptoms?.map((s, i) => <li key={i}>{s}</li>) || <li>Not listed</li>}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-lg font-semibold">Causes</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selected.causes?.map((c, i) => <li key={i}>{c}</li>) || <li>Not listed</li>}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-lg font-semibold">Treatments</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selected.treatments?.map((t, i) => <li key={i}>{t}</li>) || <li>Not listed</li>}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-lg font-semibold">Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      This information is educational and should not replace medical advice. For diagnosis and treatment consult a qualified professional.
                    </p>
                  </section>
                </div>
              </div>

              <aside className="khub-detail-side lg:col-span-1">
                <div className="flex flex-col gap-4 sticky top-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-semibold text-foreground">{selected.category}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Severity</div>
                    <div className="font-semibold text-foreground">{selected.severity ?? 'moderate'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Prevalence</div>
                    <div className="font-semibold text-foreground">{selected.prevalence ?? 'Unknown'}</div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => handleExport(selected)}>
                      <Download className="h-4 w-4" /> Export
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(JSON.stringify(selected, null, 2)).then(() => {
                      try { (window as any).toast?.success?.('JSON copied'); } catch { /* noop */ }
                    })}>
                      <Copy className="h-4 w-4" /> Copy JSON
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handlePrint}>
                      <Printer className="h-4 w-4" /> Print
                    </Button>
                  </div>

                  <div className="mt-4">
                    <Link to="/consult" className="text-sm underline">Book a consult</Link>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Diseases;
