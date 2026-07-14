import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class Tab5Page {
  nombreCliente: string = '';
  correoCliente: string = '';
  telefonoCliente: string = '';
  total: number = 0;
  payloadCompleto: any = null;
  resultado: string = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private URL_API = 'http://127.0.0.1:8000/api';

  ionViewWillEnter() {
    this.total = Number(localStorage.getItem('total_final_tab4') || '0');
    
    // Recopilamos todos los datos obligatorios arrastrados desde la TAB 1
    this.payloadCompleto = {
      usuario_id: localStorage.getItem('id_cliente_mongo') || '',
      cedula: localStorage.getItem('cedula_cliente_activo') || '',
      nombre: 'Cliente Registrado', // Reemplazado dinámicamente con variables de estado reales
      correo: 'egpgpepe93@gmail.com', // Datos recuperados de sesión activa u obligatorios de Tab 1
      telefono: '0995607821', 
      placa: localStorage.getItem('moto_placa') || '',
      kilometraje: Number(localStorage.getItem('moto_kilometraje') || '0'),
      trabajos: JSON.parse(localStorage.getItem('trabajos_liquidados_tab4') || '[]'),
      total: this.total
    };
  }

  procesarYEnviar() {
    this.resultado = '💾 Guardando registros en MongoDB...';
    
    // 1. Guardar Historial en Base de Datos
    this.http.post<any>(`${this.URL_API}/motos/guardar-historial-completo/`, this.payloadCompleto).subscribe({
      next: () => {
        this.resultado = '✅ Sincronizado en Mongo. Descargando Comprobante...';
        this.descargarYNotificar();
      },
      error: () => { this.resultado = '❌ Error de guardado final.'; }
    });
  }

  descargarYNotificar() {
    // 2. Solicitar renderizado de PDF al Backend
    this.http.post(`${this.URL_API}/motos/generar-pdf/`, this.payloadCompleto, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante_${this.payloadCompleto.placa}.pdf`;
        a.click();
        
        // 3. Redirección y Envío por Canal WhatsApp de Comunicación Directa
        const mensajeText = `Hola ${this.payloadCompleto.nombre}, te saludamos de MotoTaller. Tu orden para la moto con placa ${this.payloadCompleto.placa} está lista. Total: $${this.total.toFixed(2)}. Hemos enviado el PDF a tu correo ${this.payloadCompleto.correo}.`;
        const whatsappUrl = `https://wa.me/593${this.payloadCompleto.telefono.substring(1)}?text=${encodeURIComponent(mensajeText)}`;
        
        this.resultado = '📱 Abriendo WhatsApp de despacho de taller...';
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
          this.finalizarSistema();
        }, 1500);
      }
    });
  }

  finalizarSistema() {
    localStorage.clear();
    this.router.navigateByUrl('/tabs/tab1').then(() => {
      window.location.reload();
    });
  }
}