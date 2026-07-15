const SUBSCRIPTIONS_BASE_PATH = "/subscriptions";

const SUBSCRIPTIONS_API = {
    ROOT: SUBSCRIPTIONS_BASE_PATH,
    DETAIL: (subscriptionId: string) =>
        `${SUBSCRIPTIONS_BASE_PATH}/${subscriptionId}`,
    TOGGLE: (subscriptionId: string) =>
        `${SUBSCRIPTIONS_BASE_PATH}/${subscriptionId}/toggle`,
} as const;

export default SUBSCRIPTIONS_API;
