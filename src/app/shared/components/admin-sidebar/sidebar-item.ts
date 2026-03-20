import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface SidebarChild {
  label: string;
  route: string;
  title?: string;
}

@Component({
  selector: 'app-admin-sidebar-item',
  templateUrl: './sidebar-item.html',
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
  standalone: true
})
export class SidebarItemComponent {

  @Input() icon!: IconDefinition;
  @Input() label!: string;
  @Input() route?: string;
  @Input() title?: string;

  private _sidebarOpen = true;
  @Input() children: SidebarChild[] = [];

  @Input() expandedMenu!: string | null;
  @Output() expandedMenuChange = new EventEmitter<string | null>();

  @Input() menuKey!: string;

  @Output() linkClicked = new EventEmitter<void>();

  @Input() set sidebarOpen(value: boolean) {
    this._sidebarOpen = value;

    if (!value) {
      this.expandedMenuChange.emit(null);
    }
  }

  get sidebarOpen(): boolean {
    return this._sidebarOpen;
  }

  toggle() {
    if (!this.sidebarOpen) return;
    if (this.expandedMenu === this.menuKey) {
      this.expandedMenuChange.emit(null);
    } else {
      this.expandedMenuChange.emit(this.menuKey);
    }
  }

  onLinkClick() {
    this.expandedMenuChange.emit(null);
    this.linkClicked.emit();
  }

  icons = {
    faChevronDown,
  }

}