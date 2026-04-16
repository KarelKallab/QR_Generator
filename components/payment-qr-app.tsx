"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

type CurrencyCode = "CZK" | "EUR";

type PaymentConfig = {
  currency: CurrencyCode;
  label: string;
  recipient: string;
  accountLabel: string;
  iban?: string;
  bic?: string;
  variableSymbol?: string;
  paymentDueDate?: string;
  enabled: boolean;
};

const PAYMENT_CONFIG: Record<CurrencyCode, PaymentConfig> = {
  CZK: {
    currency: "CZK",
    label: "Ceske koruny",
    recipient: "Charlieczech s.r.o.",
    accountLabel: "3595077018/3030",
    iban: convertCzechAccountToIban("3595077018", "3030"),
    enabled: true
  },
  EUR: {
    currency: "EUR",
    label: "Eura",
    recipient: "Charlieczech s.r.o.",
    accountLabel: "CZ3330300000003595077034",
    iban: "CZ3330300000003595077034",
    bic: "AIRACZPP",
    variableSymbol: "2024000036",
    paymentDueDate: "20260406",
    enabled: true
  }
};

const currencyOptions: CurrencyCode[] = ["CZK", "EUR"];

export function PaymentQrApp() {
  const [currency, setCurrency] = useState<CurrencyCode>("CZK");
  const [amount, setAmount] = useState("1");
  const [note, setNote] = useState("Objednavka Charlieczech");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrError, setQrError] = useState("");

  const config = PAYMENT_CONFIG[currency];

  const normalizedAmount = useMemo(() => parseAmount(amount), [amount]);

  const payload = useMemo(() => {
    if (!config.enabled || normalizedAmount === null) {
      return null;
    }

    if (currency === "EUR") {
      return createQrGeneratorUrl({
        amount: normalizedAmount,
        iban: config.iban ?? "",
        beneficiaryName: config.recipient,
        variableSymbol: config.variableSymbol,
        paymentDueDate: config.paymentDueDate
      });
    }

    return createPaymentPayload({
      amount: normalizedAmount,
      currency,
      note,
      recipient: config.recipient,
      iban: config.iban ?? ""
    });
  }, [config, currency, normalizedAmount, note]);

  useEffect(() => {
    let active = true;

    if (!payload) {
      setQrCodeUrl("");
      setQrError("");
      return () => {
        active = false;
      };
    }

    if (currency === "EUR") {
      setQrError("");
      setQrCodeUrl(payload);

      return () => {
        active = false;
      };
    }

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 520,
      color: {
        dark: "#16110e",
        light: "#f7efe2"
      }
    })
      .then((url) => {
        if (active) {
          setQrError("");
          setQrCodeUrl(url);
        }
      })
      .catch(() => {
        if (active) {
          setQrCodeUrl("");
          setQrError("QR kod se nepodarilo vygenerovat.");
        }
      });

    return () => {
      active = false;
    };
  }, [currency, payload]);

  return (
    <section className="section-shell py-10 sm:py-14 lg:py-20">
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="panel relative overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(26,18,14,0.95),rgba(36,24,19,0.86))] p-6 shadow-glow sm:p-8 lg:p-10">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-lager/10 blur-2xl" />
          <p className="eyebrow relative z-10">QR platba Charlieczech</p>
          <h1 className="display-title relative z-10 mt-5 max-w-[10ch] text-5xl uppercase leading-[0.94] text-cream sm:text-6xl lg:text-7xl">
            Platba bez zdržení
          </h1>
          <p className="relative z-10 mt-5 max-w-2xl text-base leading-8 text-sand/74 sm:text-lg">
            Jednoduchá platební obrazovka pro CZK a EUR. Vyber měnu, zadej částku a případnou poznámku a QR kód se
            přepočítá okamžitě pod formulářem.
          </p>

          <div className="relative z-10 mt-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {currencyOptions.map((option) => {
              const isActive = option === currency;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCurrency(option)}
                  className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition sm:px-6 ${
                    isActive
                      ? "bg-lager text-ink shadow-[0_10px_24px_rgba(217,164,65,0.3)]"
                      : "text-sand/72 hover:bg-white/8 hover:text-cream"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="relative z-10 mt-8 grid gap-4">
            <label className="block">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-sand/54">
                Částka
              </span>
              <div className="flex items-center rounded-[24px] border border-white/10 bg-white/6 px-5 py-4 transition focus-within:border-lager/50 focus-within:bg-white/8">
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-[0.02em] text-cream outline-none placeholder:text-sand/28 sm:text-3xl"
                />
                <span className="ml-4 text-sm font-semibold uppercase tracking-[0.26em] text-sand/62">{currency}</span>
              </div>
            </label>

            <label className="block">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-sand/54">
                Poznámka
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="Například číslo objednávky nebo krátká poznámka"
                className="w-full rounded-[24px] border border-white/10 bg-white/6 px-5 py-4 text-base leading-7 text-cream outline-none transition placeholder:text-sand/28 focus:border-lager/50 focus:bg-white/8"
              />
            </label>
          </div>

          <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
            <InfoPill label="Měna" value={config.currency} />
            <InfoPill label="Příjemce" value={config.recipient} />
            <InfoPill label="Účet" value={config.accountLabel} />
            {currency === "EUR" && config.variableSymbol ? <InfoPill label="VS" value={config.variableSymbol} /> : null}
            {currency === "EUR" && config.paymentDueDate ? <InfoPill label="Splatnost" value={formatDate(config.paymentDueDate)} /> : null}
          </div>
        </div>

        <div className="panel-light paper-panel flex min-h-[560px] flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-10">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7f5a39]">Živý náhled</p>
                <h2 className="mt-3 text-3xl font-semibold text-[#2f2118] sm:text-4xl">QR kód k okamžité platbě</h2>
              </div>
              <div className="rounded-full border border-[#4e3725]/12 bg-[#f8f0e3]/75 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#7f5a39]">
                {config.label}
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[280px_1fr]">
              <div className="rounded-[30px] border border-[#3c2a1c]/14 bg-[#fff8ee]/90 p-5 shadow-card">
                <div className="aspect-square overflow-hidden rounded-[24px] border border-[#3c2a1c]/10 bg-[#f7efe2] p-4">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt={`QR kod pro platbu v mene ${currency}`}
                      className={`h-full w-full object-contain ${currency === "EUR" ? "mix-blend-multiply" : ""}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[18px] bg-[#f4eadc] px-6 text-center text-sm leading-6 text-[#7a5840]">
                      {qrError || "Zadej platnou částku a QR kód se objeví okamžitě."}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <SummaryRow label="Částka" value={normalizedAmount !== null ? `${formatAmount(normalizedAmount)} ${currency}` : "Zadej platnou částku"} />
                <SummaryRow label="Poznámka" value={note.trim() || "Bez poznámky"} />
                <SummaryRow label="Příjemce" value={config.recipient} />
                <SummaryRow label="Účet" value={config.accountLabel} />
                {currency === "EUR" && config.variableSymbol ? <SummaryRow label="VS" value={config.variableSymbol} /> : null}
                {currency === "EUR" && config.paymentDueDate ? <SummaryRow label="Splatnost" value={formatDate(config.paymentDueDate)} /> : null}
                <SummaryRow
                  label="Formát"
                  value={currency === "EUR" ? "Slovenská QR platba (PAY by square)" : "Česká QR platba (SPD)"}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[26px] border border-[#3c2a1c]/12 bg-[#f8efdf]/80 p-5 text-sm leading-7 text-[#5c4331]">
            Návrh je připravený jako jednoduchý responzivní formulář ve vizuálu Charlieczech. CZK používá českou QR
            platbu a EUR generuje funkční slovenský Pay by square.
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sand/48">{label}</p>
      <p className="mt-2 text-sm leading-6 text-cream">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#3c2a1c]/12 bg-[#fff6e8]/74 px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#826143]">{label}</p>
      <p className="mt-2 text-base leading-7 text-[#2f2118]">{value}</p>
    </div>
  );
}

function parseAmount(value: string) {
  const normalized = value.replace(/\s+/g, "").replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function createPaymentPayload({
  amount,
  currency,
  note,
  recipient,
  iban
}: {
  amount: number;
  currency: CurrencyCode;
  note: string;
  recipient: string;
  iban: string;
}) {
  const payload = [
    "SPD*1.0",
    `ACC:${iban}`,
    `AM:${amount.toFixed(2)}`,
    `CC:${currency}`,
    `RN:${sanitizePaymentText(recipient, 35)}`
  ];

  if (note.trim()) {
    payload.push(`MSG:${sanitizePaymentText(note, 60)}`);
  }

  return payload.join("*");
}

function createQrGeneratorUrl({
  amount,
  iban,
  beneficiaryName,
  variableSymbol,
  paymentDueDate
}: {
  amount: number;
  iban: string;
  beneficiaryName: string;
  variableSymbol?: string;
  paymentDueDate?: string;
}) {
  const params = new URLSearchParams({
    iban,
    amount: amount.toFixed(2),
    currency: "EUR",
    size: "512",
    transparent: "false",
    mode: "none"
  });

  if (beneficiaryName) {
    params.set("beneficiary_name", beneficiaryName);
  }

  if (variableSymbol) {
    params.set("vs", variableSymbol);
  }

  if (paymentDueDate) {
    params.set("due_date", formatDateForQrGenerator(paymentDueDate));
  }

  return `https://api.qrgenerator.sk/by-square/pay/qr.png?${params.toString()}`;
}

function formatDate(value: string) {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}`;
  }

  const parts = value.split("-");

  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  return value;
}

function formatDateForQrGenerator(value: string) {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }

  return value;
}

function sanitizePaymentText(value: string, limit: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[*\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function convertCzechAccountToIban(accountNumber: string, bankCode: string, prefix = "") {
  const account = accountNumber.padStart(10, "0");
  const accountPrefix = prefix.padStart(6, "0");
  const bban = `${bankCode}${accountPrefix}${account}`;
  const countryNumeric = "123500";
  const remainder = mod97(`${bban}${countryNumeric}`);
  const checkDigits = String(98 - remainder).padStart(2, "0");

  return `CZ${checkDigits}${bban}`;
}

function mod97(value: string) {
  let remainder = 0;

  for (const char of value) {
    remainder = (remainder * 10 + Number(char)) % 97;
  }

  return remainder;
}
