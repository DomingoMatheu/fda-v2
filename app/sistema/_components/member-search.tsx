"use client";

import Link from "next/link";
import { CATEGORY_LABELS } from "../_data/labels";
import { formatDocument, listName } from "../_lib/format";
import { Icon } from "./icons";
import { useMemberSearch } from "./use-member-search";

export function MemberSearch() {
  const { query, setQuery, results, isOpen, close, submit } = useMemberSearch();
  return (
    <form className="sys-search" role="search" onSubmit={submit}>
      <Icon name="search" className="sys-search__icon" />
      <input
        type="search"
        className="sys-search__input"
        placeholder="Buscar socio por nombre, DNI o número"
        aria-label="Buscar socio"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => event.key === "Escape" && close()}
      />
      {isOpen && (
        <div className="sys-search__results">
          {results.length === 0 ? (
            <p className="sys-search__empty">
              No encontramos socios con “{query}”.
            </p>
          ) : (
            <ul>
              {results.map((member) => (
                <li key={member.id}>
                  <Link href={`/sistema/socios/${member.id}`} onClick={close}>
                    <span className="sys-search__name">{listName(member)}</span>
                    <span className="sys-search__meta">
                      N.º {member.memberNumber} · DNI{" "}
                      {formatDocument(member.documentNumber)} ·{" "}
                      {CATEGORY_LABELS[member.category]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
