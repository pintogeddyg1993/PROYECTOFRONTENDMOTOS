import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton]
})
export class Tab1Page {
  // Variable para el buscador
  cedulaBusqueda: string = '';

  // Variables del formulario de registro nuevo
  cedula: string = '';
  nombre: string = '';
  correo: string = '';
  telefono: string = '';
  direccion: string = '';
  ciudad: string = '';
  resultado: string = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private URL_API = 'http://127.0.0.1:8000/api/usuarios';

  // 🔍 FUNCIÓN NUEVA: BUSCAR Y SALTAR
  buscarClientePorCedula() {
    if (!this.cedulaBusqueda) {
      this.resultado = '⚠ Por favor, ingresa un número de cédula para buscar.';
      return;
    }

    this.resultado = '🔍 Buscando cliente en MongoDB...';

    // Llamamos a tu endpoint de FastAPI
    this.http.get<any>(`${this.URL_API}/cedula/${this.cedulaBusqueda}`).subscribe({
      next: (res) => {
        console.log("Respuesta completa del backend:", res);

        // 🔑 CONTROL DE FORMATO: Revisamos si vino envuelto en 'data' o si vino el usuario directo
        const usuarioEncontrado = res.data ? res.data : res;

        // Validamos si el objeto tiene la cédula correcta según lo que vimos en Compass
        if (usuarioEncontrado && usuarioEncontrado.cedula) {
          
          this.resultado = `✅ Cliente encontrado: ${usuarioEncontrado.nombre}`;
          
          // Guardamos la cédula tal cual está en Compass para que la TAB 2 la herede
          localStorage.setItem('cedula_cliente_activo', usuarioEncontrado.cedula);
          
          // Limpiamos la caja de texto del buscador
          this.cedulaBusqueda = '';

          // 🚀 REDIRECCIÓN INMEDIATA FORZADA A LA TAB 2
          setTimeout(() => {
            this.resultado = '';
            this.router.navigateByUrl('/tabs/tab2').then(nav => {
              if(nav) {
                console.log('Navegación exitosa a TAB 2');
              } else {
                console.error('La navegación falló, revisa las rutas en tabs.routes.ts');
              }
            });
          }, 1000);

        } else {
          this.resultado = '❌ El cliente no existe en la base de datos.';
        }
      },
      error: (err) => {
        this.resultado = '❌ Cliente no registrado o error de conexión con el servidor.';
        console.error("Error de petición HTTP:", err);
      }
    });
  }










































  // Tu función guardarCliente() existente se queda exactamente igual abajo...
  async guardarCliente() {
    if (!this.cedula || !this.nombre || !this.correo) {
      this.resultado = '⚠ Cédula, Nombre y Correo son obligatorios.';
      return;
    }

    const payload = {
      cedula: this.cedula,
      nombre: this.nombre,
      correo: this.correo,
      telefono: this.telefono ? this.telefono : null,
      direccion: this.direccion ? this.direccion : null,
      ciudad: this.ciudad ? this.ciudad : null
    };

    this.resultado = 'Guardando en la base de datos...';

    this.http.post<any>(`${this.URL_API}/`, payload).subscribe({
      next: (response) => {
        this.resultado = `✅ Guardado: ${response.data.nombre}`;
        localStorage.setItem('cedula_cliente_activo', response.data.cedula);
        
        this.cedula = ''; this.nombre = ''; this.correo = '';
        this.telefono = ''; this.direccion = ''; this.ciudad = '';

        setTimeout(() => {
          this.router.navigateByUrl('/tabs/tab2');
        }, 1200);
      },
      error: (err) => {
        this.resultado = '❌ Error al guardar el cliente.';
        console.error(err);
      }
    });
  }
}