// Overview of the calculation rules. Mirrors docs for issue #24.
// Keep this file in sync with TransparencyPanel and readFormAndCalc.

export const calculationRules = {
  baseDuration:
    "Regeldauer minus automatische (Schulabschluss) und manuelle Verkürzungen, nie unter Mindestdauer.",
  parttimeFactor:
    "Teilzeitstunden geteilt durch Vollzeitstunden, muss mindestens 50 % betragen.",
  theoreticalDuration:
    "Basisdauer geteilt durch Teilzeit-Faktor ergibt die theoretische neue Dauer.",
  protectiveRules:
    "Verlängerung auf maximal 6 Monate begrenzen und insgesamt höchstens 1,5 × Regeldauer.",
  rounding:
    "Endergebnis entsprechend der gewählten Rundung in Monate und Jahre/Monate umrechnen.",
};

export default calculationRules;
