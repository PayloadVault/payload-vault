import { useState, useMemo } from "react";
import type {
  ExpenseRecord,
  ExpenseCategory,
} from "../../hooks/useExpenses/types";
import { expenseCategories } from "../../hooks/useExpenses/types";
import type { BudgetTarget } from "../../hooks/useAnalytics/types";
import { getCategoryExpenseTotals } from "../../hooks/useAnalytics/forecastUtils";
import { normalizeProfit } from "../../components/contentCard/ContentCard.utils";

type BudgetTargetsProps = {
  expenses: ExpenseRecord[];
  budgetTargets: BudgetTarget[];
  year: number;
  onUpsert: (category: ExpenseCategory, amount: number) => void;
  onRemove: (id: string) => void;
};

export const BudgetTargets = ({
  expenses,
  budgetTargets,
  year,
  onUpsert,
  onRemove,
}: BudgetTargetsProps) => {
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<ExpenseCategory>(
    expenseCategories[0],
  );
  const [newAmount, setNewAmount] = useState("");

  const categoryTotals = useMemo(
    () => getCategoryExpenseTotals(expenses),
    [expenses],
  );

  const budgetMap = useMemo(() => {
    const map = new Map<ExpenseCategory, BudgetTarget>();
    budgetTargets.forEach((t) => map.set(t.category, t));
    return map;
  }, [budgetTargets]);

  const categoriesWithBudgets = useMemo(() => {
    return budgetTargets
      .map((t) => ({
        category: t.category,
        budget: t.budget_amount,
        spent: categoryTotals.get(t.category) ?? 0,
        id: t.id,
      }))
      .sort((a, b) => {
        const aPct = a.budget > 0 ? a.spent / a.budget : 0;
        const bPct = b.budget > 0 ? b.spent / b.budget : 0;
        return bPct - aPct;
      });
  }, [budgetTargets, categoryTotals]);

  const unusedCategories = useMemo(() => {
    return expenseCategories.filter((c) => !budgetMap.has(c));
  }, [budgetMap]);

  const handleSave = (category: ExpenseCategory) => {
    const amount = parseFloat(editAmount);
    if (!isNaN(amount) && amount > 0) {
      onUpsert(category, amount);
      setEditingCategory(null);
      setEditAmount("");
    }
  };

  const handleAdd = () => {
    const amount = parseFloat(newAmount);
    if (!isNaN(amount) && amount > 0) {
      onUpsert(newCategory, amount);
      setShowAddForm(false);
      setNewAmount("");
    }
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "bg-color-error";
    if (pct >= 80) return "bg-amber-500";
    return "bg-color-primary";
  };

  const getProgressTextColor = (pct: number) => {
    if (pct >= 100) return "text-color-error-text";
    if (pct >= 80) return "text-amber-500";
    return "text-color-primary";
  };

  return (
    <div className="bg-color-bg-card border border-color-border-light rounded-radius-lg p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-color-text-main">
            Kategorie-Budgets
          </h4>
          <p className="text-xs text-color-text-subtle mt-0.5">
            Budgetziele pro Ausgabenkategorie für {year}
          </p>
        </div>
        {unusedCategories.length > 0 && !showAddForm && (
          <button
            type="button"
            onClick={() => {
              setNewCategory(unusedCategories[0]);
              setShowAddForm(true);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-radius-md bg-color-primary text-color-black
              hover:bg-color-primary/90 transition-all duration-200 active:scale-95"
          >
            + Budget hinzufügen
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-color-bg-main rounded-radius-md p-4 mb-4 border border-color-border-light animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={newCategory}
              onChange={(e) =>
                setNewCategory(e.target.value as ExpenseCategory)
              }
              className="flex-1 bg-color-bg-card border border-color-border-light rounded-radius-md px-3 py-2 text-sm
                text-color-text-main focus:outline-none focus:border-color-primary"
            >
              {unusedCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Budget (€)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-32 bg-color-bg-card border border-color-border-light rounded-radius-md px-3 py-2 text-sm
                  text-color-text-main focus:outline-none focus:border-color-primary"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="px-3 py-2 text-xs font-medium rounded-radius-md bg-color-primary text-color-black
                  hover:bg-color-primary/90 transition-all duration-200 active:scale-95"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 text-xs font-medium rounded-radius-md bg-color-bg-card border border-color-border-light
                  text-color-text-subtle hover:text-color-text-main transition-all duration-200"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget List */}
      {categoriesWithBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-color-text-subtle text-sm gap-2">
          <p>Noch keine Budgets definiert</p>
          <p className="text-xs">
            Klicke „+ Budget hinzufügen" um ein Kategorie-Budget zu setzen
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoriesWithBudgets.map((item) => {
            const pct =
              item.budget > 0
                ? Math.round((item.spent / item.budget) * 100)
                : 0;
            const remaining = item.budget - item.spent;
            const isEditing = editingCategory === item.category;

            return (
              <div key={item.category} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-color-text-main truncate">
                      {item.category}
                    </span>
                    <span
                      className={`text-xs font-semibold ${getProgressTextColor(pct)}`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(item.category);
                            if (e.key === "Escape") {
                              setEditingCategory(null);
                              setEditAmount("");
                            }
                          }}
                          className="w-24 bg-color-bg-card border border-color-border-light rounded-radius-sm px-2 py-1 text-xs
                            text-color-text-main focus:outline-none focus:border-color-primary"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSave(item.category)}
                          className="text-xs text-color-primary hover:text-color-primary/80 font-medium"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setEditAmount("");
                          }}
                          className="text-xs text-color-text-subtle hover:text-color-text-main"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(item.category);
                            setEditAmount(item.budget.toString());
                          }}
                          className="text-xs text-color-text-subtle hover:text-color-primary transition-colors"
                        >
                          Bearbeiten
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          className="text-xs text-color-text-subtle hover:text-color-error-text transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    )}
                    <span className="text-xs text-color-text-subtle whitespace-nowrap">
                      {normalizeProfit(item.spent)} /{" "}
                      {normalizeProfit(item.budget)} €
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-color-bg-main rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(pct)}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                {/* Status */}
                <div className="flex justify-between mt-1">
                  <span
                    className={`text-xs ${remaining >= 0 ? "text-color-text-subtle" : "text-color-error-text font-medium"}`}
                  >
                    {remaining >= 0
                      ? `${normalizeProfit(remaining)} € übrig`
                      : `${normalizeProfit(Math.abs(remaining))} € über Budget!`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
