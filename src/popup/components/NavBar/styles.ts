import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    margin: theme.spacing(2),
    flexDirection: 'row' as const,
    display: 'flex',
  },
  leftButtonsContainer: {
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  },
  backIconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  backButton: {
    '&.white': {},
  },
  settingsIconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  settingsButton: {
    fontSize: theme.typography.fontSizeLarge,
    '&.white': {},
  },
  locationContainer: {
    height: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    '&.white': {},
  },
}));

export default useStyles;
