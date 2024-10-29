import { ANIMATION_DURATION } from "./settings";

export function delay(seconds: number): Promise<void> {
  return new Promise<void>((res) => {
    setTimeout(() => res(), seconds * 1000);
  });
}

export function animation(): Promise<void> {
  return delay(ANIMATION_DURATION);
}
