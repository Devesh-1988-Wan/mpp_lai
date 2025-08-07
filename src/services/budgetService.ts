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
    // Temporarily return empty array - these tables need to be added to types
    console.warn('Budget service temporarily disabled - tables not in types');
    return [];
  }

  static async createBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    // Temporarily disabled
    console.warn('Budget service temporarily disabled - tables not in types');
    throw new Error('Budget service temporarily disabled');
  }

  static async getExpensesForProject(projectId: string): Promise<Expense[]> {
    // Temporarily return empty array
    console.warn('Budget service temporarily disabled - tables not in types');
    return [];
  }

  static async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    // Temporarily disabled
    console.warn('Budget service temporarily disabled - tables not in types');
    throw new Error('Budget service temporarily disabled');
  }
}