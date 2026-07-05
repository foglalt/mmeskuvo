export type GameLanguage = "hu" | "en" | "es";

export interface GameCopy {
  gameName: string;
  navLabel: string;
  navGuest: string;
  navCouple: string;
  languageLabel: string;
  guestTitle: string;
  guestIntro: string;
  guestNote: string;
  formKicker: string;
  formTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  adviceLabel: string;
  advicePlaceholder: string;
  submit: string;
  submitting: string;
  submitError: string;
  successKicker: string;
  successTitle: string;
  successText: string;
  submitAnother: string;
  coupleTitle: string;
  coupleIntro: string;
  listTitle: string;
  adviceSummary: (count: number, revealed: number) => string;
  refresh: string;
  loadingLabel: string;
  loadError: string;
  choiceError: string;
  retry: string;
  emptyTitle: string;
  emptyText: string;
  authorSecret: string;
  brideChoice: string;
  groomChoice: string;
  choose: string;
  chooserTitle: string;
  chooserText: string;
  brideLabel: string;
  groomLabel: string;
  cancel: string;
  saving: string;
}

const pluralize = (
  count: number,
  singular: string,
  plural: string
) => `${count} ${count === 1 ? singular : plural}`;

export const gameLanguageOptions: ReadonlyArray<{
  code: GameLanguage;
  label: string;
}> = [
  { code: "hu", label: "Magyar" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export const gameTranslations: Record<GameLanguage, GameCopy> = {
  hu: {
    gameName: "Jótanács játék",
    navLabel: "Játék oldalak",
    navGuest: "Vendégeknek",
    navCouple: "A párnak",
    languageLabel: "Nyelv",
    guestTitle: "Egy gondolat,\namit magukkal vihetnek.",
    guestIntro:
      "Írd le a legjobb tanácsodat Jimena és David közös életéhez. A pár először csak az üzenetedet látja — a nevedet majd a választás fedi fel.",
    guestNote: "Lehet bölcs, vicces vagy egészen személyes.",
    formKicker: "A te üzeneted",
    formTitle: "Mit tanácsolsz nekik?",
    nameLabel: "Neved",
    namePlaceholder: "Ahogy szeretnéd, hogy felismerjenek",
    adviceLabel: "Jótanácsod",
    advicePlaceholder: "A jó házasság titka szerintem...",
    submit: "Tanács elküldése",
    submitting: "Küldés...",
    submitError: "Nem sikerült elküldeni a tanácsot.",
    successKicker: "Megérkezett",
    successTitle: "Köszönjük!",
    successText:
      "A tanácsod már ott várja a párt a névtelen üzenetek között.",
    submitAnother: "Másik tanács küldése",
    coupleTitle: "Válasszatok egy gondolatot.",
    coupleIntro:
      "A tanácsok névtelenek. Válasszatok külön kedvencet Jimenának és Davidnak — a szerző neve a választás után jelenik meg.",
    listTitle: "Vendégeitek tanácsai",
    adviceSummary: (count, revealed) =>
      `${pluralize(count, "üzenet", "üzenet")} · ${pluralize(
        revealed,
        "név felfedve",
        "név felfedve"
      )}`,
    refresh: "Frissítés",
    loadingLabel: "Tanácsok betöltése",
    loadError: "Nem sikerült betölteni a tanácsokat.",
    choiceError: "Nem sikerült elmenteni a választást.",
    retry: "Újrapróbálás",
    emptyTitle: "Még nincs itt tanács.",
    emptyText:
      "Amint egy vendég elküldi az üzenetét, ezen a helyen megjelenik.",
    authorSecret: "A szerző még titok",
    brideChoice: "Jimena választása",
    groomChoice: "David választása",
    choose: "Ezt választom",
    chooserTitle: "Ki választja ezt a tanácsot?",
    chooserText:
      "Az új választás felváltja az adott személy korábbi kedvencét.",
    brideLabel: "Jimena · Menyasszony",
    groomLabel: "David · Vőlegény",
    cancel: "Mégse",
    saving: "Mentés...",
  },
  en: {
    gameName: "Advice game",
    navLabel: "Game pages",
    navGuest: "For guests",
    navCouple: "For the couple",
    languageLabel: "Language",
    guestTitle: "One thought\nthey can carry with them.",
    guestIntro:
      "Share your best advice for Jimena & David's life together. The couple will see only your message at first — choosing it will reveal your name.",
    guestNote: "It can be wise, funny, or deeply personal.",
    formKicker: "Your message",
    formTitle: "What would you tell them?",
    nameLabel: "Your name",
    namePlaceholder: "The name you would like them to recognize",
    adviceLabel: "Your advice",
    advicePlaceholder: "The secret to a happy marriage is...",
    submit: "Send your advice",
    submitting: "Sending...",
    submitError: "We couldn't send your advice.",
    successKicker: "Received",
    successTitle: "Thank you!",
    successText:
      "Your advice is now waiting for the couple among the anonymous messages.",
    submitAnother: "Send another piece of advice",
    coupleTitle: "Choose a thought.",
    coupleIntro:
      "The advice is anonymous. Choose one favorite for Jimena and one for David — the author's name appears after a choice is made.",
    listTitle: "Advice from your guests",
    adviceSummary: (count, revealed) =>
      `${pluralize(count, "message", "messages")} · ${pluralize(
        revealed,
        "name revealed",
        "names revealed"
      )}`,
    refresh: "Refresh",
    loadingLabel: "Loading advice",
    loadError: "We couldn't load the advice.",
    choiceError: "We couldn't save the choice.",
    retry: "Try again",
    emptyTitle: "No advice yet.",
    emptyText: "A guest's message will appear here as soon as they send it.",
    authorSecret: "The author is still a secret",
    brideChoice: "Jimena's choice",
    groomChoice: "David's choice",
    choose: "Choose this one",
    chooserTitle: "Who is choosing this advice?",
    chooserText:
      "The new choice will replace that person's previous favorite.",
    brideLabel: "Jimena · Bride",
    groomLabel: "David · Groom",
    cancel: "Cancel",
    saving: "Saving...",
  },
  es: {
    gameName: "Juego de consejos",
    navLabel: "Páginas del juego",
    navGuest: "Para invitados",
    navCouple: "Para la pareja",
    languageLabel: "Idioma",
    guestTitle: "Un consejo\nque llevarán siempre consigo.",
    guestIntro:
      "Escribe tu mejor consejo para la vida en común de Jimena y David. La pareja verá primero solo tu mensaje; tu nombre se revelará cuando lo elijan.",
    guestNote: "Puede ser sabio, divertido o muy personal.",
    formKicker: "Tu mensaje",
    formTitle: "¿Qué les aconsejas?",
    nameLabel: "Tu nombre",
    namePlaceholder: "El nombre con el que quieres que te reconozcan",
    adviceLabel: "Tu consejo",
    advicePlaceholder: "El secreto de un matrimonio feliz es...",
    submit: "Enviar el consejo",
    submitting: "Enviando...",
    submitError: "No pudimos enviar tu consejo.",
    successKicker: "Recibido",
    successTitle: "¡Gracias!",
    successText:
      "Tu consejo ya espera a la pareja entre los mensajes anónimos.",
    submitAnother: "Enviar otro consejo",
    coupleTitle: "Elijan un consejo.",
    coupleIntro:
      "Los consejos son anónimos. Elijan un favorito para Jimena y otro para David; el nombre de la persona aparecerá después de elegir.",
    listTitle: "Consejos de sus invitados",
    adviceSummary: (count, revealed) =>
      `${pluralize(count, "mensaje", "mensajes")} · ${pluralize(
        revealed,
        "nombre revelado",
        "nombres revelados"
      )}`,
    refresh: "Actualizar",
    loadingLabel: "Cargando consejos",
    loadError: "No pudimos cargar los consejos.",
    choiceError: "No pudimos guardar la elección.",
    retry: "Intentar de nuevo",
    emptyTitle: "Todavía no hay consejos.",
    emptyText:
      "El mensaje de un invitado aparecerá aquí en cuanto lo envíe.",
    authorSecret: "La persona sigue siendo un secreto",
    brideChoice: "Elección de Jimena",
    groomChoice: "Elección de David",
    choose: "Elegir este",
    chooserTitle: "¿Quién elige este consejo?",
    chooserText:
      "La nueva elección sustituirá el favorito anterior de esa persona.",
    brideLabel: "Jimena · Novia",
    groomLabel: "David · Novio",
    cancel: "Cancelar",
    saving: "Guardando...",
  },
};
