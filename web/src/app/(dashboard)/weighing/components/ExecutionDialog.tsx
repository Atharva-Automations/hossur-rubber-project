'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RecipeOption } from '../types/execution';
import { ExecutionPreview } from './ExecutionPreview';

interface ExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: RecipeOption[];
  selectedRecipeId: string;
  batchCount: number;
  recipeError?: string;
  batchError?: string;
  onRecipeChange: (value: string) => void;
  onBatchCountChange: (value: string) => void;
  onSubmit: () => void;
}

export function ExecutionDialog({
  open,
  onOpenChange,
  recipes,
  selectedRecipeId,
  batchCount,
  recipeError,
  batchError,
  onRecipeChange,
  onBatchCountChange,
  onSubmit,
}: ExecutionDialogProps) {
  const selectedRecipe =
    recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white max-h-[calc(100vh-6rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Execution</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Recipe
              </label>
              <Select value={selectedRecipeId} onValueChange={onRecipeChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {recipeError ? (
                <p className="text-sm text-red-600">{recipeError}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Number Of Batches
              </label>
              <Input
                type="number"
                min="1"
                value={batchCount}
                onChange={(event) => onBatchCountChange(event.target.value)}
                placeholder="Enter batch count"
              />
              {batchError ? (
                <p className="text-sm text-red-600">{batchError}</p>
              ) : null}
            </div>
          </div>

          <ExecutionPreview recipe={selectedRecipe} batchCount={batchCount} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Execution</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
