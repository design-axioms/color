export type CheckAnalyzeResult<Report> =
  | {
      ok: true;
      report: Report;
    }
  | {
      ok: false;
      reason: string;
      details: unknown;
      report: Report;
    };

export type CheckScenarioContext<Session> = {
  session: Session;
};

export type CheckAnalyzerOptions = Record<string, never>;

export type ScenarioOptionsBuilder<CliOptions, RunConfig, ScenarioOptions> =
  (args: { cliOptions: CliOptions; runConfig: RunConfig }) => ScenarioOptions;

export type AnalyzeOptionsBuilder<CliOptions, RunConfig, AnalyzeOptions> =
  (args: { cliOptions: CliOptions; runConfig: RunConfig }) => AnalyzeOptions;

export type CheckPrinter<Report> = (result: CheckAnalyzeResult<Report>) => void;

export type CheckModule<
  Session,
  ScenarioOptions,
  CliOptions,
  RunConfig,
  AnalyzeOptions,
  Report,
> = {
  readonly name: string;

  /**
   * Optional helper to derive scenario options from CLI options.
   * Keeps `run.ts` generic and avoids check-name branching.
   */
  readonly scenarioOptions: ScenarioOptionsBuilder<
    CliOptions,
    RunConfig,
    ScenarioOptions
  >;

  /**
   * Derive analyzer options from CLI options.
   * Keeps `run.ts` generic and avoids per-check glue.
   */
  readonly analyzeOptions: AnalyzeOptionsBuilder<
    CliOptions,
    RunConfig,
    AnalyzeOptions
  >;

  /**
   * Print a human-readable report for the analysis result.
   * This should be the only place that prints check-specific output.
   */
  readonly print: (result: CheckAnalyzeResult<Report>) => void;

  /**
   * Runs browser-side measurement and records into the session's ObservationLog.
   * This should not do analysis; analysis should be replayable from the log.
   */
  readonly scenario: (
    ctx: CheckScenarioContext<Session>,
    options: ScenarioOptions,
  ) => Promise<void>;

  /**
   * Pure Node analysis over a saved ObservationLog.
   * Should print the same output format as live runs so CI diffs are meaningful.
   */
  readonly analyze: (
    log: unknown,
    options: AnalyzeOptions,
  ) => CheckAnalyzeResult<Report>;
};

/**
 * A type-erased check module for registry/runner boundaries.
 *
 * Check implementations remain strongly typed; the stable runner consumes
 * checks through this erased shape to avoid `any` at the orchestration layer.
 */
export type ErasedCheckModule<Session, CliOptions, RunConfig> = {
  readonly name: string;

  readonly executeScenario: (
    ctx: CheckScenarioContext<Session>,
    cliOptions: CliOptions,
    runConfig: RunConfig,
  ) => Promise<void>;

  readonly executeAnalysis: (
    log: unknown,
    cliOptions: CliOptions,
    runConfig: RunConfig,
  ) => { ok: boolean };
};

export function eraseCheck<
  Session,
  ScenarioOptions,
  CliOptions,
  RunConfig,
  AnalyzeOptions,
  Report,
>(
  check: CheckModule<
    Session,
    ScenarioOptions,
    CliOptions,
    RunConfig,
    AnalyzeOptions,
    Report
  >,
): ErasedCheckModule<Session, CliOptions, RunConfig> {
  return {
    name: check.name,
    executeScenario: async (ctx, cliOptions, runConfig) => {
      const opts = check.scenarioOptions({ cliOptions, runConfig });
      await check.scenario(ctx, opts);
    },
    executeAnalysis: (log, cliOptions, runConfig) => {
      const opts = check.analyzeOptions({ cliOptions, runConfig });
      const result = check.analyze(log, opts);
      check.print(result);
      return { ok: result.ok };
    },
  };
}
