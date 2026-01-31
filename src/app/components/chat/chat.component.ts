import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface ChatListItem {
  _id: string;
  participants: {
    user?: { _id: string; name: string; profileImage?: string };
    barber?: { _id: string; name: string; shopName?: string };
  };
  lastMessage?: { content: string; createdAt: string };
  updatedAt: string;
}

interface Message {
  sender: string;
  senderType: 'user' | 'barber' | 'admin';
  content: string;
  messageType: string;
  read: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        <p class="text-gray-600 mb-6">Chat with your customers.</p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
          <div class="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-200">
              <h2 class="font-semibold text-gray-900">Conversations</h2>
            </div>
            <div *ngIf="loadingChats" class="p-4 text-sm text-gray-600">Loading...</div>
            <div *ngIf="!loadingChats && chats.length === 0" class="p-4 text-sm text-gray-500">No conversations yet.</div>
            <ul *ngIf="!loadingChats && chats.length > 0" class="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
              <li *ngFor="let chat of chats">
                <button
                  type="button"
                  (click)="selectChat(chat)"
                  class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  [ngClass]="{'bg-forest/10': selectedChat?._id === chat._id}"
                >
                  <p class="font-medium text-gray-900">{{ getCustomerName(chat) }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ chat.lastMessage?.content || 'No messages' }}</p>
                </button>
              </li>
            </ul>
          </div>

          <div class="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col min-h-[400px]">
            <div *ngIf="!selectedChat" class="flex-1 flex items-center justify-center text-gray-500 p-8">
              Select a conversation.
            </div>
            <ng-container *ngIf="selectedChat">
              <div class="p-4 border-b border-gray-200 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-forest/20 flex items-center justify-center text-forest font-semibold">
                  {{ getCustomerName(selectedChat).charAt(0) }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ getCustomerName(selectedChat) }}</p>
                </div>
              </div>
              <div class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                <div *ngIf="loadingMessages" class="text-sm text-gray-600">Loading messages...</div>
                <div *ngIf="!loadingMessages && messages.length === 0" class="text-sm text-gray-500">No messages yet. Say hello!</div>
                <div *ngFor="let msg of messages" [class.text-right]="msg.senderType === 'barber'" [class.text-left]="msg.senderType !== 'barber'">
                  <div
                    class="inline-block max-w-[80%] rounded-xl px-4 py-2"
                    [class.bg-forest]="msg.senderType === 'barber'"
                    [class.text-white]="msg.senderType === 'barber'"
                    [class.bg-gray-100]="msg.senderType !== 'barber'"
                    [class.text-gray-900]="msg.senderType !== 'barber'"
                  >
                    <p class="text-sm">{{ msg.content }}</p>
                    <p class="text-xs opacity-70 mt-1">{{ msg.createdAt | date:'shortTime' }}</p>
                  </div>
                </div>
              </div>
              <div class="p-4 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="inputMessage"
                  (keydown.enter)="sendMessage()"
                  placeholder="Type a message..."
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                />
                <button
                  type="button"
                  (click)="sendMessage()"
                  [disabled]="!inputMessage.trim() || sending"
                  class="px-5 py-3 bg-forest text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ sending ? '...' : 'Send' }}
                </button>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatComponent implements OnInit {
  chats: ChatListItem[] = [];
  selectedChat: ChatListItem | null = null;
  messages: Message[] = [];
  inputMessage = '';
  loadingChats = true;
  loadingMessages = false;
  sending = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats(): void {
    this.loadingChats = true;
    this.apiService.get('/chat/user/chats').subscribe({
      next: (res: any) => {
        this.chats = res?.data?.chats ?? [];
        this.loadingChats = false;
      },
      error: () => {
        this.loadingChats = false;
        this.chats = [];
      },
    });
  }

  getCustomerName(chat: ChatListItem): string {
    return chat.participants?.user?.name ?? 'Customer';
  }

  selectChat(chat: ChatListItem): void {
    this.selectedChat = chat;
    this.loadMessages(chat._id);
  }

  loadMessages(chatId: string): void {
    this.loadingMessages = true;
    this.apiService.get('/chat/' + chatId + '/messages').subscribe({
      next: (res: any) => {
        this.messages = res?.data?.chat?.messages ?? [];
        this.loadingMessages = false;
      },
      error: () => {
        this.messages = [];
        this.loadingMessages = false;
      },
    });
  }

  sendMessage(): void {
    const content = this.inputMessage.trim();
    if (!content || !this.selectedChat?._id || this.sending) return;
    this.sending = true;
    this.apiService.post('/chat/message', { chatId: this.selectedChat._id, content }).subscribe({
      next: (res: any) => {
        const msg = res?.data?.message;
        if (msg) {
          this.messages = [...this.messages, { ...msg, senderType: 'barber', createdAt: msg.createdAt || new Date().toISOString() }];
        }
        this.inputMessage = '';
        this.sending = false;
        this.loadChats();
      },
      error: () => {
        this.sending = false;
      },
    });
  }
}
