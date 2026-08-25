// txNotifications.ts
//
// Surfaces transaction outcomes as snackbars: one when a transaction is
// broadcast, one when it confirms on chain, and one when it fails.
//
// The snackbar lives in React context, so the provider hands its `showSnackbar`
// down here the same way the router hands down `navigate` in messageMiddleware.
//
// State here is deliberately in-memory only. If the view is closed when a
// transaction confirms (the usual case for the extension popup, which unmounts
// on close) the notification is simply skipped rather than replayed later.

type Severity = 'success' | 'info' | 'warning' | 'error';

let snackbarFn: ((message: string, severity?: Severity) => void) | null = null;

export const setSnackbarFunction = (fn: (message: string, severity?: Severity) => void) => {
  snackbarFn = fn;
};

const notify = (message: string, severity: Severity) => {
  snackbarFn?.(message, severity);
};

// --- broadcast / failure -----------------------------------------------

export const notifyTxSubmitted = (what = 'Transaction') => {
  notify(`${what} submitted`, 'info');
};

export const notifyTxFailed = (message?: string, what = 'Transaction') => {
  const reason = (message || '').trim();
  notify(reason ? `${what} failed: ${reason}` : `${what} failed`, 'error');
};

// --- on-chain confirmation: sends and token transfers -------------------

// Txids observed with zero confirmations during this session. A transaction
// that is already confirmed the first time we see it is never added, so
// history never triggers a notification on load.
const pendingTxIds = new Set<string>();

interface ConfirmableTx {
  id?: string;
  confirmations?: number;
}

const trackConfirmations = (items: ConfirmableTx[] | undefined, label: string) => {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    const id = item?.id;
    if (!id) continue;
    if ((item.confirmations ?? 0) > 0) {
      if (pendingTxIds.delete(id)) {
        notify(`${label} confirmed`, 'success');
      }
    } else {
      pendingTxIds.add(id);
    }
  }
};

export const trackTransactions = (txs: ConfirmableTx[] | undefined) =>
  trackConfirmations(txs, 'Transaction');

export const trackTokenTransfers = (transfers: ConfirmableTx[] | undefined) =>
  trackConfirmations(transfers, 'Token transfer');

// --- on-chain confirmation: delegation ---------------------------------

/**
 * Announce a delegation change that the background controller has confirmed
 * against the contract. Deciding *when* that happened lives in the background,
 * since delegation info is polled on a timer and looks identical until the
 * transaction is mined.
 */
export const notifyDelegationConfirmed = (type: 'add' | 'remove' | 'change') => {
  notify(
    type === 'remove' ? 'Delegation removed' : type === 'change' ? 'Delegation updated' : 'Delegation confirmed',
    'success',
  );
};

/** Clear per-session tracking (logout / account switch). */
export const resetTxNotifications = () => {
  pendingTxIds.clear();
};
