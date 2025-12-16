import { AppDataSource } from "../data-source";
import { Message } from "../entities/message.entity";
import { Session } from "../entities/session.entity";
import {
  CreateMessageDto,
  UpdateMessageDto,
  MessageResponse,
  SessionResponse,
  GetSessionMessagesDto,
  CreateSessionDto,
} from "../dtos/chat.dto";
import LanggraphService, { LanggraphState } from "./langgraph.service";
import { LangchainService } from "./langchain.service";
import { SenderType } from "../enums/role.enum";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { PromptService } from "./prompt.service";
import { PromptType } from "../entities/ai-prompt.entity";

export class ChatService {
  constructor(
    private langgraphService: LanggraphService,
    private langchainService?: LangchainService,
    private promptService?: PromptService
  ) {}
  private messageRepository = AppDataSource.getRepository(Message);
  private sessionRepository = AppDataSource.getRepository(Session);

  /**
   * Session CRUD Operations
   */

  /**
   * Create a new session
   * @param userId User ID who owns this session
   */
  async createSession(
    createSessionDto: CreateSessionDto
  ): Promise<SessionResponse> {
    const session = this.sessionRepository.create({
      userId: createSessionDto.userId,
    });

    // Fetch latest system prompt and attach to session
    if (this.promptService) {
      const latestPrompt = await this.promptService.getLatestPrompt(
        PromptType.SYSTEM
      );
      if (latestPrompt) {
        session.promptId = latestPrompt.id;
      }
    }

    const savedSession = await this.sessionRepository.save(session);

    return this.formatSessionResponse(savedSession, 0);
  }

  /**
   * Get session by ID
   */
  async getSessionById(
    sessionId: string,
    includeMessages: boolean = false
  ): Promise<SessionResponse> {
    const relations = includeMessages ? ["messages"] : [];

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations,
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const messageCount = await this.messageRepository.countBy({
      sessionId,
    });

    return this.formatSessionResponse(session, messageCount, includeMessages);
  }

  /**
   * Get all sessions with pagination
   */
  async getAllSessions(
    limit: number = 10,
    offset: number = 0
  ): Promise<{
    sessions: SessionResponse[];
    total: number;
  }> {
    const [sessions, total] = await this.sessionRepository.findAndCount({
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const messageCount = await this.messageRepository.countBy({
          sessionId: session.id,
        });
        return this.formatSessionResponse(session, messageCount);
      })
    );

    return {
      sessions: sessionsWithCounts,
      total,
    };
  }

  /**
   * Delete session and all associated messages
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    // Delete all messages in the session first
    await this.messageRepository.delete({ sessionId });

    // Delete the session
    await this.sessionRepository.remove(session);
  }

  /**
   * Message CRUD Operations
   */

  /**
   * Create a new message
   */
  async createMessage(createDto: CreateMessageDto): Promise<MessageResponse> {
    // Verify session exists
    const session = await this.sessionRepository.findOne({
      where: { id: createDto.sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    // Validate message content
    if (!createDto.content || createDto.content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    const message = this.messageRepository.create({
      sessionId: createDto.sessionId,
      senderId: createDto.senderId,
      content: createDto.content,
      senderType: createDto.senderType,
      metadata: createDto.metadata,
    });

    const savedMessage = await this.messageRepository.save(message);

    return this.formatMessageResponse(savedMessage);
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string): Promise<MessageResponse> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ["session"],
    });

    if (!message) {
      throw new Error("Message not found");
    }

    return this.formatMessageResponse(message);
  }

  /**
   * Get all messages in a session with pagination
   */
  async getSessionMessages(
    sessionId: string,
    query: GetSessionMessagesDto = {}
  ): Promise<{
    messages: MessageResponse[];
    total: number;
  }> {
    // Verify session exists
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const limit = query.limit || 50;
    const offset = query.offset || 0;
    const orderDirection = query.orderBy === "desc" ? "DESC" : "ASC";

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { sessionId },
      order: { createdAt: orderDirection },
      take: limit,
      skip: offset,
    });

    return {
      messages: messages.map((msg) => this.formatMessageResponse(msg)),
      total,
    };
  }

  /**
   * Update message
   */
  async updateMessage(
    messageId: string,
    updateDto: UpdateMessageDto
  ): Promise<MessageResponse> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // Update fields
    if (updateDto.content !== undefined) {
      if (!updateDto.content || updateDto.content.trim().length === 0) {
        throw new Error("Message content cannot be empty");
      }
      message.content = updateDto.content;
    }

    if (updateDto.metadata !== undefined) {
      message.metadata = updateDto.metadata;
    }

    const updatedMessage = await this.messageRepository.save(message);

    return this.formatMessageResponse(updatedMessage);
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    await this.messageRepository.remove(message);
  }

  /**
   * Search messages in a session
   */
  async searchMessages(
    sessionId: string,
    searchTerm: string,
    limit: number = 50
  ): Promise<MessageResponse[]> {
    // Verify session exists
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const messages = await this.messageRepository
      .createQueryBuilder("message")
      .where("message.sessionId = :sessionId", { sessionId })
      .andWhere("message.content ILIKE :searchTerm", {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy("message.createdAt", "DESC")
      .take(limit)
      .getMany();

    return messages.map((msg) => this.formatMessageResponse(msg));
  }

  /**
   * Get messages from specific sender
   */
  async getMessagesBySender(
    sessionId: string,
    senderId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    messages: MessageResponse[];
    total: number;
  }> {
    // Verify session exists
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { sessionId, senderId },
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    return {
      messages: messages.map((msg) => this.formatMessageResponse(msg)),
      total,
    };
  }

  /**
   * Delete all messages in a session (but keep the session)
   */
  async clearSessionMessages(sessionId: string): Promise<void> {
    // Verify session exists
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    await this.messageRepository.delete({ sessionId });
  }

  /**
   * Formatting Helper Methods
   */

  /**
   * Format message response
   */
  private formatMessageResponse(message: Message): MessageResponse {
    return {
      id: message.id,
      sessionId: message.sessionId,
      senderId: message.senderId,
      content: message.content,
      senderType: message.senderType,
      metadata: message.metadata as Record<string, unknown> | undefined,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  /**
   * Format session response
   */
  private formatSessionResponse(
    session: Session,
    messageCount: number,
    includeMessages: boolean = false
  ): SessionResponse {
    const response: SessionResponse = {
      id: session.id,
      messageCount,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    if (includeMessages && session.messages && session.messages.length > 0) {
      response.messages = session.messages.map((msg) =>
        this.formatMessageResponse(msg)
      );
    }

    return response;
  }

  public async handleChat(
    createMessageDto: CreateMessageDto
  ): Promise<MessageResponse> {
    await this.createMessage(createMessageDto);
    const sessionMessages = await this.getSessionMessages(
      createMessageDto.sessionId
    );
    const baseMessages = sessionMessages.messages
      .map((m) => {
        if (m.senderType === SenderType.USER) {
          return new HumanMessage(m.content);
        }
        if (m.senderType === SenderType.BOT) {
          return new AIMessage(m.content);
        }
        return undefined;
      })
      .filter((msg): msg is HumanMessage | AIMessage => msg !== undefined);
    const state: LanggraphState = {
      userId: createMessageDto.senderId,
      messages: baseMessages,
      intent: "",
      response: "",
      extractedInfo: {},
      confidence: 0,
      reasoning: "",
      requiredFieldsMissing: [],
      optionalFieldsMissing: [],
      isValid: false,
      validationMessage: "",
    };
    const graphResult = await this.langgraphService.processMessage(state);
    console.log("Graph result:::", graphResult);

    const createdBotMessage: CreateMessageDto = {
      sessionId: createMessageDto.sessionId,
      senderId: `${createMessageDto.sessionId}-bot`,
      content: graphResult.response,
      senderType: SenderType.BOT,
    };
    const response = await this.createMessage(createdBotMessage);
    return response;
  }

  public async handleChatWithAgent(
    createMessageDto: CreateMessageDto
  ): Promise<MessageResponse> {
    // Validate langchainService is available
    if (!this.langchainService) {
      throw new Error("LangchainService is not available");
    }

    // Create message record from user input
    await this.createMessage(createMessageDto);

    const sessionMessages = await this.getSessionMessages(
      createMessageDto.sessionId
    );

    const baseMessages = sessionMessages.messages
      .map((m) => {
        if (m.senderType === SenderType.USER) {
          return new HumanMessage(m.content);
        }
        if (m.senderType === SenderType.BOT) {
          return new AIMessage(m.content);
        }
        return undefined;
      })
      .filter((msg): msg is HumanMessage | AIMessage => msg !== undefined);

    // 1. Fetch the prompt attached to the session
    let systemPrompt: string | undefined;
    let currentPromptRecord;

    // Reload session with prompt relation
    const sessionWithPrompt = await this.sessionRepository.findOne({
      where: { id: createMessageDto.sessionId },
      relations: ["prompt"],
    });

    if (sessionWithPrompt && sessionWithPrompt.prompt) {
      currentPromptRecord = sessionWithPrompt.prompt;
      systemPrompt = currentPromptRecord.promptText;
    }

    // Invoke agent with user message and userId for context
    const agentResult = await this.langchainService.generateAgentResponse(
      baseMessages,
      createMessageDto.senderId,
      systemPrompt
    );

    // Create a record for the agent response
    const createdBotMessage: CreateMessageDto = {
      sessionId: createMessageDto.sessionId,
      senderId: `${createMessageDto.sessionId}-agent`,
      content: agentResult.response,
      senderType: SenderType.BOT,
      metadata: {
        toolsUsed: agentResult.toolsUsed,
        type: "agent",
        promptVersion: currentPromptRecord ? currentPromptRecord.id : "default",
      },
    };

    // Save agent response to database
    const response = await this.createMessage(createdBotMessage);

    return response;
  }
}
