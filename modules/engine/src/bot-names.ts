// Bots' names (spec §6): the table shows them with a 🤖, in the player colours. Saloon nicknames,
// and never a card's name (no "Ace"). Names, so they aren't translated.
export const botNames = ['Dusty', 'Slim', 'Hank', 'Clem', 'Rusty', 'Lefty', 'Tex', 'Kit', 'Shorty', 'Mabel'] as const;

// The first bot name nobody at the table has; after that, a number makes one unique.
export const pickBotName = (taken: ReadonlySet<string>): string => {
  const free = botNames.find((name) => !taken.has(name));

  if (free) return free;

  let suffix = 2;

  while (taken.has(`${botNames[0]} ${suffix}`)) {
    suffix++;
  }

  return `${botNames[0]} ${suffix}`;
};
