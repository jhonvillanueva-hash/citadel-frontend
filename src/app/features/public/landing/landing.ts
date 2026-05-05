import { Component } from '@angular/core';
import { HeroLanding } from '../../../shared/layouts/hero-landing/hero-landing';
import { InfoLanding } from '../../../shared/layouts/info-landing/info-landing';
import { FooterLanding } from '../../../shared/layouts/footer-landing/footer-landing';
import { WhatsappButtonComponent } from "../../../shared/components/whatsapp-button/whatsapp-button";
import { FabStackComponent } from "../../../shared/layouts/fab-stack/fab-stack";
import { AiButtonComponent } from "../../../shared/components/ai-button/ai-button";
import { AiChatWidgetComponent } from "../../../shared/layouts/ai-chat-widget/ai-chat-widget";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  imports: [HeroLanding, InfoLanding, FooterLanding, WhatsappButtonComponent, FabStackComponent, AiButtonComponent, AiChatWidgetComponent]
})

export class Landing {
  aiOpen = false;

  toggleAi() {
    this.aiOpen = !this.aiOpen;
  }

  closeAi() {
    this.aiOpen = false;
  }
}
