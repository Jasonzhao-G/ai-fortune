import { submitMasterConsult } from "./message-store";
import { saveRecord, buildPersonKey, buildPersonLabel } from "./record-store";
import { saveMasterCrmSubmission } from "./master-crm-store";
import { MASTER_CONSULT_PRICE } from "./master-pay-store";
import type { BirthInfo } from "./types";

export interface MasterConsultFormData {
  userId: string;
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  calendar: "solar" | "lunar";
  question: string;
}

export function submitMasterConsultWithSave(form: MasterConsultFormData) {
  const name = form.name.trim();
  const question = form.question.trim();
  const consult = submitMasterConsult({
    userId: form.userId,
    name,
    birthYear: form.year,
    birthMonth: form.month,
    birthDay: form.day,
    birthHour: form.hour,
    calendar: form.calendar,
    question,
  });
  const birth: BirthInfo = {
    year: form.year,
    month: form.month,
    day: form.day,
    hour: form.hour,
    minute: 0,
    gender: "male",
    name,
    calendar: form.calendar,
  };
  const record = saveRecord({
    type: "master",
    personKey: buildPersonKey(name, birth),
    personName: name,
    personLabel: buildPersonLabel(name, birth),
    title: "真人大师咨询",
    summary: question.slice(0, 60),
    data: {
      question,
      calendar: form.calendar,
      birth,
      status: "pending",
      price: MASTER_CONSULT_PRICE,
      consultId: consult.id,
    },
  });
  saveMasterCrmSubmission({
    userId: form.userId,
    name,
    birthYear: form.year,
    birthMonth: form.month,
    birthDay: form.day,
    birthHour: form.hour,
    calendar: form.calendar,
    question,
    price: MASTER_CONSULT_PRICE,
    consultId: consult.id,
    recordId: record.id,
    birth,
  });
  return { consult, record };
}
