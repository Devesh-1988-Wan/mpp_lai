import React, { useState, useEffect } from 'react';
import { getBudgets, addBudget } from '../services/budgetService';
import { Budget } from '../types/project'; // Corrected import path

interface Props {
  projectId: string;
}

const BudgetManagement: React.FC<Props> = ({ projectId }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState<number>(0);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const budgets = await getBudgets(projectId);
        setBudgets(budgets);
      } catch (error) {
        console.error("Failed to fetch budgets", error);
      }
    };
    fetchBudgets();
  }, [projectId]);

  const handleAddBudget = async () => {
    if (newBudgetCategory && newBudgetAmount > 0) {
      try {
        const newBudget = await addBudget({
          project_id: projectId,
          category: newBudgetCategory,
          amount: newBudgetAmount,
        });
        setBudgets([...budgets, newBudget]);
        setNewBudgetCategory('');
        setNewBudgetAmount(0);
      } catch (error) {
        console.error("Failed to add budget", error);
      }
    }
  };

  return (
    <div>
      <h2>Budget Management</h2>
      <ul>
        {budgets.map(budget => (
          <li key={budget.id}>
            {budget.category}: ${budget.amount}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newBudgetCategory}
        onChange={(e) => setNewBudgetCategory(e.target.value)}
        placeholder="Category"
      />
      <input
        type="number"
        value={newBudgetAmount}
        onChange={(e) => setNewBudgetAmount(Number(e.target.value))}
        placeholder="Amount"
      />
      <button onClick={handleAddBudget}>Add Budget</button>
    </div>
  );
};

export default BudgetManagement;
