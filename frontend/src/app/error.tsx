'use client';

import { Button } from '@/components/ui/Button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium text-gray-900">Something went wrong.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
