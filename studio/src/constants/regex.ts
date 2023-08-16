export const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
export const URL_REGEX = /^(http|https):\/\/[^ "]+$/;
export const NUMBER_REGEX = /^[0-9]+$/;
export const NAME_REGEX = /^[A-Za-z0-9_]+$/;
export const NOT_START_WITH_NUMBER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const ROUTE_NAME_REGEX = /^\/[a-zA-Z0-9_-]+(?:\/:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)*$/;
export const PARAM_REGEX = /:([^/?]+)/g;
export const PARAM_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
