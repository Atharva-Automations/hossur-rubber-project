'use client';

import Link from 'next/link';
import { Header, PageContainer } from '@/components/global';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function RecipePage() {
  return (
    <PageContainer>
      <Header
        title="Recipes"
        description="Manage production recipes and their components"
        icon="📝"
      />

      <div className="mt-8 flex justify-end">
        <Link href="/recipes/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} />
            Add Recipe
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}
