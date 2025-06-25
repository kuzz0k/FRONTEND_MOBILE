import { useCallback, useState } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  toggleModal: () => void;
}

export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    toggleModal
  };
};
