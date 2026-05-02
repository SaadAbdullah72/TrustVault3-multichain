import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "vault_balance": "Vault Balance",
      "heartbeat": "Heartbeat",
      "withdraw": "Withdraw",
      "claim": "Claim",
      "copy_addr": "Copy Addr",
      "scan": "Scan",
      "create_vault": "Create Vault",
      "owner": "Owner",
      "beneficiary": "Beneficiary",
      "secured": "Secured",
      "released": "Released",
      "timer_expired": "Timer Expired",
      "no_vault": "No Vault on {{chain}}",
      "create_new_vault": "Create a new vault or scan {{chain}} network to find your vaults.",
      "deploy_on": "Deploy on {{chain}}",
      "beneficiary_address": "Beneficiary Address",
      "timer_seconds": "Timer (seconds)",
      "deposit": "Deposit",
      "syncing": "Syncing with {{chain}}...",
      "incoming_inheritance": "Incoming Inheritance",
      "ready_to_claim": "Ready to Claim",
      "inactivity_timer_expired": "Inactivity timer has expired.",
      "timer_still_active": "Timer still active.",
      "view": "View",
      "full_scan": "Full Scan",
      "my_vaults": "My Vaults ({{chain}})",
      "settings": "Settings",
      "language": "Language",
      "theme": "Theme"
    }
  },
  ur: {
    translation: {
      "vault_balance": "والٹ کا بیلنس",
      "heartbeat": "ہارٹ بیٹ",
      "withdraw": "نکالیں",
      "claim": "کلیم کریں",
      "copy_addr": "ایڈریس کاپی",
      "scan": "سکین",
      "create_vault": "والٹ بنائیں",
      "owner": "مالک",
      "beneficiary": "وارث",
      "secured": "محفوظ",
      "released": "جاری کر دیا گیا",
      "timer_expired": "وقت ختم ہو گیا",
      "no_vault": "{{chain}} پر کوئی والٹ نہیں ہے",
      "create_new_vault": "نیا والٹ بنائیں یا اپنے والٹس تلاش کرنے کے لیے {{chain}} نیٹ ورک کو اسکین کریں۔",
      "deploy_on": "{{chain}} پر لاگو کریں",
      "beneficiary_address": "وارث کا پتہ",
      "timer_seconds": "ٹائمر (سیکنڈ)",
      "deposit": "ڈیپازٹ",
      "syncing": "{{chain}} کے ساتھ ہم وقت سازی ہو رہی ہے...",
      "incoming_inheritance": "آنے والی وراثت",
      "ready_to_claim": "کلیم کے لیے تیار ہے",
      "inactivity_timer_expired": "غیر فعالیت کا وقت ختم ہو گیا ہے۔",
      "timer_still_active": "ٹائمر ابھی فعال ہے۔",
      "view": "دیکھیں",
      "full_scan": "مکمل اسکین",
      "my_vaults": "میرے والٹس ({{chain}})",
      "settings": "ترتیبات",
      "language": "زبان",
      "theme": "تھیم"
    }
  },
  es: {
    translation: {
      "vault_balance": "Saldo de la Bóveda",
      "heartbeat": "Latido",
      "withdraw": "Retirar",
      "claim": "Reclamar",
      "copy_addr": "Copiar Dir",
      "scan": "Escanear",
      "create_vault": "Crear Bóveda",
      "owner": "Propietario",
      "beneficiary": "Beneficiario",
      "secured": "Asegurado",
      "released": "Liberado",
      "timer_expired": "Temporizador Expirado",
      "no_vault": "No hay Bóveda en {{chain}}",
      "create_new_vault": "Cree una nueva bóveda o escanee la red {{chain}} para encontrar sus bóvedas.",
      "deploy_on": "Desplegar en {{chain}}",
      "beneficiary_address": "Dirección del Beneficiario",
      "timer_seconds": "Temporizador (segundos)",
      "deposit": "Depósito",
      "syncing": "Sincronizando con {{chain}}...",
      "incoming_inheritance": "Herencia Entrante",
      "ready_to_claim": "Listo para Reclamar",
      "inactivity_timer_expired": "El temporizador de inactividad ha expirado.",
      "timer_still_active": "El temporizador sigue activo.",
      "view": "Ver",
      "full_scan": "Escaneo Completo",
      "my_vaults": "Mis Bóvedas ({{chain}})",
      "settings": "Ajustes",
      "language": "Idioma",
      "theme": "Tema"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
