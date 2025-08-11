import ajustePoblacional from '@/utils/ajustepoblacional';
import generateinfluenzaAH1N1 from "@/utils/generateinfluenzaAH1N1";

const population = 5000;
const averageDaysOffWork = 2;

const ajustePoblacionalResult = ajustePoblacional(population, averageDaysOffWork);

const influenzaAH1N1 = generateinfluenzaAH1N1(population, ajustePoblacionalResult["A H1N1"]);
