import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
  IonInput, IonButton, IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
    IonInput, IonButton, IonLabel
  ]
})
export class Tab1Page {
  cedulaBusqueda: string = '';
  resultado: string = '';

  cedula: string = '';
  nombre: string = '';
  correo: string = '';
  telefono: string = '';
  direccion: string = '';
  ciudad: string = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private URL_API = 'http://127.0.0.1:8000/api';

  buscarClientePorCedula() {
    if (!this.cedulaBusqueda) {
      this.resultado = '⚠️ Por favor, digite un número de cédula para consultar.';
      return;
    }

    this.resultado = '🔍 Buscando cliente en MongoDB...';

    this.http.get<any>(`${this.URL_API}/usuarios/buscar/${this.cedulaBusqueda.trim()}`).subscribe({
      next: (res) => {
        console.log("📦 Respuesta relacional del Backend:", res);

        if (res.status === 'success' && res.data && res.data.cliente) {
          const cliente = res.data.cliente;
          const motos = res.data.motos || [];

          localStorage.setItem('cedula_cliente_activo', cliente.cedula);
          localStorage.setItem('id_cliente_mongo', cliente._id); 
          localStorage.setItem('motos_historial_cliente', JSON.stringify(motos));

          this.resultado = `✅ Cliente [${cliente.nombre}] cargado con ${motos.length} moto(s).`;

          setTimeout(() => {
            this.resultado = '';
            this.router.navigateByUrl('/tabs/tab2');
          }, 1200);

        } else {
          this.resultado = '❌ El cliente no se encuentra registrado en el sistema.';
        }
      },
      error: (err) => {
        this.resultado = '❌ Error: No hay respuesta del servidor FastAPI. Verifique CORS o Uvicorn.';
        console.error(err);
      }
    });
  }

  guardarCliente() {
    if (!this.cedula || !this.nombre || !this.correo) {
      this.resultado = '⚠️ Complete los campos obligatorios: Cédula, Nombre Completo y Correo.';
      return;
    }

    this.resultado = '⏳ Registrando datos en la base de datos...';

    const payloadCliente = {
      cedula: String(this.cedula).trim(),
      nombre: this.nombre.trim(),
      correo: this.correo.trim(),
      telefono: this.telefono ? String(this.telefono).trim() : "",
      direccion: this.direccion ? this.direccion.trim() : "",
      ciudad: this.ciudad ? this.ciudad.trim() : ""
    };

    this.http.post<any>(`${this.URL_API}/usuarios/`, payloadCliente).subscribe({
      next: (res) => {
        console.log("📥 Respuesta de creación del Servidor:", res);

        if (res.data) {
          const idClienteMongo = res.data.id || res.data._id;

          if (!idClienteMongo) {
            this.resultado = '❌ Error de sincronización: El servidor no devolvió un ID de MongoDB.';
            return;
          }

          localStorage.setItem('cedula_cliente_activo', payloadCliente.cedula);
          localStorage.setItem('id_cliente_mongo', idClienteMongo);
          localStorage.setItem('motos_historial_cliente', JSON.stringify([])); 

          this.resultado = `✅ ${res.mensaje || 'Cliente procesado correctamente.'}`;

          this.cedula = ''; this.nombre = ''; this.correo = '';
          this.telefono = ''; this.direccion = ''; this.ciudad = '';

          setTimeout(() => {
            this.resultado = '';
            this.router.navigateByUrl('/tabs/tab2');
          }, 1200);

        } else {
          this.resultado = `❌ Error en el registro: ${res.mensaje || 'Respuesta inválida'}`;
        }
      },
      error: (err) => {
        this.resultado = '❌ Error de red o fallo de validación de campos (Pydantic) en FastAPI.';
        console.error("Detalle técnico del error:", err);
      }
    });
  }
}