import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  // Type header row
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: theme.palette.action.hover,
    flexShrink: 0,
  },
  headerLabel: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  headerMeta: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },

  // Hero amount card
  amountCard: {
    textAlign: 'center' as const,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  amountText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: 1.4,
  },
  amountTokenRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.75),
  },

  // Details card
  detailsCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: `${theme.spacing(0.75)} 0`,
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    flexShrink: 0,
    minWidth: 56,
  },
  detailValue: {
    fontSize: '0.8rem',
    textAlign: 'right' as const,
    wordBreak: 'break-all' as const,
  },
  txidValue: {
    fontSize: '0.75rem',
    fontFamily: 'Roboto Mono, monospace',
    wordBreak: 'break-all' as const,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  // Token transfer card
  transferCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  transferHeader: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  transferAmountRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(1),
  },
  transferAmount: {
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  transferSymbol: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  // Full-width address rows
  addressLabel: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  addressValue: {
    fontSize: '0.7rem',
    fontFamily: 'Roboto Mono, monospace',
    wordBreak: 'break-all' as const,
    lineHeight: 1.5,
    marginBottom: theme.spacing(0.75),
  },

  // Input/output amount (right-aligned in each row)
  ioAmount: {
    fontSize: '0.75rem',
    fontWeight: 500,
    fontFamily: 'Roboto Mono, monospace',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  },

  // Maturity progress
  maturityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
  maturityText: {
    fontSize: '0.65rem',
    color: theme.palette.text.secondary,
    flexShrink: 0,
  },
}));

export default useStyles;
