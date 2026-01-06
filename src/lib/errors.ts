export type AxiomaticErrorCode =
  | "MATH_NONFINITE"
  | "CONFIG_INVALID_VIBE"
  | "CONFIG_DUPLICATE_SURFACE_SLUG"
  | "CONFIG_CIRCULAR_KEY_COLOR"
  | "CONFIG_INVALID_STATE_PARENT"
  | "SOLVER_MISSING_BACKGROUNDS"
  | "COLOR_PARSE_FAILED"
  | "THEME_INVALID_CSS_VAR"
  | "DTCG_INVALID"
  | "DOM_ELEMENT_NOT_FOUND"
  | "INSPECTOR_INVALID_NUMBER";

export class AxiomaticError extends Error {
  readonly code: AxiomaticErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: AxiomaticErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AxiomaticError";
    this.code = code;
    this.details = details;
  }
}
