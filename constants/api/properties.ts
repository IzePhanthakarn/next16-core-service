const PROPERTIES_BASE_PATH = "/properties";

const PROPERTIES_API = {
    ROOT: PROPERTIES_BASE_PATH,
    DETAIL: (id: string) => `${PROPERTIES_BASE_PATH}/${id}`,
    BY_CODE: (code: string) => `${PROPERTIES_BASE_PATH}/code/${code}`,
    OPTIONS_ROOT: `${PROPERTIES_BASE_PATH}/options`,
    OPTION: (optionId: string) => `${PROPERTIES_BASE_PATH}/options/${optionId}`,
    OPTION_STATUS: (optionId: string) => `${PROPERTIES_BASE_PATH}/options/${optionId}/status`,
} as const;

export default PROPERTIES_API;