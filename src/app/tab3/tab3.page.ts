import { Component, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonCheckbox, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonCheckbox, IonList]
})
export class Tab3Page {
  placa: string = '';
  kilometraje: number = 0;
  serviciosSugeridos: any[] = [];
  resultado: string = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private URL_API = 'http://127.0.0.1:8000/api';

  ionViewWillEnter() {
    this.placa = localStorage.getItem('moto_placa') || '';
    this.kilometraje = Number(localStorage.getItem('moto_kilometraje') || '0');
    if (this.kilometraje > 0) {
      this.cargarEvaluacion();
    }
  }

  cargarEvaluacion() {
    this.http.get<any>(`${this.URL_API}/motos/evaluar-mantenimiento/?kilometraje=${this.kilometraje}`).subscribe({
      next: (res) => {
        // Mapeamos agregando una propiedad 'seleccionado' para control en el template
        this.serviciosSugeridos = res.data.map((s: any) => ({ ...s, seleccionado: true }));
      }
    });
  }

  pasarAlDetalleTab4() {
    const elegidos = this.serviciosSugeridos.filter(s => s.seleccionado);
    localStorage.setItem('servicios_base_tab3', JSON.stringify(elegidos));
    this.router.navigateByUrl('/tabs/tab4');
  }
}