const TODOS_BASE_PATH = "/todos";

const TODOS_API = {
    LISTS: TODOS_BASE_PATH,
    LIST: (listId: string) => `${TODOS_BASE_PATH}/${listId}`,
    MOVE_LIST_TO_TOP: (listId: string) => `${TODOS_BASE_PATH}/${listId}/move-to-top`,
    ITEMS: (listId: string) => `${TODOS_BASE_PATH}/${listId}/items`,
    REORDER_ITEMS: (listId: string) => `${TODOS_BASE_PATH}/${listId}/items/reorder`,
    ITEM: (itemId: string) => `${TODOS_BASE_PATH}/items/${itemId}`,
    TOGGLE_ITEM: (itemId: string) => `${TODOS_BASE_PATH}/items/${itemId}/toggle`,
} as const;

export default TODOS_API;
