export interface LoggedSetInput {
  id: number;
  weight: number;
  reps: number;
  warmUp: boolean;
}

export type LoggedSetRowModel =
  | {
      id: number;
      warmUp: true;
      weight: number;
      reps: number;
      showBottomBorder: boolean;
    }
  | {
      id: number;
      warmUp: false;
      setIndex: number;
      weight: number;
      reps: number;
      showBottomBorder: boolean;
    };

/**
 * Work Out and session detail share this model so set numbering, W vs
 * standard index, and last-row border stay in sync.
 */
export function buildLoggedSetRowModels(
  sets: readonly LoggedSetInput[],
): LoggedSetRowModel[] {
  const lastIndex = sets.length - 1;
  let standardSetIndex = 0;

  return sets.map((set, ordinal) => {
    const showBottomBorder = ordinal !== lastIndex;
    if (set.warmUp) {
      return {
        id: set.id,
        warmUp: true,
        weight: set.weight,
        reps: set.reps,
        showBottomBorder,
      };
    }

    standardSetIndex += 1;
    return {
      id: set.id,
      warmUp: false,
      setIndex: standardSetIndex,
      weight: set.weight,
      reps: set.reps,
      showBottomBorder,
    };
  });
}
