'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useIngredients } from '@/hooks/useIngredients';

type Unit = 'KG' | 'L' | 'G' | 'ML';

type StepIngredient = {
  id: string;
  name: string;
  quantity: string;
  unit: Unit;
};

type RecipeStep = {
  id: string;
  stepType: 'KNEADER' | 'MIXING';
  sequenceNumber: number | '';
  timerSeconds: number | '';
  pressure: number | '';
  temperature: number | '';
  rpm: number | '';
  ingredients: StepIngredient[];
};

export default function StepList({
  steps,
  onChange,
  onRemove,
  onAddIngredient,
  onChangeIngredient,
  onRemoveIngredient,
  disabled,
}: Readonly<{
  steps: RecipeStep[];
  onChange: (id: string, patch: Partial<RecipeStep>) => void;
  onRemove: (id: string) => void;
  onAddIngredient: (stepId: string) => void;
  onChangeIngredient: (
    stepId: string,
    ingId: string,
    patch: Partial<StepIngredient>
  ) => void;
  onRemoveIngredient: (stepId: string, ingId: string) => void;
  disabled?: boolean;
}>) {
  const { data: ingredientOptions = [], isLoading: isLoadingIngredients } =
    useIngredients();

  if (!steps || !steps.length) {
    return <p className="text-sm text-gray-500">No steps added yet.</p>;
  }

  const UNITS: Unit[] = ['KG', 'L', 'G', 'ML'];

  return (
    <div className="space-y-4">
      {steps
        .slice()
        .sort((a, b) => Number(a.sequenceNumber) - Number(b.sequenceNumber))
        .map((s) => (
          <Card key={s.id} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label>Sequence No.</Label>
                <Input
                  type="number"
                  min={1}
                  value={s.sequenceNumber as any}
                  onChange={(e) =>
                    onChange(s.id, { sequenceNumber: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div>

              <div>
                <Label>Step Timer (sec)</Label>
                <Input
                  type="number"
                  min={1}
                  value={s.timerSeconds as any}
                  onChange={(e) =>
                    onChange(s.id, { timerSeconds: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div>

              <div>
                <Label>Pressure (bar)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={s.pressure as any}
                  onChange={(e) =>
                    onChange(s.id, { pressure: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div>

              <div>
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  min={1}
                  value={s.temperature as any}
                  onChange={(e) =>
                    onChange(s.id, { temperature: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div>

              <div>
                <Label>RPM</Label>
                <Input
                  type="number"
                  min={1}
                  value={s.rpm as any}
                  onChange={(e) =>
                    onChange(s.id, { rpm: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div>

              <div className="flex items-end justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => onAddIngredient(s.id)}
                  disabled={disabled}
                >
                  Add Ingredient
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onRemove(s.id)}
                  disabled={disabled}
                >
                  Remove Step
                </Button>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <div className="text-sm text-gray-600 font-medium">
                Ingredients
              </div>
              <div className="space-y-2">
                {s.ingredients.map((ing) => (
                  <div key={ing.id} className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Label className="sr-only">Ingredient Code</Label>
                      <Select
                        value={ing.name}
                        onValueChange={(v) =>
                          onChangeIngredient(s.id, ing.id, {
                            name: v as string,
                          })
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Ingredient" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {isLoadingIngredients ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : ingredientOptions.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No ingredients found
                            </SelectItem>
                          ) : (
                            ingredientOptions.map((ingItem: any) => (
                              <SelectItem
                                key={ingItem.id}
                                value={ingItem.ingredientCode}
                              >
                                {ingItem.ingredientCode} — {ingItem.name || ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <Label className="sr-only">Quantity</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Qty"
                        value={ing.quantity as any}
                        onChange={(e) =>
                          onChangeIngredient(s.id, ing.id, {
                            quantity: e.target.value,
                          })
                        }
                        disabled={disabled}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="sr-only">Unit</Label>
                      <Select
                        value={ing.unit}
                        onValueChange={(v) =>
                          onChangeIngredient(s.id, ing.id, { unit: v as Unit })
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <Button
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => onRemoveIngredient(s.id, ing.id)}
                        disabled={disabled}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
    </div>
  );
}
