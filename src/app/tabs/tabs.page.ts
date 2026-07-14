import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, speedometerOutline, buildOutline, cashOutline, receiptOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet], // 🎯 IMPORTANTE: Incluir IonRouterOutlet aquí también
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({
      'person-add-outline': personAddOutline,
      'speedometer-outline': speedometerOutline,
      'build-outline': buildOutline,
      'cash-outline': cashOutline,
      'receipt-outline': receiptOutline
    });
  }
}
