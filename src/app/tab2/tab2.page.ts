import { Component, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonSelect, 
  IonSelectOption,
  IonLabel
} from '@ionic/angular/standalone'; 

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    NgFor, 
    NgIf,
    JsonPipe,
    FormsModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonSelect, 
    IonSelectOption,
    IonLabel
  ]
})
export class Tab2Page {
  cedulaCliente: string = '';
  marcaSeleccionada: string = '';
  modeloSeleccionado: string = '';
  placa: string = '';
  kilometraje: number | null = null;
  resultado: string = '';

  listaMarcas: any[] = [];
  listaModelos: any[] = [];
  vehiculosIngresados: any[] = [];

  private http = inject(HttpClient);
  private router = inject(Router);
  
  // 🔑 DEFINICIÓN DE URL BASE LIMPIA
  private URL_API = 'http://127.0.0.1:8000/api'; 

  ionViewWillEnter() {
    // Recupera la cédula que seleccionamos en la TAB 1
    this.cedulaCliente = localStorage.getItem('cedula_cliente_activo') || 'No seleccionado';
    this.cargarMarcas();
    this.vehiculosIngresados = []; 
  }

  cargarMarcas() {
    this.resultado = '⏳ Conectando con FastAPI...';
    
    // Forzamos la dirección url exacta del puerto de Uvicorn con barra inclinada final obligatoria
    this.http.get<any>('http://127.0.0.1:8000/api/marcas/').subscribe({
      next: (res) => {
        console.log("📦 Datos brutos recibidos en Ionic:", res);
        
        // Mapeamos si viene envuelto en .data (por el controlador) o directo
        this.listaMarcas = res.data ? res.data : res;

        if (this.listaMarcas.length > 0) {
          this.resultado = '';
        } else {
          this.resultado = '⚠️ El servidor respondió, pero la lista de marcas está vacía.';
        }
      },
      error: (err) => {
        this.resultado = '❌ Error de red: No se pudo conectar al Backend.';
        console.error(err);
      }
    });
  }

  onMarcaChange() {
    this.modeloSeleccionado = '';
    this.listaModelos = [];
    
    if (!this.marcaSeleccionada) return;

    console.log("🔍 Buscando modelos para la marca ID:", this.marcaSeleccionada);

    // Apuntamos al endpoint estructurado con barra al final
    this.http.get<any>(`${this.URL_API}/modelos/marca/${this.marcaSeleccionada}/`).subscribe({
      next: (res) => {
        console.log("📦 RESPUESTA MODELOS DESDE MONGO:", res);
        
        if (res && res.data) {
          this.listaModelos = res.data;
        } else if (Array.isArray(res)) {
          this.listaModelos = res;
        } else {
          this.listaModelos = [];
        }
        
        if (this.listaModelos.length === 0) {
          console.warn("⚠️ No se encontraron modelos para esta marca en MongoDB.");
        }
      },
      error: (err) => {
        this.resultado = '❌ Error al cargar los modelos.';
        console.error("Error cargando modelos:", err);
      }
    });
  }

  async guardarVehiculoActual(terminarFlujo: boolean) {
    if (terminarFlujo && !this.marcaSeleccionada && this.vehiculosIngresados.length > 0) {
      this.avanzarAPaginaTres();
      return;
    }

    if (!this.marcaSeleccionada || !this.modeloSeleccionado || !this.placa || !this.kilometraje) {
      this.resultado = '⚠ Complete todos los datos del vehículo.';
      return;
    }

    const payloadMoto = {
      cedula_cliente: this.cedulaCliente,
      marca_id: this.marcaSeleccionada,
      modelo_id: this.modeloSeleccionado,
      placa: this.placa,
      kilometraje: this.kilometraje
    };

    this.http.post<any>(`${this.URL_API}/motos/`, payloadMoto).subscribe({
      next: (res) => {
        this.vehiculosIngresados.push(payloadMoto);
        this.resultado = `✅ Vehículo ${this.placa} vinculado correctamente.`;

        if (terminarFlujo) {
          this.avanzarAPaginaTres();
        } else {
          this.marcaSeleccionada = '';
          this.modeloSeleccionado = '';
          this.placa = '';
          this.kilometraje = null;
        }
      },
      error: (err) => {
        this.resultado = '❌ No se pudo guardar el vehículo en el servidor.';
        console.error(err);
      }
    });
  }

  avanzarAPaginaTres() {
    localStorage.setItem('motos_sesion', JSON.stringify(this.vehiculosIngresados));
    setTimeout(() => {
      this.resultado = '';
      this.router.navigateByUrl('/tabs/tab3');
    }, 1000);
  }
}