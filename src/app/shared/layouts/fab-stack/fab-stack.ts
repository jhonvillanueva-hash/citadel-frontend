import { Component } from '@angular/core';

@Component({
  selector: 'app-fab-stack',
  standalone: true,
  template: `
    <div class="
      fixed 
      bottom-4 right-4 
      sm:bottom-5 sm:right-5 
      z-[100]
      flex flex-col 
      items-end 
      gap-3
    ">
      <ng-content></ng-content>
    </div>
  `
})
export class FabStackComponent {}