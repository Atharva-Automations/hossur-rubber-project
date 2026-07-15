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

export default function StepList({
  steps,
  onChange,
  onRemove,
  onAddIngredient,
  onChangeIngredient,
  onRemoveIngredient,
  disabled,
}: Readonly<any>) {
  const { data: ingredientOptions = [], isLoading: isLoadingIngredients } =
    useIngredients();

  if (!steps || !steps.length) {
    return <p className="text-sm text-gray-500">No steps added yet.</p>;
  }

  return (
    <div className="space-y-4">
      {steps
        .slice()
        // @ts-expect-error - generic array, no specific type
        .sort((a, b) => Number(a.sequenceNumber) - Number(b.sequenceNumber))
        // @ts-expect-error - generic array, no specific type
        .map((s) => (
          <Card key={s.id} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label>Sequence No.</Label>
                <Input
                  type="number"
                  min={1}
                  value={s.sequenceNumber ? String(s.sequenceNumber) : ''}
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
                  value={s.timerSeconds ? String(s.timerSeconds) : ''}
                  onChange={(e) =>
                    onChange(s.id, { timerSeconds: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div>

              {/* <div>
                <Label>Pressure (bar)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={s.pressure ? String(s.pressure) : ''}
                  onChange={(e) =>
                    onChange(s.id, { pressure: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div> */}

              {/* <div>
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  min={1}
                  value={s.temperature ? String(s.temperature) : ''}
                  onChange={(e) =>
                    onChange(s.id, { temperature: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div> */}

              {/* <div>
                <Label>RPM</Label>
                <Input
                  type="number"
                  min={1}
                  value={s.rpm ? String(s.rpm) : ''}
                  onChange={(e) =>
                    onChange(s.id, { rpm: Number(e.target.value) })
                  }
                  disabled={disabled}
                />
              </div> */}

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
                {s.ingredients.map((ing: any) => (
                  <div key={ing.id} className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
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
                            (
                              ingredientOptions as Array<{
                                id: number;
                                ingredientCode?: string;
                                name?: string;
                              }>
                            ).map((ingItem) => (
                              <SelectItem
                                key={ingItem.id}
                                value={ingItem.ingredientCode || ''}
                              >
                                {ingItem.ingredientCode} — {ingItem.name || ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2  ">
                      <Label className="sr-only">Quantity</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Qty"
                        value={ing.quantity ? String(ing.quantity) : ''}
                        onChange={(e) =>
                          onChangeIngredient(s.id, ing.id, {
                            quantity: e.target.value,
                          })
                        }
                        disabled={disabled}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="sr-only">Tolerance</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Tolerance"
                        value={ing.tolerance ? String(ing.tolerance) : ''}
                        onChange={(e) =>
                          onChangeIngredient(s.id, ing.id, {
                            tolerance: e.target.value,
                          })
                        }
                        disabled={disabled}
                      />
                    </div>

                    {/* <div className="col-span-2">
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
                    </div> */}

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
