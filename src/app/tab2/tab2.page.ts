import { Component, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
  IonInput, IonButton, IonSelect, IonSelectOption, IonLabel,
  IonList
} from '@ionic/angular/standalone'; 

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, NgFor, NgIf, UpperCasePipe, FormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
    IonInput, IonButton, IonSelect, IonSelectOption, IonLabel,
    IonList
  ]
})
export class Tab2Page {
  cedulaCliente: string = '';
  idClienteMongo: string = ''; 
  marcaSeleccionada: string = '';
  modeloSeleccionado: string = '';
  placa: string = '';
  kilometraje: number | null = null;
  resultado: string = '';

  listaMarcas: any[] = [];
  listaModelos: any[] = [];
  motosHistorial: any[] = []; 
  vehiculosIngresados: any[] = [];

  private http = inject(HttpClient);
  private router = inject(Router);
  private URL_API = 'http://127.0.0.1:8000/api'; 

  ionViewWillEnter() {
    this.cedulaCliente = localStorage.getItem('cedula_cliente_activo') || 'No seleccionado';
    this.idClienteMongo = localStorage.getItem('id_cliente_mongo') || '';
    
    this.cargarMarcas();
    this.vehiculosIngresados = []; 
    this.limpiarFormulario();

    const historial = localStorage.getItem('motos_historial_cliente');
    this.motosHistorial = historial ? JSON.parse(historial) : [];
    console.log("🏍️ Historial mapeado en Tab 2:", this.motosHistorial);
  }

  cargarMarcas() {
    this.http.get<any>(`${this.URL_API}/marcas/`).subscribe({
      next: (res) => {
        this.listaMarcas = res.data ? res.data : res;
      },
      error: (err) => {
        this.resultado = '❌ Error de red: No se pudo conectar al servidor de marcas.';
        console.error(err);
      }
    });
  }

  onMarcaChange() {
    this.modeloSeleccionado = '';
    this.listaModelos = [];
    if (!this.marcaSeleccionada) return;

    this.http.get<any>(`${this.URL_API}/modelos/marca/${this.marcaSeleccionada}/`).subscribe({
      next: (res) => {
        this.listaModelos = res.data ? res.data : res;
      },
      error: (err) => {
        this.resultado = '❌ Error al cargar los modelos.';
        console.error(err);
      }
    });
  }

  cargarMotoDelHistorial(moto: any) {
    this.resultado = `⏳ Sincronizando datos de la placa: ${moto.placa.toUpperCase()}...`;
    
    this.placa = moto.placa;
    this.marcaSeleccionada = moto.marca_id || moto.marca; 
    
    this.http.get<any>(`${this.URL_API}/modelos/marca/${this.marcaSeleccionada}/`).subscribe({
      next: (res) => {
        this.listaModelos = res.data ? res.data : res;
        this.modeloSeleccionado = moto.modelo_id || moto.modelo;
        this.kilometraje = null; 
        this.resultado = `✅ Datos cargados de [ ${moto.placa.toUpperCase()} ]. Ingrese el KILOMETRAJE ACTUAL.`;
      },
      error: (err) => {
        this.resultado = '❌ Error al sincronizar el catálogo de modelos.';
        console.error(err);
      }
    });
  }

  async guardarVehiculoActual(terminarFlujo: boolean) {
    if (terminarFlujo && !this.marcaSeleccionada && this.vehiculosIngresados.length > 0) {
      this.avanzarAPaginaTres();
      return;
    }

    if (!this.marcaSeleccionada || !this.modeloSeleccionado || !this.placa || !this.kilometraje) {
      this.resultado = '⚠ Complete el nuevo kilometraje y los campos del vehículo.';
      return;
    }

    const payloadMoto = {
      usuario_id: this.idClienteMongo, 
      marca_id: this.marcaSeleccionada,   
      modelo_id: this.modeloSeleccionado, 
      marca: this.marcaSeleccionada,      
      modelo: this.modeloSeleccionado,    
      placa: this.placa.trim().toUpperCase(),
      kilometraje: Number(this.kilometraje)
    };

    this.http.post<any>(`${this.URL_API}/motos/`, payloadMoto).subscribe({
      next: (res) => {
        this.vehiculosIngresados.push(payloadMoto);
        this.resultado = `✅ Vehículo ${payloadMoto.placa} registrado para mantenimiento.`;

        if (terminarFlujo) {
          this.avanzarAPaginaTres();
        } else {
          this.limpiarFormulario();
        }
      },
      error: (err) => {
        this.resultado = '❌ Error: No se pudo guardar la moto en la base de datos.';
        console.error("Detalle del error en POST motos:", err);
      }
    });
  }

  limpiarFormulario() {
    this.marcaSeleccionada = '';
    this.modeloSeleccionado = '';
    this.placa = '';
    this.kilometraje = null;
  }

  avanzarAPaginaTres() {
    localStorage.setItem('motos_sesion', JSON.stringify(this.vehiculosIngresados));
    setTimeout(() => {
      this.resultado = '';
      this.router.navigateByUrl('/tabs/tab3');
    }, 1000);
  }
}