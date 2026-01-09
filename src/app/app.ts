import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Landing } from "./pages/landing/landing";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Landing],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {

}
