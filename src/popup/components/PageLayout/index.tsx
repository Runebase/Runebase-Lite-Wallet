import React from 'react';
import { Box } from '@mui/material';
import NavBar from '../NavBar';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  hasBackButton?: boolean;
  /** When true, children fill the remaining space without extra padding (for custom layouts like AccountDetail) */
  noPadding?: boolean;
  /** When true, the content area is not scrollable (caller manages scroll) */
  noScroll?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  hasBackButton,
  noPadding,
  noScroll,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NavBar
        hasBackButton={hasBackButton}
        title={title}
      />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: noScroll ? 'hidden' : 'auto',
          ...(noPadding ? {} : { p: 2 }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;
