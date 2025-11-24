import { IconName } from '@con/icons';

export type DropdownItem = {
  id: string;
  label: string;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

export type DropdownMenuProps = {
  items: DropdownItem[];
  isVisible: boolean;
  onClose: () => void;
  position?: 'top' | 'bottom';
  offset?: number;
  testID?: string;
};
