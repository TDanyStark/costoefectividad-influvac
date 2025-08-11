import ajustePoblacional from '@/utils/ajustepoblacional';
import generateinfluenzaAH1N1 from "@/utils/generateinfluenzaAH1N1";
import generateinfluenzaAH1N1_V from "@/utils/generateInfluenzaAH1N1_V";

const population = 5000;
const averageDaysOffWork = 2;
const firstVaccinationDate = "2025-01-01";
const firstvaccinatedIndividuals = 2000;
const secondVaccinationDate = "";
const secondvaccinatedIndividuals = 0;

const vaccinationObject = {
  firstVaccinationDate,
  firstvaccinatedIndividuals,
  secondVaccinationDate,
  secondvaccinatedIndividuals
};

const round2 = (num: number) => Math.round(num * 100) / 100;

const ajustePoblacionalResult = ajustePoblacional(population, averageDaysOffWork);

const influenzaAH1N1 = generateinfluenzaAH1N1(population, ajustePoblacionalResult["A H1N1"]);
const influenzaAH1N1_V = generateinfluenzaAH1N1_V(population, ajustePoblacionalResult["A H1N1"], vaccinationObject);
