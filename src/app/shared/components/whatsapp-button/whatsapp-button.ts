import { Component } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

@Component({
	selector: 'app-whatsapp-button',
	template: `
		<a
			href="https://wa.me/51937008362?text=Hola%20quiero%20más%20información%20sobre%20los%20vinos%20de%20Citadel."
			target="_blank"
			rel="noopener noreferrer"
			class="
				relative
				w-10 h-10 sm:w-12 sm:h-12
				bg-gradient-to-br from-emerald-300 via-green-500 via-50% to-green-900
				hover:from-green-400 hover:via-green-600 hover:to-green-900
				text-white
				rounded-full
				shadow-md hover:shadow-lg
				transition-all duration-300
				flex items-center justify-center
				hover:scale-105 active:scale-95
			"
		>
			<span class="absolute w-[115%] h-[115%] rounded-full bg-green-400/40 blur-sm animate-[ping_3s_ease-in-out_infinite] pointer-events-none"></span>

			<fa-icon 
				[icon]="icons.faWhatsapp" 
				class="text-lg sm:text-xl leading-none relative"
			/>
		</a>
  `,
	imports: [FontAwesomeModule],
	standalone: true
})
export class WhatsappButtonComponent {
	icons = {
		faWhatsapp
	}
}