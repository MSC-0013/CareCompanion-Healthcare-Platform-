import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { diseases, type Disease } from '@/lib/diseases';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Download, Printer, Copy, Filter } from 'lucide-react'; // add icons (install if needed)
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type SortOption = 'relevance' | 'name' | 'category';

const PAGE_SIZE = 9;

const uniqueCategories = Array.from(new Set(diseases.map((d) => d.category))).sort();

const debounce = <T extends (...args: any[]) => void>(fn: T, wait = 250) => {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait) as unknown as number;
  };
};

const Diseases: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Disease | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  // debounced user input
  useEffect(() => {
    const handle = debounce((v: string) => setDebouncedQuery(v), 220);
    handle(query);
    return () => window.clearTimeout(handle as unknown as number);
  }, [query]);

  // filter & sort
  const filtered = useMemo(() => {
    let list = [...diseases];

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase();
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.overview.toLowerCase().includes(q) ||
        (d.symptoms || []).some(s => s.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      list = list.filter((d) => d.category === selectedCategory);
    }

    if (showOnlyCritical) {
      list = list.filter((d) => d.severity === 'high' || d.critical === true);
    }

    // sort
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      list.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      // relevance: keep original ordering or simple heuristic (match count)
      list.sort((a, b) => {
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) return 0;
        const score = (d: Disease) => {
          let s = 0;
          if (d.name.toLowerCase().includes(q)) s += 5;
          if (d.category.toLowerCase().includes(q)) s += 2;
          if (d.overview.toLowerCase().includes(q)) s += 1;
          (d.symptoms || []).forEach(sym => { if (sym.toLowerCase().includes(q)) s += 1; });
          return s;
        };
        return score(b) - score(a);
      });
    }

    return list;
  }, [debouncedQuery, selectedCategory, sortBy, showOnlyCritical]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // actions in dialog
  const handleCopy = useCallback((d: Disease) => {
    const text = `${d.name}\n\n${d.overview}\n\nSymptoms:\n- ${d.symptoms?.join('\n- ')}\n\nTreatments:\n- ${d.treatments?.join('\n- ')}`;
    navigator.clipboard?.writeText(text).then(() => {
      // small toast? use native alert fallback to avoid new deps
      try { window?.toast?.success?.('Copied to clipboard'); } catch { /* noop */ }
    }).catch(() => { });
  }, []);

  const handlePrint = useCallback(() => window.print(), []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 px-4 py-10 khub-container">
        <div className="space-y-6">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Disease Explorer</h1>
              <p className="text-sm text-muted-foreground mt-1">Comprehensive, curated health condition summaries for quick reference.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="khub-search khub-focus" role="search" aria-label="Search diseases">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search diseases, symptoms, treatments..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  aria-label="Search diseases"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="khub-pill khub-focus"
                  onClick={() => { setSelectedCategory(null); setPage(1); }}
                  aria-pressed={selectedCategory === null}
                  title="All categories"
                >
                  <Filter className="h-4 w-4" /> All
                </button>
                <div className="khub-pill khub-focus" role="group" aria-label="Sort options">
                  <label className="mr-2 text-sm text-muted-foreground">Sort</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-sm bg-transparent border-none"
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

          {/* Category chips */}
          <div className="flex gap-3 flex-wrap">
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory((c) => (c === cat ? null : cat)); setPage(1); }}
                className={`khub-pill ${selectedCategory === cat ? 'active' : ''}`}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => { setShowOnlyCritical((s) => !s); setPage(1); }}
              className={`khub-pill ${showOnlyCritical ? 'active' : ''}`}
              title="Show only critical/high-severity conditions"
            >
              {showOnlyCritical ? 'Critical only' : 'Show critical'}
            </button>
          </div>

          {/* Grid */}
          <section>
            {filtered.length === 0 ? (
              <div className="khub-empty">
                <p className="text-lg">No diseases found.</p>
                {debouncedQuery && <p className="text-sm text-muted-foreground mt-2">Try different keywords or clear filters.</p>}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((d) => (
                  <article key={d.id} className="khub-card khub-appear khub-list-card p-4" role="article">
                    <CardHeader className="p-0">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{d.name}</CardTitle>
                        <Badge variant="secondary">{d.category}</Badge>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground mt-2 khub-overview">{d.overview}</CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 mt-3 flex items-center justify-between">
                      <div className="khub-meta">
                        <span className="khub-pill-small">{d.prevalence || '—'}</span>
                        <span className="khub-pill-small">{d.severity || 'moderate'}</span>
                        {d.commonAge && <span className="khub-pill-small">{d.commonAge}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelected(d)} aria-label={`View ${d.name} details`}>
                          View
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleQuickCopy(d)} aria-label="Copy summary">
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="khub-pagination" role="navigation" aria-label="Pagination">
              <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
              <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          )}
        </div>
      </main>

      {/* Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[86vh] overflow-y-auto">
          {selected && (
            <div className="khub-dialog no-print">
              <div className="khub-detail-main">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selected.name}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">{selected.overview}</DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                  <section>
                    <h4 className="khub-h3">Symptoms</h4>
                    <ul className="list-disc pl-5 space-y-1 text-foreground">
                      {selected.symptoms?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </section>

                  <section>
                    <h4 className="khub-h3">Causes</h4>
                    <ul className="list-disc pl-5 space-y-1 text-foreground">
                      {selected.causes?.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </section>

                  <section>
                    <h4 className="khub-h3">Treatment Options</h4>
                    <ul className="list-disc pl-5 space-y-1 text-foreground">
                      {selected.treatments?.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </section>

                  <section>
                    <h4 className="khub-h3">Notes</h4>
                    <p className="text-sm text-muted-foreground">This information is educational. Not a substitute for medical advice.</p>
                  </section>
                </div>
              </div>

              <aside className="khub-detail-side">
                <div className="flex flex-col gap-4 sticky top-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-semibold text-foreground">{selected.category}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Severity</div>
                    <div className="font-semibold text-foreground">{selected.severity || 'moderate'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Prevalence</div>
                    <div className="font-semibold text-foreground">{selected.prevalence || 'Unknown'}</div>
                  </div>

                  <div className="khub-actions">
                    <Button size="sm" variant="outline" onClick={() => handleCopy(selected)}>
                      <Download className="h-4 w-4" /> Export
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => handleCopy(selected)}>
                      <Copy className="h-4 w-4" /> Copy
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

  // --- local helper for quick copy (uses simple alert fallback) ---
  function handleQuickCopy(d: Disease) {
    const short = `${d.name}: ${d.overview}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(short).then(() => {
        try { window?.toast?.success?.('Copied'); } catch { /* noop */ }
      });
    } else {
      void navigator?.msSaveOrOpenBlob ? alert('Copied (fallback)') : alert('Copied to clipboard');
    }
  }
};

export default Diseases;
