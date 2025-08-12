import ajustePoblacional from '@/utils/ajustePoblacional';

import generateinfluenzaAH1N1 from "@/utils/generateinfluenzaAH1N1";
import generateinfluenzaAH1N1_V from "@/utils/generateInfluenzaAH1N1_V";

import generateinfluenzaAH3N2 from "@/utils/generateinfluenzaAH3N2";
import generateinfluenzaAH3N2_V from "@/utils/generateinfluenzaAH3N2_V";

import generateInfluenzaBVictoria from "@/utils/generateInfluenzaBVictoria";
import generateInfluenzaBVictoria_V from "@/utils/generateInfluenzaBVictoria_V";

// B Yamagata
import generateInfluenzaBYamagata from "@/utils/generateInfluenzaBYamagata";
import generateInfluenzaBYamagata_V from "@/utils/generateInfluenzaBYamagata_V";

// No vacunal
import generateNoVacunal from "@/utils/generateNoVacunal";

const population = 5000;
const levelOfPublicExposure = 2; // bajo = 1 medio = 2 alto = 3
const firstVaccinationDate: string = "2025-05-30";
const firstvaccinatedIndividuals: number = 2000;
const secondVaccinationDate: string = ""; // opcional
const secondvaccinatedIndividuals: number = 0;
const averageDaysOffWork = 5;

// Validar primera fecha
const firstDate = new Date(firstVaccinationDate);
if (isNaN(firstDate.getTime())) {
  throw new Error("❌ La primera fecha no es válida");
}

// Declarar fuera para poder usar después
let secondDate: Date | null = null;

// Validar segunda fecha solo si existe
if (secondVaccinationDate) {
  secondDate = new Date(secondVaccinationDate);

  if (isNaN(secondDate.getTime())) {
    throw new Error("❌ La segunda fecha no es válida");
  }

  if (firstDate.getFullYear() !== secondDate.getFullYear()) {
    throw new Error("❌ Las fechas no son del mismo año");
  }

  if (secondDate <= firstDate) {
    throw new Error("❌ La segunda fecha debe ser mayor que la primera");
  }
}

// Crear objeto final
const vaccinationObject: {
  firstVaccinationDate: Date;
  firstvaccinatedIndividuals: number;
  secondVaccinationDate: Date | null;
  secondvaccinatedIndividuals: number;
} = {
  firstVaccinationDate: firstDate,
  firstvaccinatedIndividuals,
  secondVaccinationDate: secondDate,
  secondvaccinatedIndividuals
};


const ajustePoblacionalResult = ajustePoblacional(population, levelOfPublicExposure);

const influenzaAH1N1 = generateinfluenzaAH1N1(population, ajustePoblacionalResult["A H1N1"]);
const influenzaAH1N1_V = generateinfluenzaAH1N1_V(population, ajustePoblacionalResult["A H1N1"], vaccinationObject);


const influenzaAH3N2 = generateinfluenzaAH3N2(population, ajustePoblacionalResult["A H3N2"]);
const influenzaAH3N2_V = generateinfluenzaAH3N2_V(population, ajustePoblacionalResult["A H3N2"], vaccinationObject);

const influenzaBVictoria = generateInfluenzaBVictoria(population, ajustePoblacionalResult["B Victoria"]);
const influenzaBVictoria_V = generateInfluenzaBVictoria_V(population, ajustePoblacionalResult["B Victoria"], vaccinationObject);


const influenzaBYamagata = generateInfluenzaBYamagata(population, ajustePoblacionalResult["B Yamagata"]);
const influenzaBYamagata_V = generateInfluenzaBYamagata_V(population, ajustePoblacionalResult["B Yamagata"], vaccinationObject);


const noVacunal = generateNoVacunal(population, ajustePoblacionalResult["No vacunal"]);

// Sumar "Casos Nuevos" de cada serie
type SerieItem = { [k: string]: any; "Casos Nuevos": number };
const sumCasosNuevos = (serie: Array<SerieItem>) => serie.reduce((acc, item) => acc + (item["Casos Nuevos"] || 0), 0);

const totalCasosNuevosInfluenzaAH1N1 = sumCasosNuevos(influenzaAH1N1);
const totalCasosNuevosInfluenzaAH1N1_V = sumCasosNuevos(influenzaAH1N1_V);

const totalCasosNuevosInfluenzaAH3N2 = sumCasosNuevos(influenzaAH3N2);
const totalCasosNuevosInfluenzaAH3N2_V = sumCasosNuevos(influenzaAH3N2_V);

const totalCasosNuevosInfluenzaBVictoria = sumCasosNuevos(influenzaBVictoria);
const totalCasosNuevosInfluenzaBVictoria_V = sumCasosNuevos(influenzaBVictoria_V);

const totalCasosNuevosInfluenzaBYamagata = sumCasosNuevos(influenzaBYamagata);
const totalCasosNuevosInfluenzaBYamagata_V = sumCasosNuevos(influenzaBYamagata_V);

const totalCasosNuevosNoVacunal = sumCasosNuevos(noVacunal);

// Totales agrupados por condición de vacunación
const totalCasosNuevosVacunados =
  totalCasosNuevosInfluenzaAH1N1_V +
  totalCasosNuevosInfluenzaAH3N2_V +
  totalCasosNuevosInfluenzaBVictoria_V +
  totalCasosNuevosInfluenzaBYamagata_V +
  totalCasosNuevosNoVacunal;

const totalCasosNuevosNoVacunados =
  totalCasosNuevosInfluenzaAH1N1 +
  totalCasosNuevosInfluenzaAH3N2 +
  totalCasosNuevosInfluenzaBVictoria +
  totalCasosNuevosInfluenzaBYamagata +
  totalCasosNuevosNoVacunal;

// Sintomáticos (redondeados a enteros)
const symptomaticVacunados = Math.round(totalCasosNuevosVacunados * 0.84);
const symptomaticNoVacunados = Math.round(totalCasosNuevosNoVacunados * 0.84);

// Días de incapacidad (redondeados)
const sickDaysVacunados = Math.round(symptomaticVacunados * 0.4865 * averageDaysOffWork);
const sickDaysNoVacunados = Math.round(symptomaticNoVacunados * 0.4865 * averageDaysOffWork);

// Hospitalizaciones (redondeados)
const hospitalizationVacunados = Math.round(symptomaticVacunados * 0.0154);
const hospitalizationNoVacunados = Math.round(symptomaticNoVacunados * 0.0154);

// Mortalidad (redondeados)
const mortalityVacunados = Math.round(symptomaticVacunados * 0.00127);
const mortalityNoVacunados = Math.round(symptomaticNoVacunados * 0.00127);

console.log({
  "vacunados":{
    "nuevos": totalCasosNuevosVacunados,
    "symptomatic": symptomaticVacunados,
    "sickDays": sickDaysVacunados,
    "hospitalization": hospitalizationVacunados,
    "mortality": mortalityVacunados,
  },
  "noVacunados": {
    "nuevos": totalCasosNuevosNoVacunados,
    "symptomatic": symptomaticNoVacunados,
    "sickDays": sickDaysNoVacunados,
    "hospitalization": hospitalizationNoVacunados,
    "mortality": mortalityNoVacunados
  }
});

// GRAFICO
// recorrer influenzaAH1N1 y devolver un array de objetos con los infectados, 