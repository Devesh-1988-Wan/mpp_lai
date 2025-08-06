import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project, Task, CustomField } from "@/types/project";
import { ProjectService } from "@/services/projectService";
import { TaskService } from "@/services/taskService";
import { CustomFieldService } from "@/services/customFieldService";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const project = await ProjectService.getProject(projectId);
      const tasks = await TaskService.getProjectTasks(projectId);
      const customFields = await CustomFieldService.getProjectCustomFields(projectId);
      return { ...project, tasks, customFields };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setProjects, setCurrentProject, setLoading, setError } = projectSlice.actions;

export default projectSlice.reducer;