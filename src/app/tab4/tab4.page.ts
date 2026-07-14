import { Component, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput, IonList, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput, IonList]
})
export class Tab4Page {
  trabajosFinales: any[] = [];
  nuevaDescripcion: string = '';
  nuevoValor: number | null = null;
  totalLiquidacion: number = 0;

  private router = inject(Router);

  ionViewWillEnter() {
    // Recuperamos los aprobados en la Tab 3
    const base = JSON.parse(localStorage.getItem('servicios_base_tab3') || '[]');
    this.trabajosFinales = [...base];
    this.calcularTotal();
  }

  agregarTrabajoExtra() {
    if (!this.nuevaDescripcion || !this.nuevoValor) return;
    this.trabajosFinales.push({
      descripcion: this.nuevaDescripcion.trim(),
      valor: Number(this.nuevoValor)
    });
    this.nuevaDescripcion = '';
    this.nuevoValor = null;
    this.calcularTotal();
  }

  eliminarTrabajo(index: number) {
    this.trabajosFinales.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalLiquidacion = this.trabajosFinales.reduce((acc, curr) => acc + curr.valor, 0);
  }

  enviarAFacturacionTab5() {
    localStorage.setItem('trabajos_liquidados_tab4', JSON.stringify(this.trabajosFinales));
    localStorage.setItem('total_final_tab4', String(this.totalLiquidacion));
    this.router.navigateByUrl('/tabs/tab5');
  }
}