"use client";

import { DebtNoticeModal } from "./debt-notice-modal";
import { Icon } from "./icons";
import { useDebtNoticeButton } from "./use-debt-notice-button";

interface DebtNoticeButtonProps {
  memberIds: string[];
  label: string;
  compact?: boolean;
  primary?: boolean;
}

// Opens the debt notice email for one debtor or for a whole list.
export function DebtNoticeButton({
  memberIds,
  label,
  compact = false,
  primary = false,
}: DebtNoticeButtonProps) {
  const button = useDebtNoticeButton(memberIds);
  if (!button.visible) return null;
  if (compact && button.noEmail) {
    return <span className="sys-notice__muted">Sin correo</span>;
  }

  const variant = primary ? " sys-button--primary" : " sys-button--mail";
  return (
    <>
      <button
        type="button"
        className={`sys-button${variant}${compact ? " sys-button--small" : ""}`}
        onClick={button.open}
      >
        {!compact && <Icon name="mail" />}
        {label}
      </button>
      {button.isOpen && (
        <DebtNoticeModal memberIds={memberIds} onClose={button.close} />
      )}
    </>
  );
}
