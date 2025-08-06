// src/components/BudgetManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Budget, Expense, BudgetService } from '@/services/budgetService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BudgetManagementProps {
  projectId: string;
}

export const BudgetManagement: React.FC<BudgetManagementProps> = ({ projectId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ['budgets', projectId],
    queryFn: () => BudgetService.getBudgetsForProject(projectId),
  });

  const createBudgetMutation = useMutation({
    mutationFn: (newBudget: Omit<Budget, 'id'>) => BudgetService.createBudget(newBudget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', projectId] });
      setNewBudgetCategory('');
      setNewBudgetAmount('');
      toast({ title: 'Budget category added' });
    },
    onError: () => {
      toast({ title: 'Failed to add budget category', variant: 'destructive' });
    },
  });

  const handleAddBudget = () => {
    if (newBudgetCategory.trim() && newBudgetAmount) {
      createBudgetMutation.mutate({
        project_id: projectId,
        category: newBudgetCategory.trim(),
        amount: parseFloat(newBudgetAmount),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgeting and Cost Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New budget category"
            value={newBudgetCategory}
            onChange={(e) => setNewBudgetCategory(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={newBudgetAmount}
            onChange={(e) => setNewBudgetAmount(e.target.value)}
          />
          <Button onClick={handleAddBudget} disabled={createBudgetMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>
        {budgetsLoading ? (
          <p>Loading budgets...</p>
        ) : (
          <div className="space-y-2">
            {budgets.map((budget) => (
              <div key={budget.id} className="flex items-center justify-between p-2 border rounded-lg">
                <span>{budget.category}</span>
                <span>${budget.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};