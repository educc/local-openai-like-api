export function parseQuestionArg(argv: string[]): string {
  if (argv.length !== 1) {
    throw new Error('Usage: bun run src/index.ts "<terminal question>"');
  }

  const question = argv[0]?.trim();
  if (!question) {
    throw new Error("Question must not be empty.");
  }

  return question;
}
