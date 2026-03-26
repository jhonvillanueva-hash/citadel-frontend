import { Component, EventEmitter, Output } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-ai-button',
  template: `
    <button
      (click)="toggle.emit()"
      class="
        relative
        w-10 h-10 sm:w-12 sm:h-12
        bg-gradient-to-br from-sky-500 via-blue-700 to-blue-950
        hover:from-sky-600 hover:via-blue-800 hover:to-blue-950
        text-white
        rounded-full
        shadow-md hover:shadow-lg
        transition-all duration-300
        flex items-center justify-center
        hover:scale-105 active:scale-95
      "
    >
	    <span class="absolute	w-[115%] h-[115%]	rounded-full bg-sky-400/30 blur-sm animate-[ping_3s_ease-in-out_infinite]	pointer-events-none"></span>

			<fa-icon 
				[icon]="icons.faRobot" 
				class="text-lg sm:text-xl leading-none relative"
			/>
		</button>
	`,
  imports: [FontAwesomeModule],
  standalone: true
})
export class AiButtonComponent {
  icons = {
    faRobot
  };

  @Output() toggle = new EventEmitter<void>();
}