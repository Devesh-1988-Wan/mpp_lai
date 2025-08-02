// src/services/budgetService.ts
import { supabase } from '@/lib/supabase';

export interface Budget {
  id: string;
  project_id: string;
  category: string;
  amount: number;
}

export interface Expense {
  id: string;
  project_id: string;
  budget_id: string;
  description: string;
  amount: number;
  incurred_on: string;
}

export class BudgetService {
  static async getBudgetsForProject(projectId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  }

  static async createBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
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
    return data;
  }

  static async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}