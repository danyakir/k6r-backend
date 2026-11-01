const PLACEHOLDER_LENGTH = 12;
const MAX_DISPLAYED_CHARACTERS = 4;

const censorString = (value: string) =>
    value
        .slice(0, Math.min(MAX_DISPLAYED_CHARACTERS, value.length / 2))
        .padEnd(PLACEHOLDER_LENGTH, '*');

export const censor = (value: unknown) =>
    typeof value === 'string'
        ? censorString(value)
        : '*'.repeat(PLACEHOLDER_LENGTH);
