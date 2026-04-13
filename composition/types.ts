export type Item = {
  id: number;
  label: string;
  selected?: boolean;
  [key: string]: any;
};

export type InputChangeEvent = Omit<KeyboardEvent, "target"> & { target: HTMLInputElement };
