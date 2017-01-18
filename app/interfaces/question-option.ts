export interface IQuestionOption {
  display: string;
}

export interface INumberOption extends IQuestionOption {
  value: number;
}

export interface IBooleanOption extends IQuestionOption {
  value: boolean;
}
