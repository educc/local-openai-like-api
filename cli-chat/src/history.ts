// Conversation history management

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export class History {
  private messages: Message[] = [];

  setSystemPrompt(prompt: string): void {
    // Remove existing system prompt if any
    this.messages = this.messages.filter((m) => m.role !== "system");
    // Insert at beginning
    this.messages.unshift({ role: "system", content: prompt });
  }

  addMessage(role: "user" | "assistant", content: string): void {
    this.messages.push({ role, content });
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    // Preserve system prompt if set
    const systemPrompt = this.messages.find((m) => m.role === "system");
    this.messages = systemPrompt ? [systemPrompt] : [];
  }

  get length(): number {
    return this.messages.filter((m) => m.role !== "system").length;
  }
}
