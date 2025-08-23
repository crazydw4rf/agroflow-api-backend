import type Merror from "@/utils/merror";

export type AnyProps<T> = { [P in keyof T]?: any };

export type Result<T, Q = Merror> = [T, Q];
