"use client";

export interface TabItem<Key extends string> {
  key: Key;
  label: string;
  count?: number;
}

interface TabsProps<Key extends string> {
  items: TabItem<Key>[];
  active: Key;
  onChange: (key: Key) => void;
  label: string;
}

export function Tabs<Key extends string>({
  items,
  active,
  onChange,
  label,
}: TabsProps<Key>) {
  return (
    <div className="sys-tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={item.key === active}
          className="sys-tabs__tab"
          onClick={() => onChange(item.key)}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="sys-tabs__count">{item.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
