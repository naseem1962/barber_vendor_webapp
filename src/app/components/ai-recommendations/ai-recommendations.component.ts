import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">AI Recommendations</h1>
        <p class="text-gray-600">Get AI-powered hairstyle recommendations for your customers</p>
      </div>
    </div>
  `,
  styles: []
})
export class AiRecommendationsComponent {}
