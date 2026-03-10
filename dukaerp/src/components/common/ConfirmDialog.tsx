import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  triggerLabel: string;
  message: string;
  onConfirm: () => void;
  variant?: "default" | "outline" | "ghost";
}

const ConfirmDialog = ({ triggerLabel, message, onConfirm, variant }: ConfirmDialogProps) => {
  const handleClick = () => {
    const ok = window.confirm(message);
    if (ok) onConfirm();
  };

  return (
    <Button variant={variant} onClick={handleClick}>
      {triggerLabel}
    </Button>
  );
};

export default ConfirmDialog;
