import React, { useEffect, useRef, useState } from "react";

export default function AddressAutocomplete({
  label = "Address",
  value,
  onChange,     // (text: string) => void
  onSelect,     // (result) => void
  placeholder = "Start typing an address…",
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef(null);

  const key = import.meta.env?.VITE_RADAR_KEY;

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    // No network calls if key missing or query too short
    if (!key) {
      // Don’t spam logs—one informative message
      if (query.length >= 3) {
        console.warn("[Radar] Missing VITE_RADAR_KEY. Check your .env and restart `npm run dev`.");
      }
      setResults([]);
      return;
    }
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const url = `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          headers: { Authorization: key },
          signal: ctrl.signal
        });

        if (!res.ok) {
          console.warn("[Radar] HTTP", res.status, "Check key or referrer restrictions.");
        }

        const data = await res.json().catch(() => ({}));
        const addresses = Array.isArray(data.addresses) ? data.addresses : [];
        setResults(addresses);
        setOpen(true);
        setHighlight(-1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("[Radar] Autocomplete error:", err);
        }
      }
    }, 250); // debounce

    return () => { clearTimeout(id); ctrl.abort(); };
  }, [query, key]);

  function choose(item) {
    const label = item.formattedAddress || item.placeLabel || "";
    onChange?.(label);
    onSelect?.(item);
    setQuery(label);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      choose(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange?.(e.target.value); }}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-gray-200 px-4"
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((r, i) => {
            const text = r.formattedAddress || r.placeLabel || "(no label)";
            return (
              <button
                key={r._id || text + i}
                type="button"
                onClick={() => choose(r)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${i===highlight ? 'bg-gray-50' : ''}`}
              >
                {text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

