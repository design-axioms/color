export {};

declare global {
  interface CSSScopeRule extends CSSGroupingRule {
    start: string | null;
    end: string | null;
  }

  interface CSSLayerBlockRule extends CSSGroupingRule {
    name: string;
  }

  interface CSSContainerRule extends CSSGroupingRule {
    containerName: string;
    containerQuery: string;
  }

  // Ensure these are available on window/global if needed for instanceof checks
  var CSSScopeRule: {
    prototype: CSSScopeRule;
    new (): CSSScopeRule;
  };

  var CSSLayerBlockRule: {
    prototype: CSSLayerBlockRule;
    new (): CSSLayerBlockRule;
  };

  var CSSContainerRule: {
    prototype: CSSContainerRule;
    new (): CSSContainerRule;
  };
}
