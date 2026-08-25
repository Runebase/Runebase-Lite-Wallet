/**
 * Shared dayjs instance (replaces moment, which is in maintenance mode).
 *
 * customParseFormat is required for parsing our own 'MM-DD-YYYY, HH:mm'
 * timestamps back into a date — moment did this natively.
 */
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export default dayjs;
