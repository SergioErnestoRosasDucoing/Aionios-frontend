type ColorScheme = "indigo" | "violet";

const colorMap: Record<ColorScheme, string> = {
  indigo: "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400",
  violet: "bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400",
};

interface SubmitButtonProps {
  loading: boolean;
  loadingText?: string;
  colorScheme?: ColorScheme;
  children: React.ReactNode;
}

export default function SubmitButton({
  loading,
  loadingText = "Cargando...",
  colorScheme = "indigo",
  children,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full py-2.5 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer ${colorMap[colorScheme]}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
