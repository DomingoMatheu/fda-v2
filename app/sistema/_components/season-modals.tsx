"use client";

import { ClearanceModal } from "./clearance-modal";
import { IssuePassModal } from "./issue-pass-modal";
import { RegisterPaymentModal } from "./register-payment-modal";
import type { SeasonModal } from "./use-season-modals";

interface SeasonModalsProps {
  modal: SeasonModal | null;
  onClose: () => void;
}

// The member actions the gate and the passes list share: charge, load the
// medical clearance and issue the season pass.
export function SeasonModals({ modal, onClose }: SeasonModalsProps) {
  if (!modal) return null;
  switch (modal.kind) {
    case "cobro":
      return (
        <RegisterPaymentModal
          memberId={modal.memberId}
          includeFeeIds={modal.feeIds}
          onClose={onClose}
        />
      );
    case "apto":
      return modal.memberId ? (
        <ClearanceModal memberId={modal.memberId} onClose={onClose} />
      ) : null;
    case "carnet":
      return <IssuePassModal memberId={modal.memberId} onClose={onClose} />;
  }
}
