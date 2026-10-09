import type { TranslationKey } from '../../i18n';
import type { RuleBookSection } from '.';

// Each section's words (spec §9.4): the lead line, then paragraphs before and after its picture,
// examples or Try it.
export interface SectionTexts {
  lead: TranslationKey;
  before: TranslationKey[];
  after: TranslationKey[];
}

export const sectionTexts: Record<RuleBookSection, SectionTexts> = {
  goal: { lead: 'book.goal.lead', before: ['book.goal.text', 'book.goal.win'], after: [] },
  tableCard: { lead: 'book.tableCard.lead', before: ['book.tableCard.text', 'book.tableCard.kinds'], after: ['book.tableCard.deck'] },
  turn: { lead: 'book.turn.lead', before: ['book.turn.text', 'book.turn.why', 'book.turn.order'], after: [] },
  liar: { lead: 'book.liar.lead', before: ['book.liar.text', 'book.liar.examples'], after: ['book.liar.first'] },
  revolver: { lead: 'book.revolver.lead', before: ['book.revolver.text'], after: ['book.revolver.cylinder', 'book.revolver.press'] },
  forced: { lead: 'book.forced.lead', before: ['book.forced.text'], after: [] },
  ghosts: { lead: 'book.ghosts.lead', before: ['book.ghosts.text'], after: [] },
  whisper: { lead: 'book.whisper.lead', before: ['book.whisper.text', 'book.whisper.must', 'book.whisper.truth', 'book.whisper.examples'], after: ['book.whisper.read'] },
  double: { lead: 'book.double.lead', before: ['book.double.text', 'book.double.shot'], after: [] },
  faces: { lead: 'book.faces.lead', before: ['book.faces.text', 'book.faces.wheel', 'book.faces.phone'], after: [] },
};
