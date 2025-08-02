import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "@/types/project";
import { TaskService } from "@/services/taskService";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasksForProject = createAsyncThunk(
  "tasks/fetchTasksForProject",
  async (projectId: string) => {
    const response = await TaskService.getProjectTasks(projectId);
    return response;
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksForProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksForProject.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksForProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch tasks";
      });
  },
});

export default taskSlice.reducer;