'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCreateRecipe } from '@/hooks/useRecipes';

import { Header, PageContainer, Card } from '@/components/global';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import StepList from '@/app/(dashboard)/recipes/components/StepList';

// ---------- Types ----------
type Unit = 'KG' | 'L' | 'G' | 'ML';
type StepType = 'KNEADER' | 'MIXING';

type StepIngredient = {
  id: string;
  name: string;
  quantity: string;
  unit: Unit;
};

type RecipeStepDraft = {
  id: string;
  stepType: StepType;
  sequenceNumber: number | '';
  timerSeconds: number | '';
  pressure: number | '';
  temperature: number | '';
  rpm: number | '';
  ingredients: StepIngredient[];
};

type RecipeDraft = {
  recipeCode: string;
  name: string;
  description: string;
  enableKneader: boolean;
  enableMixing: boolean;
  steps: RecipeStepDraft[];
};

// ---------- Utils ----------
const uid = () => Math.random().toString(36).slice(2, 9);

const emptyDraft: RecipeDraft = {
  recipeCode: '',
  name: '',
  description: '',
  enableKneader: true,
  enableMixing: true,
  steps: [],
};

function validateDraft(d: RecipeDraft) {
  const errs: string[] = [];
  if (!d.recipeCode.trim()) errs.push('Recipe code is required.');
  if (!d.enableKneader && !d.enableMixing)
    errs.push('At least one module (Kneader/Mixing) must be enabled.');

  const relevant = d.steps.filter(
    (s) =>
      (s.stepType === 'KNEADER' && d.enableKneader) ||
      (s.stepType === 'MIXING' && d.enableMixing)
  );

  if (relevant.length === 0) errs.push('Add at least one step before saving.');

  for (const s of relevant) {
    if (s.sequenceNumber === '' || Number.isNaN(Number(s.sequenceNumber))) {
      errs.push(`Step "${s.stepType}" is missing a valid sequence number.`);
    }
    if (s.timerSeconds === '' || Number(s.timerSeconds) <= 0) {
      errs.push(`Step "${s.stepType}" must have timer > 0s.`);
    }
    if (!s.ingredients.length) {
      errs.push(
        `Step "${s.stepType}" (seq ${
          s.sequenceNumber || '—'
        }) has no ingredients.`
      );
    } else {
      for (const ing of s.ingredients) {
        if (!ing.name.trim()) errs.push('Each ingredient needs a code/name.');
        if (!ing.quantity || Number(ing.quantity) <= 0) {
          errs.push(
            `Ingredient "${ing.name || '(unnamed)'}" needs a quantity > 0.`
          );
        }
      }
    }
  }
  return errs;
}

// ---------- Page ----------
export default function RecipeAddPage() {
  const [stepIndex, setStepIndex] = useState<0 | 1 | 2 | 3>(0);
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft);
  const { mutateAsync: createRecipe, isPending } = useCreateRecipe();

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recipeDraft');
      if (raw) setDraft(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist draft to localStorage
  useEffect(() => {
    localStorage.setItem('recipeDraft', JSON.stringify(draft));
  }, [draft]);

  const kneaderSteps = useMemo(
    () => draft.steps.filter((s) => s.stepType === 'KNEADER'),
    [draft.steps]
  );
  const mixingSteps = useMemo(
    () => draft.steps.filter((s) => s.stepType === 'MIXING'),
    [draft.steps]
  );

  // ----- Step CRUD -----
  const addStep = (stepType: StepType) => {
    setDraft(
      (prev): RecipeDraft => ({
        ...prev,
        steps: [
          ...prev.steps,
          {
            id: uid(),
            stepType,
            sequenceNumber: '',
            timerSeconds: '',
            pressure: '',
            temperature: '',
            rpm: '',
            ingredients: [{ id: uid(), name: '', quantity: '', unit: 'KG' }],
          },
        ],
      })
    );
  };

  const updateStep = (id: string, patch: Partial<RecipeStepDraft>) => {
    setDraft(
      (prev): RecipeDraft => ({
        ...prev,
        steps: prev.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      })
    );
  };

  const removeStep = (id: string) => {
    setDraft(
      (prev): RecipeDraft => ({
        ...prev,
        steps: prev.steps.filter((s) => s.id !== id),
      })
    );
  };

  // ----- Ingredient CRUD -----
  const addIngredient = (stepId: string) => {
    setDraft(
      (prev): RecipeDraft => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === stepId
            ? {
                ...s,
                ingredients: [
                  ...s.ingredients,
                  { id: uid(), name: '', quantity: '', unit: 'KG' },
                ],
              }
            : s
        ),
      })
    );
  };

  const updateIngredient = (
    stepId: string,
    ingId: string,
    patch: Partial<StepIngredient>
  ) => {
    setDraft(
      (prev): RecipeDraft => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === stepId
            ? {
                ...s,
                ingredients: s.ingredients.map((i) =>
                  i.id === ingId ? { ...i, ...patch } : i
                ),
              }
            : s
        ),
      })
    );
  };

  const removeIngredient = (stepId: string, ingId: string) => {
    setDraft(
      (prev): RecipeDraft => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === stepId
            ? { ...s, ingredients: s.ingredients.filter((i) => i.id !== ingId) }
            : s
        ),
      })
    );
  };

  // ----- Navigation -----
  const goNext = () => {
    if (stepIndex === 0 && !draft.recipeCode.trim()) {
      toast({
        title: 'Missing recipe code',
        description: 'Enter a unique recipe code.',
        variant: 'destructive',
      });
      return;
    }

    if (stepIndex === 1 && !draft.enableKneader && !draft.enableMixing) {
      toast({
        title: 'Select modules',
        description: 'Enable Kneader and/or Mixing to proceed.',
        variant: 'destructive',
      });
      return;
    }

    setStepIndex((prev) => Math.min(3, prev + 1) as 0 | 1 | 2 | 3);
  };

  const goBack = () => {
    setStepIndex((prev) => Math.max(0, prev - 1) as 0 | 1 | 2 | 3);
  };

  // ----- Save to backend -----
  const onSave = async () => {
    const errors = validateDraft(draft);
    if (errors.length) {
      toast({
        title: 'Please fix the following',
        description: errors.join('\n'),
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      recipeCode: draft.recipeCode.trim(),
      name: draft.name?.trim() || null,
      description: draft.description?.trim() || null,
      steps: draft.steps
        .filter(
          (s) =>
            (s.stepType === 'KNEADER' && draft.enableKneader) ||
            (s.stepType === 'MIXING' && draft.enableMixing)
        )
        .map((s) => ({
          stepType: s.stepType,
          sequenceNumber: Number(s.sequenceNumber),
          timerSeconds: Number(s.timerSeconds),
          pressure: Number(s.pressure),
          temperature: Number(s.temperature),
          rpm: Number(s.rpm),
          ingredients: s.ingredients.map((i) => ({
            // backend expects ingredientCode here per our earlier agreement
            ingredientCode: i.name.trim(),
            quantity: Number(i.quantity),
            unit: i.unit,
          })),
        })),
    };

    try {
      await createRecipe(payload);
      toast({
        title: 'Recipe Created',
        description: `Recipe ${draft.recipeCode} saved successfully.`,
      });
      setDraft(emptyDraft);
      localStorage.removeItem('recipeDraft');
      setStepIndex(0);
    } catch (err: unknown) {
      const error = err as any;
      toast({
        title: 'Error Creating Recipe',
        description: error?.response?.data?.message || 'Failed to save recipe.',
        variant: 'destructive',
      });
    }
  };

  // ---------- UI ----------
  return (
    <PageContainer>
      <Header
        title="Create Recipe"
        description="Build and configure production recipes"
        icon="📝"
      />

      <div className="mt-8">
        {/* Stepper */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <StepDot
              active={stepIndex === 0}
              done={stepIndex > 0}
              label="Basics"
            />
            <Dash />
            <StepDot
              active={stepIndex === 1}
              done={stepIndex > 1}
              label="Modules"
            />
            <Dash />
            <StepDot
              active={stepIndex === 2}
              done={stepIndex > 2}
              label="Steps & Ingredients"
            />
            <Dash />
            <StepDot active={stepIndex === 3} done={false} label="Review" />
          </div>
        </Card>

        {/* Step 0: Basic Info */}
        {stepIndex === 0 && (
          <Card className="p-6 space-y-4">
            <div>
              <Label>Recipe Code</Label>
              <Input
                placeholder="e.g., SR01"
                value={draft.recipeCode}
                onChange={(e) =>
                  setDraft({ ...draft, recipeCode: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Recipe Name (optional)</Label>
              <Input
                placeholder="e.g., Steering Rack Compound"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                placeholder="Short description"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <FooterNav
              onBack={null}
              onNext={goNext}
              nextLabel="Next: Modules"
            />
          </Card>
        )}

        {/* Step 1: Modules */}
        {stepIndex === 1 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={draft.enableKneader}
                onCheckedChange={(c) =>
                  setDraft({ ...draft, enableKneader: !!c })
                }
              />
              <Label>Enable Kneader steps for this recipe</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={draft.enableMixing}
                onCheckedChange={(c) =>
                  setDraft({ ...draft, enableMixing: !!c })
                }
              />
              <Label>Enable Mixing steps for this recipe</Label>
            </div>
            <FooterNav
              onBack={goBack}
              onNext={goNext}
              nextLabel="Next: Steps"
            />
          </Card>
        )}

        {/* Step 2: Steps & Ingredients */}
        {stepIndex === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Kneader Steps</h3>
                <Button
                  size="sm"
                  onClick={() => addStep('KNEADER')}
                  disabled={!draft.enableKneader}
                >
                  Add Kneader Step
                </Button>
              </div>
              {!draft.enableKneader && (
                <p className="text-sm text-gray-500">
                  Kneader module disabled for this recipe.
                </p>
              )}
              <StepList
                steps={kneaderSteps as any}
                onChange={updateStep as any}
                onRemove={removeStep as any}
                onAddIngredient={addIngredient as any}
                onChangeIngredient={updateIngredient as any}
                onRemoveIngredient={removeIngredient as any}
                disabled={!draft.enableKneader}
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Mixing Steps</h3>
                <Button
                  size="sm"
                  onClick={() => addStep('MIXING')}
                  disabled={!draft.enableMixing}
                >
                  Add Mixing Step
                </Button>
              </div>
              {!draft.enableMixing && (
                <p className="text-sm text-gray-500">
                  Mixing module disabled for this recipe.
                </p>
              )}
              <StepList
                steps={mixingSteps as any}
                onChange={updateStep as any}
                onRemove={removeStep as any}
                onAddIngredient={addIngredient as any}
                onChangeIngredient={updateIngredient as any}
                onRemoveIngredient={removeIngredient as any}
                disabled={!draft.enableMixing}
              />
            </Card>

            <FooterNav onBack={goBack} onNext={goNext} nextLabel="Review" />
          </div>
        )}

        {/* Step 3: Review */}
        {stepIndex === 3 && (
          <Card className="p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-lg">Summary</h3>
              <Separator className="my-3" />
              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow label="Recipe Code" value={draft.recipeCode || '—'} />
                <InfoRow label="Name" value={draft.name || '—'} />
                <InfoRow
                  label="Kneader Enabled"
                  value={draft.enableKneader ? 'Yes' : 'No'}
                />
                <InfoRow
                  label="Mixing Enabled"
                  value={draft.enableMixing ? 'Yes' : 'No'}
                />
                <div className="md:col-span-2">
                  <InfoRow
                    label="Description"
                    value={draft.description || '—'}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold">Steps</h4>
              <Separator className="my-2" />
              {(['KNEADER', 'MIXING'] as StepType[]).map((t) => {
                const list = draft.steps.filter((s) => s.stepType === t);
                if (!list.length)
                  return (
                    <p key={t} className="text-sm text-gray-500 mb-3">
                      {t} — no steps
                    </p>
                  );
                return (
                  <div key={t} className="mb-4">
                    <div className="text-sm font-medium mb-1">{t}</div>
                    <div className="space-y-3">
                      {list
                        .slice()
                        .sort(
                          (a, b) =>
                            Number(a.sequenceNumber) - Number(b.sequenceNumber)
                        )
                        .map((s) => (
                          <Card key={s.id} className="p-3">
                            <div className="text-sm">
                              <div className="flex flex-wrap gap-4">
                                <span>
                                  <b>Seq:</b> {s.sequenceNumber || '—'}
                                </span>
                                <span>
                                  <b>Timer:</b> {s.timerSeconds || '—'}s
                                </span>
                                <span>
                                  <b>Pressure:</b> {s.pressure || '—'} bar
                                </span>
                                <span>
                                  <b>Temp:</b> {s.temperature || '—'} °C
                                </span>
                                <span>
                                  <b>RPM:</b> {s.rpm || '—'}
                                </span>
                                <span>
                                  <b>Ingredients:</b> {s.ingredients.length}
                                </span>
                              </div>
                              <ul className="list-disc ml-6 mt-2">
                                {s.ingredients.map((i) => (
                                  <li key={i.id}>
                                    {i.name || '—'} — {i.quantity || '0'}{' '}
                                    {i.unit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(emptyDraft);
                    localStorage.removeItem('recipeDraft');
                    setStepIndex(0);
                  }}
                >
                  Reset
                </Button>
                <Button
                  onClick={onSave}
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPending ? 'Saving...' : 'Save Recipe'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

// ---------- Small Components ----------
function StepDot({
  active,
  done,
  label,
}: Readonly<{
  active: boolean;
  done: boolean;
  label: string;
}>) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          'h-3 w-3 rounded-full',
          done ? 'bg-green-500' : active ? 'bg-blue-600' : 'bg-gray-300',
        ].join(' ')}
      />
      <span className={active ? 'text-blue-700 font-medium' : 'text-gray-600'}>
        {label}
      </span>
    </div>
  );
}

function Dash() {
  return <div className="flex-1 h-px bg-gray-200" />;
}

function FooterNav({
  onBack,
  onNext,
  nextLabel = 'Next',
}: Readonly<{
  onBack: null | (() => void);
  onNext: () => void;
  nextLabel?: string;
}>) {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onBack ?? (() => undefined)}
        disabled={!onBack}
      >
        Back
      </Button>

      <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
        {nextLabel}
      </Button>
    </div>
  );
}

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
