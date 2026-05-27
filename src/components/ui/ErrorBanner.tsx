export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-rose-500 flex-shrink-0" />
      <p className="text-rose-700 text-sm">{message}</p>
    </div>
  );
}
