import { useCallback, useState } from "react";
import { WorkoutSchema } from "../../schema";

export function useFormDialog() {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkoutSchema | null>(null);

  const handleClick = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  return {
    open,
    handleClick,
    selectedItem,
    setSelectedItem,
  };
}
