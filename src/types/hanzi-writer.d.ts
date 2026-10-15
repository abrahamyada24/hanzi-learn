declare module 'hanzi-writer' {
  export interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    strokeColor?: string;
    outlineColor?: string;
    drawingColor?: string;
    drawingWidth?: number;
    showHintAfterMisses?: number | false;
    highlightOnComplete?: boolean;
    highlightColor?: string;
    showCharacter?: boolean;
    charDataLoader?: (char: string, onComplete: (data: any) => void, onError: (err: any) => void) => void;
    onLoadCharDataSuccess?: (data: any) => void;
    onLoadCharDataError?: (err: any) => void;
    renderer?: 'svg' | 'canvas';
  }

  export interface QuizSummary {
    character: string;
    totalMistakes: number;
    strokeNum: number;
    mistakesOnStroke: number;
  }

  export interface HanziWriterQuizOptions {
    onMistake?: (strokeData: any) => void;
    onCorrectStroke?: (strokeData: any) => void;
    onComplete?: (summary: QuizSummary) => void;
    showOutline?: boolean;
    showHintAfterMisses?: number | false;
    highlightOnComplete?: boolean;
  }

  export default class HanziWriter {
    static create(
      element: HTMLElement | string,
      character: string,
      options?: HanziWriterOptions
    ): HanziWriter;

    static loadCharacterData(
      character: string,
      options?: { charDataLoader?: any }
    ): Promise<any>;

    animateCharacter(options?: { onComplete?: () => void }): Promise<void>;
    animateStroke(strokeNum: number, options?: { onComplete?: () => void }): Promise<void>;
    loopCharacterAnimation(): void;
    pauseAnimation(): Promise<void>;
    resumeAnimation(): Promise<void>;
    showOutline(options?: { duration?: number }): Promise<void>;
    hideOutline(options?: { duration?: number }): Promise<void>;
    showCharacter(options?: { duration?: number }): Promise<void>;
    hideCharacter(options?: { duration?: number }): Promise<void>;
    setCharacter(character: string): Promise<void>;
    quiz(options?: HanziWriterQuizOptions): void;
    cancelQuiz(): void;
  }
}
