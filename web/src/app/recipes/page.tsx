'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function RecipePage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recipes</h2>
        <Link href="/recipes/add">
          <Button>+ Add Recipe</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
