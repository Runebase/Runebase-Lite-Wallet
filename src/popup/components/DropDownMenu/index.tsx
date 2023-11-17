import React, { useState } from 'react';
import { Menu, MenuItem, Button } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import useStyles from './styles';

interface IProps {
  onSelect?: (idx: number) => any;
  selections: string[];
  selectedIndex: number;
}

const DropDownMenu: React.FC<IProps> = ({
  selections,
  selectedIndex,
  onSelect,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<any>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (index: number) => {
    if (onSelect) {
      onSelect(index);
    }
    handleClose();
  };

  return (
    <div>
      <Button
        aria-haspopup="true"
        color="secondary"
        variant="contained"
        size="small"
        className={classes.menuButton}
        onClick={handleClick}
      >
        {selections[selectedIndex]}
        <ArrowDropDown />
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {selections.map((item, index) => (
          <MenuItem key={index} onClick={() => handleMenuItemClick(index)}>
            {item}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default DropDownMenu;
