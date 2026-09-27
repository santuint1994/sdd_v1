export function Header() {
  return (
    <header className="flex h-14 items-center border-b border-gray-200 px-4">
      <span className="text-sm font-semibold text-gray-900">
        {process.env.NEXT_PUBLIC_APP_NAME ?? 'Application'}
      </span>
    </header>
  );
}
