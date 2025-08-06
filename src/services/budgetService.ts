// src/services/budgetService.ts
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';

export type Budget = Database['public']['Tables']['budgets']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];

export class BudgetService {
  static async getBudgetsForProject(projectId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  }

  static async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getExpensesForProject(projectId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data || [];
  }

  static async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}