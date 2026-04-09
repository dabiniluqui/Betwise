// ============================================================
// main.ts — Bootstrap de la aplicación Angular 17
// Usa el nuevo sistema standalone (sin NgModules)
// ============================================================

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }         from './app/app.component';
import { appConfig }            from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
