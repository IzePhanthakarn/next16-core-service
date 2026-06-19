export type TodoListSheetFormState = {
  title: string;
};

export type TodoListSheetProps = {
  onCreated?: () => void;
  trigger: React.ReactNode;
};

export const getDefaultTodoListSheetForm = (): TodoListSheetFormState => ({
  title: "",
});
