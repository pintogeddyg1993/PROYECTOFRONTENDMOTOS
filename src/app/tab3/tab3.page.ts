import { Component, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
  IonButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonTextarea, IonList, IonCheckbox
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule, NgFor, NgIf, FormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
    IonButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent, IonTextarea, IonList, IonCheckbox
  ]
})
export class Tab3Page {
  private router = inject(Router);

  cedulaCliente: string = '';
  motoDatos: any = null;
  observacionesMecanicas: string = '';
  
  serviciosSugeridos: any[] = [];
  totalProforma: number = 0;

  ionViewWillEnter() {
    this.cedulaCliente = localStorage.getItem('cedula_cliente_activo') || '';
    const motosSesion = localStorage.getItem('motos_sesion');
    if (motosSesion) {
      const lista = JSON.parse(motosSesion);
      if (lista.length > 0) {
        this.motoDatos = lista[lista.length - 1];
        this.generarDiagnosticoPredictivo(this.motoDatos.kilometraje);
      }
    }
  }

  generarDiagnosticoPredictivo(km: number) {
    this.serviciosSugeridos = [];
    
    this.serviciosSugeridos.push({
      nombre: 'Cambio de Aceite de Motor de Alta Gama & Filtro',
      costo: 25.00,
      seleccionado: true,
      motivo: 'Recomendado por intervalo cíclico estándar.'
    });

    if (km >= 15000) {
      this.serviciosSugeridos.push({
        nombre: 'Cambio de Kit de Arrastre Completo (Cadena, Piñón y Catalina)',
        costo: 65.00,
        seleccionado: true,
        motivo: `Fatiga por kilometraje alto (${km} km).`
      });
    } else {
      this.serviciosSugeridos.push({
        nombre: 'Limpieza, Tensado y Lubricación extrema de Cadena',
        costo: 8.00,
        seleccionado: true,
        motivo: 'Mantenimiento preventivo regular.'
      });
    }

    if (km >= 10000) {
      this.serviciosSugeridos.push({
        nombre: 'Cambio de Líquido de Frenos (DOT 4) + Pastillas Delanteras',
        costo: 30.00,
        seleccionado: true,
        motivo: 'Desgaste proyectado en sistema hidráulico de frenado.'
      });
    }

    if (km >= 12000) {
      this.serviciosSugeridos.push({
        nombre: 'Purgado y Cambio de Líquido Refrigerante de Motor',
        costo: 18.00,
        seleccionado: true,
        motivo: 'Pérdida de propiedades de disipación térmica por uso.'
      });
    }

    if (km >= 8000) {
      this.serviciosSugeridos.push({
        nombre: 'Sustitución de Filtro de Aire y Bujía de Iridium',
        costo: 22.00,
        seleccionado: true,
        motivo: 'Optimización de la mezcla de combustión interna.'
      });
    }

    this.calcularTotal();
  }

  calcularTotal() {
    this.totalProforma = this.serviciosSugeridos
      .filter(s => s.seleccionado)
      .reduce((sum, item) => sum + item.costo, 0);
  }

  finalizarOrden() {
    alert(`¡Orden Procesada!\nTotal: $${this.totalProforma.toFixed(2)}\nObservaciones: ${this.observacionesMecanicas}`);
    localStorage.clear();
    this.router.navigateByUrl('/tabs/tab1');
  }
}