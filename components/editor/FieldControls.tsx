"use client";

export function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-dodo-muted uppercase mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-dodo-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dodo-gold"
      />
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-dodo-muted uppercase mb-1">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-dodo-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dodo-gold"
      />
    </div>
  );
}

export function StringList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function update(i: number, value: string) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, ""]);
  }

  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-dodo-muted uppercase mb-1">
        {label}
      </label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 border border-dodo-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dodo-gold"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-dodo-muted hover:text-red-600 px-2"
              aria-label="Remove"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-sm text-dodo-gold-dark font-medium"
      >
        + Add
      </button>
    </div>
  );
}

export interface Titled {
  title: string;
  description: string;
}

export function TitledList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: Titled[];
  onChange: (items: Titled[]) => void;
}) {
  function update(i: number, patch: Partial<Titled>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, { title: "", description: "" }]);
  }

  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-dodo-muted uppercase mb-1">
        {label}
      </label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-dodo-border rounded-lg p-3 space-y-2">
            <div className="flex gap-2">
              <input
                value={item.title}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Title"
                className="flex-1 border border-dodo-border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-dodo-muted hover:text-red-600 px-2"
                aria-label="Remove"
              >
                &times;
              </button>
            </div>
            <textarea
              value={item.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Description"
              rows={2}
              className="w-full border border-dodo-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-dodo-gold"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-sm text-dodo-gold-dark font-medium"
      >
        + Add
      </button>
    </div>
  );
}

export interface Category {
  title: string;
  items: string[];
  price_weight: number;
}

export function CategoryList({
  label,
  categories,
  onChange,
}: {
  label: string;
  categories: Category[];
  onChange: (categories: Category[]) => void;
}) {
  function update(i: number, patch: Partial<Category>) {
    const next = [...categories];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(categories.filter((_, idx) => idx !== i));
  }
  function add() {
    const evenWeight = 1 / (categories.length + 1);
    onChange([...categories, { title: "", items: [""], price_weight: evenWeight }]);
  }
  function updateItem(catIndex: number, itemIndex: number, value: string) {
    const cat = categories[catIndex];
    const nextItems = [...cat.items];
    nextItems[itemIndex] = value;
    update(catIndex, { items: nextItems });
  }
  function removeItem(catIndex: number, itemIndex: number) {
    const cat = categories[catIndex];
    update(catIndex, { items: cat.items.filter((_, idx) => idx !== itemIndex) });
  }
  function addItem(catIndex: number) {
    const cat = categories[catIndex];
    update(catIndex, { items: [...cat.items, ""] });
  }

  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-dodo-muted uppercase mb-1">
        {label}
      </label>
      <div className="space-y-4">
        {categories.map((cat, i) => (
          <div key={i} className="border border-dodo-border rounded-lg p-3 space-y-2">
            <div className="flex gap-2">
              <input
                value={cat.title}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Category title"
                className="flex-1 border border-dodo-border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-dodo-gold"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-dodo-muted hover:text-red-600 px-2"
                aria-label="Remove category"
              >
                &times;
              </button>
            </div>
            <div className="space-y-1.5 pl-2">
              {cat.items.map((item, j) => (
                <div key={j} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateItem(i, j, e.target.value)}
                    className="flex-1 border border-dodo-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-dodo-gold"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i, j)}
                    className="text-dodo-muted hover:text-red-600 px-2"
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(i)}
                className="text-sm text-dodo-gold-dark font-medium"
              >
                + Add item
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-sm text-dodo-gold-dark font-medium"
      >
        + Add category
      </button>
    </div>
  );
}
