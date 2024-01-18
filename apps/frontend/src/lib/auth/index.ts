import useAuth from "./stores/useAuth";

export const getToken = () => useAuth.getState().getToken();
