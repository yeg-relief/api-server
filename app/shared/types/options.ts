export type QuestionOption = ( NumberOption | BooleanOption );

export type NumberOption = {
  value: number;
  display: string;
}

export type BooleanOption = {
  value: boolean;
  display: string;
}
