import { supabase } from '../lib/supabase';
import { Budget, Expense } from '../types/project';

// ===== Budget Functions =====

/**
 * Fetches all budgets for a given project.
 * @param projectId The ID of the project.
 * @returns A promise that resolves to an array of budgets.
 */
export const getBudgets = async (projectId: string): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
  return data || [];
};

/**
 * Adds a new budget to the database.
 * @param budget The budget object to add.
 * @returns A promise that resolves to the newly created budget.
 */
export const addBudget = async (budget: Omit<Budget, 'id' | 'created_at'>): Promise<Budget> => {
  const { data, error } = await supabase
    .from('budgets')
    .insert([budget])
    .select();

  if (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
  if (data) {
    return data[0];
  }
  throw new Error("Failed to add budget");
};

/**
 * Updates an existing budget.
 * @param id The ID of the budget to update.
 * @param updates The partial budget object with fields to update.
 * @returns A promise that resolves to the updated budget.
 */
export const updateBudget = async (id: string, updates: Partial<Budget>): Promise<Budget> => {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
  if (data) {
    return data[0];
  }
  throw new Error("Failed to update budget");
};

/**
 * Deletes a budget from the database.
 * @param id The ID of the budget to delete.
 */
export const deleteBudget = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};


// ===== Expense Functions =====

/**
 * Fetches all expenses for a given project.
 * @param projectId The ID of the project.
 * @returns A promise that resolves to an array of expenses.
 */
export const getExpenses = async (projectId: string): Promise<Expense[]> => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('project_id', projectId);
  
    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
    return data || [];
  };
  
/**
 * Adds a new expense to the database.
 * @param expense The expense object to add.
 * @returns A promise that resolves to the newly created expense.
 */
export const addExpense = async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select();
  
    if (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
    if (data) {
        return data[0];
    }
    throw new Error("Failed to add expense");
  };
  
/**
 * Updates an existing expense.
 * @param id The ID of the expense to update.
 * @param updates The partial expense object with fields to update.
 * @returns A promise that resolves to the updated expense.
 */
export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select();
  
    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
    if (data) {
        return data[0];
    }
    throw new Error("Failed to update expense");
  };
  
/**
 * Deletes an expense from the database.
 * @param id The ID of the expense to delete.
 */
export const deleteExpense = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };
