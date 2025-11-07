import { AppDataSource } from "../data-source";
import { Message } from "../entities/message.entity";
import { Session } from "../entities/session.entity";
import {
  CreateMessageDto,
  UpdateMessageDto,
  MessageResponse,
  CreateSessionDto,
  SessionResponse,
  GetSessionMessagesDto,
} from "../dtos/chat.dto";
import LanggraphService, { LanggraphState } from "./langgraph.service";
import { SenderType } from "../enums/role.enum";

export class ChatService {
  constructor(private langgraphService: LanggraphService) {}
  private messageRepository = AppDataSource.getRepository(Message);
  private sessionRepository = AppDataSource.getRepository(Session);

  /**
   * Session CRUD Operations
   */

  /**
   * Create a new session
   */
  async createSession(): Promise<SessionResponse> {
    const session = this.sessionRepository.create({});

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

  public async handleChat(input: string): Promise<MessageResponse> {
    const state: LanggraphState = {
      userId: "",
      messages: [input],
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
    const response: MessageResponse = {
      id: "",
      sessionId: "",
      senderId: "",
      content: graphResult.response,
      senderType: SenderType.BOT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return response;
  }
}
