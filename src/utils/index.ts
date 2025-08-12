import ajustePoblacional from '@/utils/ajustepoblacional';

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
import generateNoVacunal_V from "@/utils/generateNoVacunal_V";

const population = 5000;
const averageDaysOffWork = 2;
const firstVaccinationDate: string = "2025-05-30";
const firstvaccinatedIndividuals: number = 2000;
const secondVaccinationDate: string = ""; // opcional
const secondvaccinatedIndividuals: number = 0;

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

console.log("✅ Fechas válidas");

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


const round2 = (num: number) => Math.round(num * 100) / 100;

const ajustePoblacionalResult = ajustePoblacional(population, averageDaysOffWork);

const influenzaAH1N1 = generateinfluenzaAH1N1(population, ajustePoblacionalResult["A H1N1"]);
const influenzaAH1N1_V = generateinfluenzaAH1N1_V(population, ajustePoblacionalResult["A H1N1"], vaccinationObject);


const influenzaAH3N2 = generateinfluenzaAH3N2(population, ajustePoblacionalResult["A H3N2"]);
const influenzaAH3N2_V = generateinfluenzaAH3N2_V(population, ajustePoblacionalResult["A H3N2"], vaccinationObject);

const influenzaBVictoria = generateInfluenzaBVictoria(population, ajustePoblacionalResult["B Victoria"]);
const influenzaBVictoria_V = generateInfluenzaBVictoria_V(population, ajustePoblacionalResult["B Victoria"], vaccinationObject);


const influenzaBYamagata = generateInfluenzaBYamagata(population, ajustePoblacionalResult["B Yamagata"]);
const influenzaBYamagata_V = generateInfluenzaBYamagata_V(population, ajustePoblacionalResult["B Yamagata"], vaccinationObject);


const noVacunal = generateNoVacunal(population, ajustePoblacionalResult["No vacunal"]);
const noVacunal_V = generateNoVacunal_V(population, ajustePoblacionalResult["No vacunal"], vaccinationObject);
