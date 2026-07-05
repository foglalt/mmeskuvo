export interface PublicGameAdvice {
  id: string;
  advice: string;
  brideChosenAt: string | null;
  groomChosenAt: string | null;
  guestName?: string;
}

export type GameAdviceChooser = "bride" | "groom";
