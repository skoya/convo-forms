export const MARKETER_SESSION_COOKIE = "convo_forms_marketer_session";
export const MARKETER_SESSION_VALUE = "demo-authenticated";

export function isMarketerAuthenticated(cookieValue: string | undefined) {
  return cookieValue === MARKETER_SESSION_VALUE;
}
