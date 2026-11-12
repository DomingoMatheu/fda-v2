"use client";

import {
  formatDocument,
  formatMoney,
  fullName,
  listName,
} from "../_lib/format";
import { Modal } from "./modal";
import { useIssuePass } from "./use-issue-pass";

interface IssuePassModalProps {
  // Without a member, the modal starts with a member search.
  memberId?: string;
  onClose: () => void;
}

export function IssuePassModal({ memberId, onClose }: IssuePassModalProps) {
  const issue = useIssuePass(memberId, onClose);
  const { member, season } = issue;

  return (
    <Modal
      title="Emitir carnet de pileta"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sys-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="sys-button sys-button--primary"
            onClick={issue.confirm}
            disabled={!member || !season}
          >
            Emitir carnet
          </button>
        </>
      }
    >
      <div className="sys-form">
        {member ? (
          <div className="sys-season__modal-member">
            <div>
              <p className="sys-season__modal-name">{fullName(member)}</p>
              <p className="sys-season__muted">
                Socio n.º {member.memberNumber} · DNI{" "}
                {formatDocument(member.documentNumber)}
              </p>
            </div>
            {!memberId && (
              <button
                type="button"
                className="sys-button sys-button--small"
                onClick={issue.clearMember}
              >
                Cambiar socio
              </button>
            )}
          </div>
        ) : (
          <>
            <label className="sys-field">
              <span className="sys-field__label">Socio</span>
              <input
                className="sys-input"
                placeholder="Nombre, DNI o número de socio"
                value={issue.query}
                onChange={(event) => issue.setQuery(event.target.value)}
              />
            </label>
            {issue.query.trim() && issue.results.length === 0 ? (
              <p className="sys-empty">
                No hay socios activos sin carnet que coincidan con la búsqueda.
              </p>
            ) : (
              <ul className="sys-season__results">
                {issue.results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => issue.chooseMember(result.id)}
                    >
                      <strong>{listName(result)}</strong>
                      <span>
                        N.º {result.memberNumber} · DNI{" "}
                        {formatDocument(result.documentNumber)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {season && (
          <p className="sys-season__muted">
            {season.name}: se agrega a su cuenta la cuota del carnet por{" "}
            <strong>{formatMoney(season.memberPassPrice)}</strong>. Para entrar
            a la pileta también necesita el apto médico vigente.
          </p>
        )}
      </div>
    </Modal>
  );
}
