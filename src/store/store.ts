import { configureStore } from "@reduxjs/toolkit";
import projectsReducer from "./slices/projectSlice";
import tasksReducer from "./slices/taskSlice";

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;