import { Plus } from "lucide-react";

// Define the props interface separately for clarity
interface AddButtonProps {
  onPress: () => void;
  label?: string;
}

// Function Declaration
function AddIconButton({ onPress, label = "Add Item" }: AddButtonProps) {
  return (
    <button
      onClick={onPress}
      className="fixed right-4 bottom-20 w-14 h-14 flex items-center justify-center bg-[#60b8c0] text-white font-semibold py-4 rounded-full transition-colors text-lg shadow-lg hover:bg-[#4fa8b0] active:scale-95"
      aria-label={label}
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
}

export default AddIconButton;
