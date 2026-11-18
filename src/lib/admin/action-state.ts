// `saved` carries the translated confirmation, so forms need no text of their own. `notice` is a
// neutral message that neither saves nor refuses, such as "we've emailed you a code".
export type ActionState = { error?: string; saved?: string; notice?: string };
