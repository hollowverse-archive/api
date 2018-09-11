import { ColorPalette } from './entities/ColorPalette';
import { EditorialSummary } from './entities/EditorialSummary';
import { EditorialSummaryNode } from './entities/EditorialSummaryNode';
import { EventLabel } from './entities/EventLabel';
import { NotablePerson } from './entities/NotablePerson';
import { NotablePersonEvent } from './entities/NotablePersonEvent';
import { NotablePersonEventComment } from './entities/NotablePersonEventComment';
import { NotablePersonLabel } from './entities/NotablePersonLabel';
import { Photo } from './entities/Photo';
import { User } from './entities/User';

export const entities = [
  NotablePerson,
  NotablePersonEvent,
  NotablePersonLabel,
  NotablePersonEventComment,
  EventLabel,
  User,
  EditorialSummary,
  EditorialSummaryNode,
  Photo,
  ColorPalette,
];
