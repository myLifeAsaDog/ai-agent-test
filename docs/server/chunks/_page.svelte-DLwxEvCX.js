import { p as push, q as ensure_array_like, l as pop, t as once, u as run, s as setContext, m as getContext, v as hasContext, h as is_array, f as get_prototype_of, o as object_prototype } from './index-DevouZ2U.js';
import { D as prepareAttachmentsForRequest, E as getMessageParts, F as updateToolCallResult, G as isAssistantMessageWithCompletedToolCalls, H as fillMessageParts, J as extractMaxToolInvocationStep, K as callChatApi, q as isAbortError, L as shouldResubmitMessages, g as generateId } from './index-rqoOq9bm.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';

const empty = [];
function snapshot(value, skip_warning = false) {
  return clone(value, /* @__PURE__ */ new Map(), "", empty);
}
function clone(value, cloned, path, paths, original = null) {
  if (typeof value === "object" && value !== null) {
    var unwrapped = cloned.get(value);
    if (unwrapped !== void 0) return unwrapped;
    if (value instanceof Map) return (
      /** @type {Snapshot<T>} */
      new Map(value)
    );
    if (value instanceof Set) return (
      /** @type {Snapshot<T>} */
      new Set(value)
    );
    if (is_array(value)) {
      var copy = (
        /** @type {Snapshot<any>} */
        Array(value.length)
      );
      cloned.set(value, copy);
      if (original !== null) {
        cloned.set(original, copy);
      }
      for (var i = 0; i < value.length; i += 1) {
        var element = value[i];
        if (i in value) {
          copy[i] = clone(element, cloned, path, paths);
        }
      }
      return copy;
    }
    if (get_prototype_of(value) === object_prototype) {
      copy = {};
      cloned.set(value, copy);
      if (original !== null) {
        cloned.set(original, copy);
      }
      for (var key in value) {
        copy[key] = clone(value[key], cloned, path, paths);
      }
      return copy;
    }
    if (value instanceof Date) {
      return (
        /** @type {Snapshot<T>} */
        structuredClone(value)
      );
    }
    if (typeof /** @type {T & { toJSON?: any } } */
    value.toJSON === "function") {
      return clone(
        /** @type {T & { toJSON(): any } } */
        value.toJSON(),
        cloned,
        path,
        paths,
        // Associate the instance with the toJSON clone
        value
      );
    }
  }
  if (value instanceof EventTarget) {
    return (
      /** @type {Snapshot<T>} */
      value
    );
  }
  try {
    return (
      /** @type {Snapshot<T>} */
      structuredClone(value)
    );
  } catch (e) {
    return (
      /** @type {Snapshot<T>} */
      value
    );
  }
}
const replacements = {
  translate: /* @__PURE__ */ new Map([
    [true, "yes"],
    [false, "no"]
  ])
};
function attr(name, value, is_boolean = false) {
  if (value == null || !value && is_boolean) return "";
  const normalized = name in replacements && replacements[name].get(value) || value;
  const assignment = is_boolean ? "" : `="${escape_html(normalized, true)}"`;
  return ` ${name}${assignment}`;
}
const SvelteMap = globalThis.Map;
function createContext(name) {
  const key = Symbol(name);
  return {
    hasContext: () => {
      try {
        return hasContext(key);
      } catch (e) {
        if (typeof e === "object" && e !== null && "message" in e && typeof e.message === "string" && e.message?.includes("lifecycle_outside_component")) {
          return false;
        }
        throw e;
      }
    },
    getContext: () => getContext(key),
    setContext: (value) => setContext(key, value)
  };
}
class KeyedStore extends SvelteMap {
  #itemConstructor;
  constructor(itemConstructor, value) {
    super(value);
    this.#itemConstructor = itemConstructor;
  }
  get(key) {
    const test = super.get(key) ?? // Untrack here because this is technically a state mutation, meaning
    // deriveds downstream would fail. Because this is idempotent (even
    // though it's not pure), it's safe.
    run(() => this.set(key, new this.#itemConstructor())).get(key);
    return test;
  }
}
class ChatStore {
  messages = [];
  data;
  status = "ready";
  error;
}
class KeyedChatStore extends KeyedStore {
  constructor(value) {
    super(ChatStore, value);
  }
}
const {
  hasContext: hasChatContext,
  getContext: getChatContext
} = createContext("Chat");
class Chat {
  #options = {};
  #api = once(() => this.#options.api ?? "/api/chat");
  #generateId = once(() => this.#options.generateId ?? generateId);
  #maxSteps = once(() => this.#options.maxSteps ?? 1);
  #streamProtocol = once(() => this.#options.streamProtocol ?? "data");
  #keyedStore;
  #id = once(() => this.#options.id ?? this.#generateId()());
  get id() {
    return this.#id();
  }
  #store = once(() => this.#keyedStore.get(this.id));
  #abortController;
  /**
   * Additional data added on the server via StreamData.
   *
   * This is writable, so you can use it to transform or clear the chat data.
   */
  get data() {
    return this.#store().data;
  }
  set data(value) {
    this.#store().data = value;
  }
  /**
   * Hook status:
   *
   * - `submitted`: The message has been sent to the API and we're awaiting the start of the response stream.
   * - `streaming`: The response is actively streaming in from the API, receiving chunks of data.
   * - `ready`: The full response has been received and processed; a new user message can be submitted.
   * - `error`: An error occurred during the API request, preventing successful completion.
   */
  get status() {
    return this.#store().status;
  }
  /** The error object of the API request */
  get error() {
    return this.#store().error;
  }
  /** The current value of the input. Writable, so it can be bound to form inputs. */
  input;
  /**
   * Current messages in the chat.
   *
   * This is writable, which is useful when you want to edit the messages on the client, and then
   * trigger {@link reload} to regenerate the AI response.
   */
  get messages() {
    return this.#store().messages;
  }
  set messages(value) {
    run(() => this.#store().messages = fillMessageParts(value));
  }
  constructor(options = {}) {
    if (hasChatContext()) {
      this.#keyedStore = getChatContext();
    } else {
      this.#keyedStore = new KeyedChatStore();
    }
    this.#options = options;
    this.messages = options.initialMessages ?? [];
    this.input = options.initialInput ?? "";
  }
  /**
   * Append a user message to the chat list. This triggers the API call to fetch
   * the assistant's response.
   * @param message The message to append
   * @param options Additional options to pass to the API call
   */
  append = async (message, {
    data,
    headers,
    body,
    experimental_attachments
  } = {}) => {
    const attachmentsForRequest = await prepareAttachmentsForRequest(experimental_attachments);
    const messages = this.messages.concat({
      ...message,
      id: message.id ?? this.#generateId()(),
      createdAt: message.createdAt ?? /* @__PURE__ */ new Date(),
      experimental_attachments: attachmentsForRequest.length > 0 ? attachmentsForRequest : void 0,
      parts: getMessageParts(message)
    });
    return this.#triggerRequest({ messages, headers, body, data });
  };
  /**
   * Reload the last AI chat response for the given chat history. If the last
   * message isn't from the assistant, it will request the API to generate a
   * new response.
   */
  reload = async ({ data, headers, body } = {}) => {
    if (this.messages.length === 0) {
      return;
    }
    const lastMessage = this.messages[this.messages.length - 1];
    await this.#triggerRequest({
      messages: lastMessage.role === "assistant" ? this.messages.slice(0, -1) : this.messages,
      headers,
      body,
      data
    });
  };
  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop = () => {
    try {
      this.#abortController?.abort();
    } catch {
    } finally {
      this.#store().status = "ready";
      this.#abortController = void 0;
    }
  };
  /** Form submission handler to automatically reset input and append a user message */
  handleSubmit = async (event, options = {}) => {
    event?.preventDefault?.();
    if (!this.input && !options.allowEmptySubmit) return;
    const attachmentsForRequest = await prepareAttachmentsForRequest(options.experimental_attachments);
    const messages = this.messages.concat({
      id: this.#generateId()(),
      createdAt: /* @__PURE__ */ new Date(),
      role: "user",
      content: this.input,
      experimental_attachments: attachmentsForRequest.length > 0 ? attachmentsForRequest : void 0,
      parts: [{ type: "text", text: this.input }]
    });
    const chatRequest = {
      messages,
      headers: options.headers,
      body: options.body,
      data: options.data
    };
    const request = this.#triggerRequest(chatRequest);
    this.input = "";
    await request;
  };
  addToolResult = async ({ toolCallId, result }) => {
    updateToolCallResult({
      messages: this.messages,
      toolCallId,
      toolResult: result
    });
    if (this.#store().status === "submitted" || this.#store().status === "streaming") {
      return;
    }
    const lastMessage = this.messages[this.messages.length - 1];
    if (isAssistantMessageWithCompletedToolCalls(lastMessage)) {
      await this.#triggerRequest({ messages: this.messages });
    }
  };
  #triggerRequest = async (chatRequest) => {
    this.#store().status = "submitted";
    this.#store().error = void 0;
    const messages = fillMessageParts(chatRequest.messages);
    const messageCount = messages.length;
    const maxStep = extractMaxToolInvocationStep(messages[messages.length - 1]?.toolInvocations);
    try {
      const abortController = new AbortController();
      this.#abortController = abortController;
      this.messages = messages;
      const constructedMessagesPayload = this.#options.sendExtraMessageFields ? messages : messages.map(({
        role,
        content,
        experimental_attachments,
        data,
        annotations,
        toolInvocations,
        parts
      }) => ({
        role,
        content,
        ...experimental_attachments !== void 0 && { experimental_attachments },
        ...data !== void 0 && { data },
        ...annotations !== void 0 && { annotations },
        ...toolInvocations !== void 0 && { toolInvocations },
        ...parts !== void 0 && { parts }
      }));
      const existingData = this.data ?? [];
      await callChatApi({
        api: this.#api(),
        body: {
          id: this.id,
          messages: constructedMessagesPayload,
          data: chatRequest.data,
          ...snapshot(this.#options.body),
          ...chatRequest.body
        },
        streamProtocol: this.#streamProtocol(),
        credentials: this.#options.credentials,
        headers: {
          ...this.#options.headers,
          ...chatRequest.headers
        },
        abortController: () => abortController,
        restoreMessagesOnFailure: () => {
        },
        onResponse: this.#options.onResponse,
        onUpdate: ({ message, data, replaceLastMessage }) => {
          this.#store().status = "streaming";
          this.messages = messages;
          if (replaceLastMessage) {
            this.messages[this.messages.length - 1] = message;
          } else {
            this.messages.push(message);
          }
          if (data?.length) {
            this.data = existingData;
            this.data.push(...data);
          }
        },
        onToolCall: this.#options.onToolCall,
        onFinish: this.#options.onFinish,
        generateId: this.#generateId(),
        fetch: this.#options.fetch,
        // callChatApi calls structuredClone on the message
        lastMessage: snapshot(this.messages[this.messages.length - 1])
      });
      this.#abortController = void 0;
      this.#store().status = "ready";
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      const coalescedError = error instanceof Error ? error : new Error(String(error));
      if (this.#options.onError) {
        this.#options.onError(coalescedError);
      }
      this.#store().status = "error";
      this.#store().error = coalescedError;
    }
    if (shouldResubmitMessages({
      originalMaxToolInvocationStep: maxStep,
      originalMessageCount: messageCount,
      maxSteps: this.#maxSteps(),
      messages: this.messages
    })) {
      await this.#triggerRequest({ messages: this.messages });
    }
  };
}
function _page($$payload, $$props) {
  push();
  const chat = new Chat();
  const each_array = ensure_array_like(chat.messages);
  $$payload.out += `<main><ul><!--[-->`;
  for (let messageIndex = 0, $$length = each_array.length; messageIndex < $$length; messageIndex++) {
    let message = each_array[messageIndex];
    const each_array_1 = ensure_array_like(message.parts);
    $$payload.out += `<li><div>${escape_html(message.role)}</div> <div><!--[-->`;
    for (let partIndex = 0, $$length2 = each_array_1.length; partIndex < $$length2; partIndex++) {
      let part = each_array_1[partIndex];
      if (part.type === "text") {
        $$payload.out += "<!--[-->";
        $$payload.out += `<div>${escape_html(part.text)}</div>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]--></div></li>`;
  }
  $$payload.out += `<!--]--></ul> <form><input${attr("value", chat.input)}> <button type="submit">Send</button></form></main>`;
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DLwxEvCX.js.map
