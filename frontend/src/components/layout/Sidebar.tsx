import Link from 'next/link';
import { sidebarNavigation } from '@/data/navigation';

export function Sidebar() {
  return (
    <nav className="w-56 shrink-0 border-r border-gray-200 p-4">
      <ul className="space-y-1">
        {sidebarNavigation.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
