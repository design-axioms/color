export type AxiomaticErrorCode =
  | "MATH_NONFINITE"
  | "CONFIG_INVALID_VIBE"
  | "CONFIG_DUPLICATE_SURFACE_SLUG"
  | "CONFIG_CIRCULAR_KEY_COLOR"
  | "CONFIG_INVALID_STATE_PARENT"
  | "CONFIG_INVALID_ANCHOR_ORDER"
  | "CONFIG_INVALID_CONTRAST_OFFSET"
  | "CONFIG_EMPTY_SURFACE_GROUP"
  | "CONFIG_UNKNOWN_PROPERTY"
  | "SOLVER_MISSING_BACKGROUNDS"
  | "COLOR_PARSE_FAILED"
  | "THEME_INVALID_CSS_VAR"
  | "DTCG_INVALID"
  | "DOM_ELEMENT_NOT_FOUND"
  | "INSPECTOR_INVALID_NUMBER"
  | "INSPECTOR_MISSING_COMPUTED_STYLE"
  | "INSPECTOR_DOM_NOT_READY"
  | "GENERATOR_REGEX_MATCH_FAILED"
  | "GENERATOR_INVALID_CSS_VAR_NAME";

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
