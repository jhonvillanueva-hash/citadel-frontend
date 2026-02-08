import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

import { internalNavs, InternalNav } from '../../../models/internal/internal-nav'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})

export class Header {

  internalNavs: InternalNav[] = internalNavs

  trackById(index: number, item: InternalNav) {
    return item.id
  }

}
