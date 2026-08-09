/** Payload the delete sheet needs to preview and confirm a set. */
export interface DeletableSet {
  id: number;
  /** Stored kg. */
  weight: number;
  reps: number;
  warmUp: boolean;
  /** Standard-set display index; ignored when `warmUp` is true. */
  setIndex?: number;
}

export interface LoggedSetForDelete {
  id: number;
  weight: number;
  reps: number;
  warmUp: boolean;
}

/** Work Out and session detail share this mapping so delete previews stay in sync. */
export function toDeletableSet(
  set: LoggedSetForDelete,
  setIndex?: number,
): DeletableSet {
  if (set.warmUp) {
    return {
      id: set.id,
      weight: set.weight,
      reps: set.reps,
      warmUp: true,
    };
  }

  return {
    id: set.id,
    weight: set.weight,
    reps: set.reps,
    warmUp: false,
    setIndex,
  };
}
