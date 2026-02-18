import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Note {
    id: string;
    content: string;
    authorId: Principal;
    date: Time;
}
export interface UserProfile {
    displayName: string;
    name: string;
}
export type Time = bigint;
export interface DailyCheckInQuestion {
    id: string;
    question: string;
    authorId: Principal;
    date: Time;
}
export type MessageType = {
    __kind__: "text";
    text: null;
} | {
    __kind__: "emoji";
    emoji: string;
} | {
    __kind__: "gifUrl";
    gifUrl: string;
};
export interface Drawing {
    id: string;
    drawingData: string;
    authorId: Principal;
    timestamp: Time;
}
export interface Memory {
    id: string;
    authorId: Principal;
    timestamp: Time;
    caption: string;
    photo: ExternalBlob;
}
export interface DailyAnswer {
    user: Principal;
    answer: string;
    timestamp: Time;
    questionId: string;
}
export interface Message {
    id: string;
    content: string;
    messageType: MessageType;
    timestamp: Time;
    senderId: Principal;
}
export interface Reaction {
    userId: Principal;
    type: ReactionType;
    timestamp: Time;
}
export enum ReactionType {
    hug = "hug",
    heart = "heart",
    kiss = "kiss"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDailyQuestion(question: string, date: Time): Promise<string>;
    addReaction(reactionType: ReactionType): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllDrawings(): Promise<Array<Drawing>>;
    getAllMemories(): Promise<Array<Memory>>;
    getAllMessages(): Promise<Array<Message>>;
    getAllNotes(): Promise<Array<Note>>;
    getAllQuestions(): Promise<Array<DailyCheckInQuestion>>;
    getAnsweredDays(): Promise<Array<string>>;
    getAnswersForQuestion(questionId: string): Promise<{
        currentUserAnswer?: DailyAnswer;
        otherUserAnswer?: DailyAnswer;
    } | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPastQuestions(): Promise<Array<string>>;
    getQuestionById(questionId: string): Promise<DailyCheckInQuestion | null>;
    getReactionCounts(): Promise<{
        hugs: bigint;
        kisses: bigint;
        hearts: bigint;
    }>;
    getRecentReactions(): Promise<Array<Reaction>>;
    getTodaysQuestion(): Promise<DailyCheckInQuestion | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasSubmittedAnswer(questionId: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDrawing(drawingData: string): Promise<string>;
    saveMemory(photo: ExternalBlob, caption: string): Promise<string>;
    saveNote(content: string, date: Time): Promise<string>;
    sendMessage(content: string, messageType: MessageType): Promise<string>;
    submitDailyAnswer(answer: string, questionId: string): Promise<void>;
    updateDailyQuestion(questionId: string, question: string, date: Time): Promise<void>;
    updateNote(noteId: string, content: string): Promise<void>;
}
