import { Component } from '@angular/core';
import { PortfolioPage } from './features/portfolio/presentation/portfolio-page/portfolio-page';

@Component({
  imports: [PortfolioPage],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
