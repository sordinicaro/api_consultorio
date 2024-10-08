import * as readline from 'readline';
import * as fs from 'fs';


const rutaJSON = './src/turnos.json';


const leerDatosJSON = () => {
  return JSON.parse(fs.readFileSync(rutaJSON, 'utf-8'));
};

const guardarDatosJSON = (datos: any) => {
  fs.writeFileSync(rutaJSON, JSON.stringify(datos), 'utf-8');
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const mostrarDoctores = (): void => {
  const datosJSON = leerDatosJSON();
  console.log("Lista de Doctores Disponibles:\n");

  datosJSON.consultorio.doctores.forEach((doctor: any, index: number) => {
    console.log(`${index + 1}. ${doctor.nombre} (${doctor.especialidad})`);
  });

  rl.question("\nPor favor, selecciona el número del doctor con el que deseas atenderte: ", (numero: string) => {
    const indiceDoctor = parseInt(numero) - 1;
    
    if (indiceDoctor >= 0 && indiceDoctor < datosJSON.consultorio.doctores.length) {
      const doctorSeleccionado = datosJSON.consultorio.doctores[indiceDoctor];
      console.log(`\nHas seleccionado al ${doctorSeleccionado.nombre}.`);
      mostrarTurnos(doctorSeleccionado);
    } else {
      console.log("\nSelección inválida. Por favor, intenta de nuevo.");
      mostrarDoctores(); 
    }
  });
};


const mostrarTurnos = (doctor: any): void => {
  console.log(`\nTurnos disponibles para el ${doctor.nombre}:`);

  Object.keys(doctor.turnos_disponibles).forEach((dia: string) => {
    const turnos = doctor.turnos_disponibles[dia];
    console.log(`${dia}: ${turnos.join(", ")}`);
  });

  rl.question("\nSelecciona el día para ver los turnos disponibles: ", (dia: string) => {
    if (doctor.turnos_disponibles[dia]) {
      const turnos = doctor.turnos_disponibles[dia];
      console.log(`\nTurnos disponibles para el ${dia}: ${turnos.join(", ")}`);
      elegirTurno(doctor, dia, turnos);
    } else {
      console.log("\nDía inválido. Por favor, intenta de nuevo.");
      mostrarTurnos(doctor);
    }
  });
};


const elegirTurno = (doctor: any, dia: string, turnos: string[]): void => {
  rl.question("\nSelecciona el turno que deseas reservar: ", (turno: string) => {
    if (turnos.includes(turno)) {
      console.log(`\nHas reservado el turno de las ${turno} el ${dia} con el ${doctor.nombre}.`);

    
      doctor.turnos_disponibles[dia] = turnos.filter((t: string) => t !== turno);

      console.log(`\nTurnos restantes para el ${dia}: ${doctor.turnos_disponibles[dia].join(", ")}`);

    
      const datosJSON = leerDatosJSON(); 
      const doctorIndex = datosJSON.consultorio.doctores.findIndex((d: any) => d.nombre === doctor.nombre);
      datosJSON.consultorio.doctores[doctorIndex] = doctor;  
      guardarDatosJSON(datosJSON);  
    } else {
      console.log("\nTurno inválido. Por favor, intenta de nuevo.");
      elegirTurno(doctor, dia, turnos);
    }

    rl.close();
  });
};


mostrarDoctores();
