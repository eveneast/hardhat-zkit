import {
  CircomValueType,
  ParserErrorItem,
  ParserRuleContext,
  TemplateDefinitionContext,
} from "@distributedlab/circom-parser";

export enum ErrorType {
  SignalDimensionResolution,
  TemplateAlreadyVisited,
  InvalidPragmaVersion,
  FailedToResolveMainComponentParameter,
  InternalExpressionHelperError,
  MissingTemplateParameterValue,
  InvalidIdentifierDimensionValue,
  FailedToResolveIdentifier,
  FailedToResolveIdentifierValue,
  VarArraysNotSupported,
  VarTupleLikeDeclarationNotSupported,
  FailedToResolveIfCondition,
  InvalidConditionReturnedValue,
  InvalidLeftAssignment,
  ComplexAccessNotSupported,
  AssigneeNotDeclared,
  QUOOperationNotSupported,
  ReachedUnknownOperation,
  InvalidIncDecOperation,
}

export type InputData = {
  type: string;
  dimension: number[];
};

export type IdentifierObject = {
  name: string;
  arrayAccess?: number[];
};

export type CircuitResolutionError = {
  type: ErrorType;
  fileIdentifier: string;
  context: ParserRuleContext;
  message?: string;
  templateIdentifier?: string;
  linkedParserErrors?: ParserErrorItem[];
};

export type MainComponent = {
  templateName: string;
  publicInputs: string[];
  parameters: CircomValueType[];
  parsedInputs?: Record<string, InputData>;
};

export type PragmaComponent = { isCustom: boolean; compilerVersion: string };

export type Template = {
  parameters: string[];
  isCustom: boolean;
  parallel: boolean;
  context: TemplateDefinitionContext;
};

export type Templates = {
  [key: string]: Template;
};

export type CircomFileData = {
  pragmaInfo: PragmaComponent;
  includes: string[];
  templates: Templates;
  mainComponentInfo?: MainComponent;
};

export interface Token {
  tokenIndex: number;
  line: number;
  column: number;
  channel: number;
  text: string;
  type: number;
  start: number;
  stop: number;
}

export interface SimpleParserRuleContext {
  start: Token;

  getText(): string;
}
