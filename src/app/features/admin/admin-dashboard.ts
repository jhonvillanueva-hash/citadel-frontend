import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faChevronDown, faRobot, faArrowRightFromBracket, faBarsStaggered, faBars, faShield, faShieldVirus, faChartLine, faWineBottle, faArrowLeft, faImage, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { SidebarItemComponent } from '../../shared/components/admin-sidebar/sidebar-item';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FontAwesomeModule, SidebarItemComponent],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  sidebarOpen = false;
  expandedMenu: string | null = null;

  icons = {
    faUser,
    faChevronDown,
    faRobot,
    faArrowRightFromBracket,
    faBarsStaggered,
    faBars,
    faShield,
    faShieldVirus,
    faChartLine,
    faWineBottle,
    faImage,
    faCommentDots
  };

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const triggerResize = () => window.dispatchEvent(new Event('resize'));
    triggerResize();
    setTimeout(triggerResize, 150);
    setTimeout(triggerResize, 310);
  }

  logout() {
    this.authService.logout();
  }
}
