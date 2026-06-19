export type TodoListSheetFormState = {
  title: string;
  color: string;
};

export type TodoListSheetProps = {
  onCreated?: () => void;
  trigger: React.ReactNode;
};

export const getDefaultTodoListSheetForm = (): TodoListSheetFormState => ({
  title: "",
  color: "",
});
