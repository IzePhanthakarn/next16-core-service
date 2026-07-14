const TRANSACTIONS_BASE_PATH = "/transactions";

const TRANSACTIONS_API = {
    ROOT: TRANSACTIONS_BASE_PATH,
    DETAIL: (transactionId: string) =>
        `${TRANSACTIONS_BASE_PATH}/${transactionId}`,
} as const;

export default TRANSACTIONS_API;
